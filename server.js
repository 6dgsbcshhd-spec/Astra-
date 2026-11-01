import express from 'express';
import { WebSocketServer } from 'ws';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'astra-secret';

// ===== POSTGRES =====
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false,
});

// Создаём таблицы и создателя при старте
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      username TEXT UNIQUE,
      avatar TEXT,
      is_creator BOOLEAN DEFAULT FALSE,
      is_anonymous BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'active',
      badges TEXT DEFAULT '[]',
      premium BOOLEAN DEFAULT FALSE,
      stars INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      title TEXT,
      type TEXT DEFAULT 'private',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS chat_members (
      chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (chat_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      text TEXT,
      type TEXT DEFAULT 'text',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const creator = await pool.query('SELECT id FROM users WHERE phone = $1', ['+8888888888']);
  if (creator.rows.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await pool.query(
      'INSERT INTO users (phone, name, username, is_creator, is_anonymous, password) VALUES ($1,$2,$3,$4,$5,$6)',
      ['+8888888888', 'Astra', 'astra', true, true, hash]
    );
    console.log('👑 Создан: +888 888 88 88 / admin123');
  }
}

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'no_token' });
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const r = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    req.user = r.rows[0];
    next();
  } catch { res.status(401).json({ error: 'invalid_token' }); }
};

// ===== AUTH =====
app.post('/api/auth/register', async (req, res) => {
  const { phone, email, password, name } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const username = 'user_' + Math.random().toString(36).slice(2, 8);
    const r = await pool.query(
      'INSERT INTO users (phone, email, password, name, username) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [phone || null, email || null, hash, name || 'User', username]
    );
    const token = jwt.sign({ id: r.rows[0].id }, JWT_SECRET);
    res.json({ token, user: r.rows[0] });
  } catch (e) {
    res.status(400).json({ error: e.message.includes('unique') ? 'phone_or_email_taken' : e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, email, password } = req.body;
  const r = await pool.query(
    'SELECT * FROM users WHERE phone = $1 OR email = $2',
    [phone || '', email || '']
  );
  const user = r.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token, user });
});

app.get('/api/me', auth, (req, res) => res.json({ user: req.user }));

// ===== CHATS =====
app.get('/api/chats', auth, async (req, res) => {
  const r = await pool.query(
    'SELECT c.* FROM chats c JOIN chat_members cm ON c.id = cm.chat_id WHERE cm.user_id = $1 ORDER BY c.created_at DESC',
    [req.user.id]
  );
  res.json({ chats: r.rows });
});

app.post('/api/chats', auth, async (req, res) => {
  const { title, type } = req.body;
  const r = await pool.query(
    'INSERT INTO chats (title, type) VALUES ($1,$2) RETURNING *',
    [title || 'Новый чат', type || 'private']
  );
  await pool.query('INSERT INTO chat_members (chat_id, user_id) VALUES ($1,$2)', [r.rows[0].id, req.user.id]);
  res.json(r.rows[0]);
});

app.get('/api/messages/:chatId', auth, async (req, res) => {
  const r = await pool.query(
    'SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.chat_id = $1 ORDER BY m.created_at ASC',
    [req.params.chatId]
  );
  res.json({ messages: r.rows });
});

// ===== HEALTH =====
app.get('/health', (req, res) => res.json({ ok: true }));

// ===== START =====
await initDb();
const server = app.listen(PORT, () => console.log(`✅ Astra on :${PORT}`));

// ===== WEBSOCKET =====
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  let userId;
  try { userId = jwt.verify(token, JWT_SECRET).id; } catch { return ws.close(); }

  ws.on('message', async (data) => {
    const msg = JSON.parse(data);
    if (msg.type === 'message') {
      const r = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, text, type) VALUES ($1,$2,$3,$4) RETURNING id',
        [msg.chatId, userId, msg.text, msg.msgType || 'text']
      );
      const full = await pool.query(
        'SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = $1',
        [r.rows[0].id]
      );
      wss.clients.forEach((c) => {
        if (c.readyState === 1) c.send(JSON.stringify({ type: 'new_message', message: full.rows[0] }));
      });
    }
    if (msg.type === 'signal') {
      wss.clients.forEach((c) => {
        if (c !== ws && c.readyState === 1) c.send(JSON.stringify(msg));
      });
    }
  });
});

// ===== STATIC =====
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return res.status(404).end();
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
