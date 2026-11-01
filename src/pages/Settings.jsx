import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';

export default function Settings() {
  const nav = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#2AABEE', padding: '40px 20px 20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#2AABEE', fontWeight: 'bold' }}>A</div>
        <h2 style={{ marginTop: 16, marginBottom: 4, fontSize: 22 }}>Astra Creator</h2>
        <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>+888 888 88 88</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, marginTop: 10, fontSize: 12 }}>
          <Crown size={14} /> Создатель
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>Настройки профиля</div>
          <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>Конфиденциальность</div>
          <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>Оформление</div>
          <div style={{ padding: 16 }}>Звёзды: 0</div>
        </div>

        <button 
          onClick={() => { localStorage.removeItem('token'); nav('/auth'); }}
          style={{ width: '100%', padding: 16, marginTop: 20, background: 'white', borderRadius: 16, color: 'red', border: 'none', fontSize: 16, fontWeight: '600' }}
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
