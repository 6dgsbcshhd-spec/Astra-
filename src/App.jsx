import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth.jsx';
import Chats from './pages/Chats.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chats" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chats" element={<Chats />} />
      </Routes>
    </BrowserRouter>
  );
}
