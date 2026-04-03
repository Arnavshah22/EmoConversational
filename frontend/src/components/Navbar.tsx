import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  
  { label: '① Landing', path: '/landing' },
  { label: '② Persona Select', path: '/persona' },
  { label: '③ Voice Chat', path: '/chat/mom' },
  { label: '④ Mood Summary', path: '/summary' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.replace('/mom', ''));
  };

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 40px', position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(253,248,243,0.85)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(232,196,176,0.3)',
    }}>
      <div
        style={{
          fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: 600,
          color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <span style={{ fontSize: '24px' }}>🧠</span> EmoCompanion
      </div>

      <div style={{
        display: 'flex', gap: '4px', background: 'var(--blush)',
        padding: '5px', borderRadius: '50px',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              padding: '8px 20px', borderRadius: '50px', border: 'none',
              background: isActive(tab.path) ? 'var(--white)' : 'transparent',
              fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500,
              color: isActive(tab.path) ? 'var(--text)' : 'var(--text-soft)',
              cursor: 'pointer', transition: 'all 0.25s ease', whiteSpace: 'nowrap',
              boxShadow: isActive(tab.path) ? '0 2px 12px rgba(45,42,38,0.1)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
