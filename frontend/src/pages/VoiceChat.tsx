import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useVoiceStream } from '../hooks/useVoiceStream';

const PERSONA_META: Record<string, { emoji: string; color: string; deepColor: string; role: string }> = {
  dad: { emoji: '👨', color: 'var(--sky)', deepColor: 'var(--sky-deep)', role: 'Calm & Steady' },
  mom: { emoji: '👩', color: 'var(--blush)', deepColor: 'var(--peach-deep)', role: 'Warm & Nurturing' },
  grandparent: { emoji: '👴', color: 'var(--lavender)', deepColor: 'var(--lavender-deep)', role: 'Patient & Wise' },
  sibling: { emoji: '👦', color: 'var(--sage)', deepColor: 'var(--sage-deep)', role: 'Casual & Real' },
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  time: string;
}

export default function VoiceChat() {
  const { personaId = 'mom' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userName = searchParams.get('name') || undefined;

  const meta = PERSONA_META[personaId] || PERSONA_META.mom;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(0.3);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [startTime] = useState(Date.now());
  const [moodTrend, setMoodTrend] = useState('Listening...');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isRecording, startRecording, stopRecording, getAudioBlob, error: micError } = useVoiceStream();
  const handleSendRef = useRef<(text: string) => void>(() => {});

  const getTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Init session
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const result = await api.startChat(personaId, userName);
        if (cancelled) return;
        setSessionId(result.sessionId);
        setMessages([{ role: 'assistant', content: result.greeting, time: getTime() }]);
      } catch {
        setMessages([{ role: 'assistant', content: "Hey, I'm here for you. Tell me what's on your mind.", time: getTime() }]);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [personaId, userName]);

  // Send message
  const handleSend = useCallback(async (text: string) => {
    if (!sessionId || !text.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text, time: getTime() }]);
    setIsLoading(true);
    setTextInput('');

    try {
      const result = await api.sendMessage(sessionId, text);
      if (result.emotion) {
        setCurrentEmotion(result.emotion.detected);
        setEmotionIntensity(result.emotion.intensity);
        setMoodTrend(result.emotion.detected === 'joy' ? '↗ Improving' : result.emotion.detected === 'neutral' ? '→ Stable' : '↘ Needs support');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: result.response, emotion: result.emotion?.detected, time: getTime() }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, let me try again. I'm here for you.", time: getTime() }]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  // Keep ref in sync for mic toggle
  handleSendRef.current = handleSend;

  // Toggle recording
  const handleMicToggle = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      // Wait for MediaRecorder's final ondataavailable to fire
      await new Promise((r) => setTimeout(r, 500));
      const audioBlob = getAudioBlob();
      console.log('[Voice] Audio blob:', audioBlob?.size, 'bytes');
      if (!audioBlob || audioBlob.size < 1000) {
        console.warn('[Voice] Audio too short or empty, skipping');
        return;
      }

      setIsTranscribing(true);
      try {
        const resp = await fetch('/api/chat/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: audioBlob,
        });
        const result = await resp.json();
        console.log('[Voice] Transcription result:', result);
        if (result.success && result.transcript?.trim()) {
          handleSendRef.current(result.transcript);
        } else {
          console.warn('[Voice] No transcript in result:', result);
        }
      } catch (err) {
        console.error('[Voice] Transcription failed:', err);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, getAudioBlob, startRecording]);

  const elapsedMin = Math.floor((Date.now() - startTime) / 60000);

  // Emotion bars data
  const emotions = [
    { label: '😟 Anxious', pct: currentEmotion === 'anxiety' ? emotionIntensity * 100 : 15, color: 'var(--peach)' },
    { label: '😔 Sad', pct: currentEmotion === 'sadness' ? emotionIntensity * 100 : 10, color: 'var(--sky)' },
    { label: '😤 Frustrated', pct: currentEmotion === 'anger' || currentEmotion === 'frustration' ? emotionIntensity * 100 : 8, color: 'var(--lavender)' },
    { label: '🙂 Calm', pct: currentEmotion === 'neutral' || currentEmotion === 'joy' ? emotionIntensity * 100 : 20, color: 'var(--sage)' },
  ];

  return (
    <div style={{ height: 'calc(100vh - 65px)', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, animation: 'fadeUp 0.4s ease' }}>
      {/* ── Sidebar ── */}
      <div style={{
        background: 'var(--white)', borderRight: '1px solid rgba(232,196,176,0.4)',
        display: 'flex', flexDirection: 'column', padding: '28px 20px', gap: '20px',
      }}>
        {/* Active persona */}
        <div style={{
          background: 'linear-gradient(135deg, var(--blush), var(--peach))',
          borderRadius: '20px', padding: '24px 20px', textAlign: 'center',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '18px',
            background: 'rgba(255,255,255,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '36px',
            margin: '0 auto 12px',
          }}>{meta.emoji}</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 400, marginBottom: '4px' }}>
            {personaId.charAt(0).toUpperCase() + personaId.slice(1)}
          </div>
          <div style={{
            fontSize: '12px', color: '#3D6B3D', background: 'rgba(200,217,200,0.7)',
            padding: '4px 10px', borderRadius: '50px', display: 'inline-block', fontWeight: 500,
          }}>
            ● {isLoading ? 'Thinking...' : 'Listening'}
          </div>
        </div>

        {/* Live emotion */}
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', paddingLeft: '4px' }}>
          Live emotion
        </div>
        <div style={{ background: 'var(--cream)', borderRadius: '16px', padding: '16px' }}>
          {emotions.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < emotions.length - 1 ? '10px' : 0 }}>
              <span style={{ fontSize: '13px', color: 'var(--text-soft)' }}>{e.label}</span>
              <div style={{ width: '100px', height: '6px', background: 'var(--blush)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '10px', background: e.color, width: `${Math.min(100, e.pct)}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Session info */}
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', paddingLeft: '4px' }}>
          Session
        </div>
        <div style={{ background: 'var(--cream)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Duration', value: `${elapsedMin || '<1'} min` },
            { label: 'Messages', value: `${messages.length}` },
            { label: 'Mood trend', value: moodTrend },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Switch persona */}
        <button
          onClick={() => navigate('/persona')}
          style={{
            background: 'transparent', border: '1.5px solid var(--rose)',
            borderRadius: '12px', padding: '10px', fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px', color: 'var(--text-soft)', cursor: 'pointer',
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px', marginTop: 'auto',
          }}
        >
          ↩ Switch persona
        </button>
      </div>

      {/* ── Chat Main ── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top bar */}
        <div style={{
          padding: '18px 32px', borderBottom: '1px solid rgba(232,196,176,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(253,248,243,0.8)', backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: meta.color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px',
            }}>{meta.emoji}</div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 400 }}>
                {personaId.charAt(0).toUpperCase() + personaId.slice(1)}
                {userName ? ` · ${userName}` : ''}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Feeling: {currentEmotion} {currentEmotion === 'neutral' ? '🌿' : currentEmotion === 'joy' ? '☀️' : '💙'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid var(--rose)', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', cursor: 'pointer', color: 'var(--text-soft)',
                transition: 'all 0.2s ease',
              }}
              title="Session notes"
            >📝</button>
            <button
              onClick={() => navigate('/summary')}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid var(--rose)', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', cursor: 'pointer', color: 'var(--text-soft)',
                transition: 'all 0.2s ease',
              }}
              title="End session"
            >✓</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '28px 32px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          scrollBehavior: 'smooth',
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'flex-end', gap: '10px',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              animation: 'fadeUp 0.3s ease',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: msg.role === 'user' ? '13px' : '16px', flexShrink: 0,
                background: msg.role === 'user' ? 'var(--text)' : meta.color,
                color: msg.role === 'user' ? 'white' : 'inherit',
                fontWeight: msg.role === 'user' ? 600 : 400,
              }}>
                {msg.role === 'user' ? (userName?.[0]?.toUpperCase() || 'You') : meta.emoji}
              </div>
              <div>
                <div style={{
                  maxWidth: '68%', padding: '14px 18px', fontSize: '14px', lineHeight: 1.6,
                  borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                  background: msg.role === 'user' ? 'var(--text)' : 'var(--white)',
                  color: msg.role === 'user' ? 'var(--white)' : 'var(--text)',
                  boxShadow: msg.role === 'user' ? 'none' : '0 2px 12px rgba(45,42,38,0.06)',
                }}>
                  {msg.content}
                </div>
                <div style={{
                  fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>{msg.time}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: meta.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '16px',
              }}>{meta.emoji}</div>
              <div style={{
                display: 'flex', gap: '4px', padding: '14px 18px',
                background: 'var(--white)', borderRadius: '4px 20px 20px 20px',
                boxShadow: '0 2px 12px rgba(45,42,38,0.06)',
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: 'var(--rose)', animation: `bounce 1.2s infinite ease-in-out ${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '16px 24px 20px', borderTop: '1px solid rgba(232,196,176,0.3)',
          background: 'var(--white)',
        }}>
          {/* Voice button row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '36px' }}>
              {[0,1,2,3,4,5,6,7].map((i) => (
                <div key={i} style={{
                  width: '3px', borderRadius: '3px', background: 'var(--sage-deep)',
                  animation: isRecording ? `vwave 0.8s ease-in-out ${i * 0.1}s infinite alternate` : 'none',
                  height: isRecording ? undefined : '6px', opacity: isRecording ? undefined : 0.4,
                }} />
              ))}
            </div>
            <button
              onClick={handleMicToggle}
              disabled={isTranscribing || isLoading}
              style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: isRecording ? '#E84040' : isTranscribing ? '#D4845A' : 'var(--text)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', cursor: isTranscribing ? 'default' : 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(45,42,38,0.2)',
                animation: isRecording ? 'pulse-red 1.5s infinite' : 'none',
              }}
            >
              {isTranscribing ? '⏳' : isRecording ? '⏹' : '🎙️'}
            </button>
            <div style={{ width: '96px', textAlign: 'center', fontSize: '12px', color: isRecording ? '#E84040' : 'var(--text-muted)' }}>
              {isTranscribing ? 'Transcribing…' : isRecording ? 'Listening…' : 'Tap to speak'}
            </div>
          </div>
          {micError && <p style={{ color: '#E84040', fontSize: '12px', textAlign: 'center', marginBottom: '8px' }}>{micError}</p>}

          {/* Text input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--cream)', border: '1.5px solid var(--rose)',
            borderRadius: '50px', padding: '8px 8px 8px 20px',
            transition: 'border-color 0.2s ease',
          }}>
            <input
              type="text"
              placeholder="Or type here if you prefer…"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(textInput); } }}
              disabled={isLoading}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text)',
              }}
            />
            <button
              onClick={() => handleSend(textInput)}
              disabled={!textInput.trim() || isLoading}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--text)', border: 'none', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                cursor: 'pointer', color: 'white', flexShrink: 0,
                transition: 'transform 0.2s ease', opacity: textInput.trim() ? 1 : 0.4,
              }}
            >➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}
