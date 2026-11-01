import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Chats() {
  const nav = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('GET', '/chats')
      .then((res) => setChats(res.chats))
      .catch(() => {
        localStorage.removeItem('token');
        nav('/auth');
      })
      .finally(() => setLoading(false));
  }, [nav]);

  const createTestChat = async () => {
    try {
      await api('POST', '/chats', { title: 'Мой первый чат', type: 'private' });
      const res = await api('GET', '/chats');
      setChats(res.chats);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Чаты</h1>
        <button 
          onClick={() => { localStorage.removeItem('token'); nav('/auth'); }}
          style={{ padding: '8px 16px', background: '#ffdddd', color: 'red', border: 'none', borderRadius: 8 }}
        >
          Выйти
        </button>
      </div>
      
      <button 
        onClick={createTestChat} 
        style={{ padding: '12px', background: '#1C2B2D', color: 'white', border: 'none', borderRadius: 8, width: '100%', marginBottom: 20, fontSize: 16 }}
      >
        + Создать тестовый чат
      </button>

      {loading ? (
        <p>Загрузка...</p>
      ) : chats.length === 0 ? (
        <p style={{ color: '#888' }}>У вас пока нет чатов. Нажмите кнопку выше.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {chats.map(c => (
            <li key={c.id} style={{ padding: 16, background: 'white', borderBottom: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
              <strong>{c.title}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
