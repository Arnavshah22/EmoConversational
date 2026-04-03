import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="landing-layout"
      style={{
        minHeight: 'calc(100vh - 65px)', display: 'grid',
        gridTemplateColumns: '1fr 1fr', gap: 0,
        animation: 'fadeUp 0.4s ease',
      }}
    >
      {/* Left side */}
      <div style={{ padding: '80px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'var(--sage)', color: '#3D6B3D', fontSize: '12px', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          padding: '6px 14px', borderRadius: '50px', width: 'fit-content',
        }}>
          <span style={{ fontSize: '8px' }}>●</span> Your safe space to vent
        </div>

        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, color: 'var(--text)' }}>
          A buddy who<br />truly <em style={{ fontStyle: 'italic', color: 'var(--peach-deep)' }}>listens</em><br />without judgment
        </h1>

        <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text-soft)', maxWidth: '420px' }}>
          Talk to a warm, familiar persona — like Mom, Dad, or a sibling — whenever emotions feel overwhelming. No accounts needed, no stigma.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' as const }}>
          <button className="btn-primary" onClick={() => navigate('/persona')}>
            Start talking →
          </button>
          <button className="btn-ghost" onClick={() => navigate('/chat/mom?name=Anonymous')}>
            Try anonymously
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingTop: '8px' }}>
          {[
            { icon: '🔒', text: 'Private & anonymous' },
            { icon: '🤖', text: 'AI-powered' },
            { icon: '💬', text: 'Voice + text' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '15px' }}>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right side — hero card */}
      <div
        className="landing-right-panel"
        style={{
          background: 'linear-gradient(135deg, var(--lavender) 0%, var(--blush) 60%, var(--peach) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', padding: '60px',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          background: 'rgba(255,255,255,0.25)', borderRadius: '50%',
          top: '-100px', right: '-100px',
        }} />
        <div style={{
          position: 'absolute', width: '250px', height: '250px',
          background: 'rgba(255,255,255,0.15)', borderRadius: '50%',
          bottom: '-60px', left: '-60px',
        }} />

        {/* Hero card */}
        <div style={{
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)',
          borderRadius: '32px', padding: '40px', width: '320px',
          boxShadow: 'var(--shadow-soft)', position: 'relative', zIndex: 1,
          animation: 'float 4s ease-in-out infinite',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--peach), var(--rose))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '38px', marginBottom: '16px',
          }}>👩</div>

          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: 400, marginBottom: '6px' }}>
            Hey, I'm Mom 💛
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '20px', lineHeight: 1.5 }}>
            I'm here whenever you need to talk. No advice unless you want it — just a listening ear.
          </p>

          {/* Sample chat bubbles */}
          <div style={{
            background: 'var(--cream)', borderRadius: '16px 16px 16px 4px',
            padding: '12px 16px', fontSize: '13px', color: 'var(--text)',
            lineHeight: 1.5, marginBottom: '10px',
          }}>
            I failed my exam today and I just feel so stupid…
          </div>
          <div style={{
            background: 'var(--blush)', borderRadius: '16px 16px 4px 16px',
            padding: '12px 16px', fontSize: '13px', color: 'var(--text)',
            lineHeight: 1.5, marginBottom: '14px',
          }}>
            Oh sweetheart, one exam doesn't define you. Tell me what happened — I'm listening. 🌸
          </div>

          {/* Wave indicator */}
          <div style={{
            display: 'flex', gap: '3px', alignItems: 'center',
            padding: '10px 14px', background: 'var(--sage)',
            borderRadius: '50px', width: 'fit-content',
          }}>
            {[8, 16, 12, 20, 10].map((h, i) => (
              <div key={i} style={{
                width: '3px', height: `${h}px`, borderRadius: '3px',
                background: 'var(--sage-deep)',
                animation: `wave 1s ease-in-out ${i * 0.1}s infinite`,
              }} />
            ))}
            <span style={{ fontSize: '12px', color: '#3D6B3D', fontWeight: 500, marginLeft: '6px' }}>
              Listening…
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
