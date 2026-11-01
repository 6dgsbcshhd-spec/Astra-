import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chats" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chats" element={
          <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>Вы в чатах! 🎉</h1>
            <p>Здесь скоро будет список диалогов.</p>
            <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} style={{ marginTop: 20 }}>
              Выйти
            </button>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
