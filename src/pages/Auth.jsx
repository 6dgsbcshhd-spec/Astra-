import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errText } from '../lib/api';

export default function Auth() {
  const nav = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const r = await api('POST', endpoint, { phone, password, name: 'Пользователь' });
      localStorage.setItem('token', r.token);
      nav('/chats', { replace: true }); // Пока просто перекинем в чаты
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Astra</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
        {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
      </p>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input 
          type="tel" 
          placeholder="+7 900 000-00-00" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          required 
          style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
        />
        
        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        
        <button 
          type="submit" 
          disabled={busy} 
          style={{ padding: 12, borderRadius: 8, background: '#1C2B2D', color: 'white', fontSize: 16, border: 'none', cursor: 'pointer' }}
        >
          {busy ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
        {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#0077FF', cursor: 'pointer', fontWeight: 'bold' }}>
          {isLogin ? 'Создать' : 'Войти'}
        </button>
      </p>
    </div>
  );
}
