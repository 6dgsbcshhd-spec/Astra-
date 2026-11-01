import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { MessageCircle, Users, Phone, Settings, Search, Edit3, Plus } from 'lucide-react';

export default function Chats() {
  const nav = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('GET', '/chats')
      .then((res) => setChats(res.chats))
      .catch(() => { localStorage.removeItem('token'); nav('/auth'); })
      .finally(() => setLoading(false));
  }, [nav]);

  const createTestChat = async () => {
    try {
      await api('POST', '/chats', { title: 'Тестовый чат', type: 'private' });
      const res = await api('GET', '/chats');
      setChats(res.chats);
    } catch (e) { alert('Ошибка: ' + e.message); }
  };

  const TabBar = () => (
    <div style={{ position: 'fixed', bottom: 20, left: 20, right: 20, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: 30, display: 'flex', justifyContent: 'space-around', padding: '12px 0', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#888', fontSize: 10, gap: 4 }}><Users size={20} /><span>Контакты</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#888', fontSize: 10, gap: 4 }}><Phone size={20} /><span>Звонки</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#1C2B2D', fontSize: 10, gap: 4, fontWeight: 'bold' }}><MessageCircle size={20} /><span>Чаты</span></div>
      <div onClick={() => nav('/settings')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#888', fontSize: 10, gap: 4, cursor: 'pointer' }}><Settings size={20} /><span>Настройки</span></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', fontFamily: 'sans-serif', paddingBottom: 100 }}>
      {/* Шапка */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 10px' }}>
        <span style={{ color: '#0077FF', fontSize: 16 }}>Изм.</span>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#1C2B2D' }}>Чаты</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: 'white', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}><Search size={18} color="#1C2B2D" /></button>
          <button onClick={createTestChat} style={{ background: '#1C2B2D', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}><Plus size={18} /></button>
        </div>
      </header>

      {/* Истории (Заглушка) */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '10px 20px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#2AABEE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 'bold' }}>#</div>
          <span style={{ fontSize: 10, color: '#666' }}>Моя история</span>
        </div>
      </div>

      {/* Поиск */}
      <div style={{ padding: '0 20px 10px' }}>
        <div style={{ background: 'white', padding: '10px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#999', fontSize: 15 }}>
          <Search size={16} /> Поиск
        </div>
      </div>

      {/* Список чатов */}
      <div style={{ padding: '0 20px' }}>
        {loading ? <p style={{ textAlign: 'center', color: '#999' }}>Загрузка...</p> : chats.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
            <p>У вас пока нет чатов.</p>
            <p style={{ fontSize: 12 }}>Нажмите на плюсик справа сверху, чтобы создать первый.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            {chats.map((c, i) => (
              <div key={c.id} style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, borderBottom: i !== chats.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#666' }}>
                  {c.title.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: 16, color: '#1C2B2D' }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>Нет сообщений</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}
