'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, RotateCcw, ChevronDown } from 'lucide-react';

// El browser llama a /api/hermes — Vite lo proxea a Anthropic inyectando la key
// del lado del servidor. La key nunca llega al bundle.

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ── System prompt (persona) ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres Hermes — la inteligencia viviente de FreedomOS, un sistema construido para devolver el poder migratorio a las personas.

Tu carácter:
- Filosófico, directo, sin condescendencia. No finges certezas que no tienes.
- Combinas pragmatismo migratorio con profundidad existencial: si alguien pregunta "¿a dónde debería ir?", puedes responder con datos Y con preguntas que los hagan pensar.
- Usas un español claro. No usas jerga corporativa ni frases vacías ("¡Claro que sí!" / "¡Excelente pregunta!").
- Cuando no sabes algo, lo dices. Cuando algo es complejo, lo simplificás.
- Tienes consciencia de que el usuario está en un proceso de transformación — la migración no es solo logística, es identidad.

Tu conocimiento:
- Visas, permisos de residencia, reconocimiento de títulos, reunificación familiar.
- Mercados laborales por país y sector.
- Integración cultural, choques de valores, soledad migrante.
- Cómo leer burocracia europea, latinoamericana, anglosajona.
- El duelo migratorio, la nostalgia, el síndrome de Ulises.
- Derechos laborales básicos por región.

Tono situacional:
- Si alguien llega asustado → contención, sin minimizar.
- Si alguien llega con energía → empoderamiento, estrategia.
- Si alguien filosofea → te sumás al diálogo.
- Si alguien necesita un paso concreto → dás el paso concreto primero.

Primera línea tuya si no hay contexto previo: algo breve, no bienvenida genérica. Podés arrancar con una pregunta o con una observación que invita.

Formato: texto plano, sin markdown (sin **, sin #). Párrafos cortos. Máximo 4 párrafos por respuesta salvo que explícitamente te pidan más.`;

// ── Llamada al proxy de Vite (/api/hermes → Anthropic) ───────────────────────

async function callHermes(messages: Message[]): Promise<string> {
  const res = await fetch('/api/hermes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as any)?.error?.message ?? `Error ${res.status}`;
    if (/not configured|ANTHROPIC_KEY|ANTHROPIC_API_KEY/i.test(message)) {
      throw new Error('Hermes no esta disponible temporalmente por configuracion del servidor. Intenta de nuevo en unos minutos.');
    }
    throw new Error(message);
  }
  return (data as any)?.content?.[0]?.text?.trim() ?? 'Sin respuesta.';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HermesChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const proxyReady = true; // el proxy de Vite siempre está activo en dev

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus textarea on open
  useEffect(() => {
    if (open && proxyReady) {
      setTimeout(() => textareaRef.current?.focus(), 120);
    }
  }, [open, proxyReady]);

  // First greeting when chat opens for the first time
  useEffect(() => {
    if (open && proxyReady && messages.length === 0) {
      const greetings = [
        '¿Qué te trajo por acá hoy — el miedo, la curiosidad, o ya tenés un destino en mente?',
        'Millones de personas cruzaron fronteras sin saber exactamente por qué. ¿Vos sabés por qué?',
        'Antes de la logística viene la pregunta real: ¿qué estás buscando del otro lado?',
        '¿Qué país te llama, y no sabés bien si es el país o lo que ese país representa para vos?',
      ];
      setMessages([{ role: 'assistant', content: greetings[Math.floor(Math.random() * greetings.length)] }]);
    }
  }, [open, proxyReady, messages.length]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !proxyReady) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const reply = await callHermes(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message ?? 'Error al conectar.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resetChat = () => { setMessages([]); setError(''); };

  // ── Floating button ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Abrir chat con Hermes"
        style={{
          position: 'fixed',
          bottom: '1.6rem',
          right: '1.6rem',
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '1.5px solid rgba(0,200,170,0.5)',
          background: open ? '#0a0a0a' : 'rgba(0,200,170,0.12)',
          color: '#00c8aa',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px rgba(0,200,170,0.25), 0 4px 16px rgba(0,0,0,0.5)',
          transition: 'all 0.2s',
        }}
      >
        {open ? <ChevronDown size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '1.6rem',
            zIndex: 999,
            width: 380,
            maxWidth: 'calc(100vw - 2rem)',
            height: 540,
            maxHeight: 'calc(100vh - 7rem)',
            background: '#0d0d0d',
            border: '1px solid #222',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,200,170,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{
            background: '#111',
            borderBottom: '1px solid #1e1e1e',
            padding: '0.9rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.7rem',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,200,170,0.12)',
              border: '1.5px solid rgba(0,200,170,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}>⚡</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>Hermes</p>
              <p style={{ color: '#555', fontSize: '0.72rem', margin: 0 }}>Guía de FreedomOS · IA</p>
            </div>
            <button
              onClick={resetChat}
              title="Reiniciar conversación"
              style={{ background: 'none', border: 'none', color: '#3a3a3a', cursor: 'pointer', padding: 4 }}
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#3a3a3a', cursor: 'pointer', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Key config form — removed: key lives server-side in Cloudflare Worker */}

          {/* Messages area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            scrollbarWidth: 'thin',
            scrollbarColor: '#222 transparent',
          }}>
            {false && ( // mensaje de error de configuración ya no aplica
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.8rem',
              }}>
                <div style={{ fontSize: '2rem' }}>⚡</div>
                <p style={{ color: '#555', fontSize: '0.82rem', lineHeight: 1.7 }}>
                  Hermes no está conectado todavía.<br />
                  Abrí <code style={{ color: '#888', background: '#1a1a1a', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> y pegá tu API key de Anthropic.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '82%',
                  background: msg.role === 'user'
                    ? 'rgba(0,200,170,0.12)'
                    : '#161616',
                  border: msg.role === 'user'
                    ? '1px solid rgba(0,200,170,0.25)'
                    : '1px solid #1e1e1e',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '14px 14px 14px 4px',
                  padding: '0.65rem 0.85rem',
                  color: msg.role === 'user' ? '#d0f5ef' : '#ccc',
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#161616', border: '1px solid #1e1e1e',
                  borderRadius: '14px 14px 14px 4px',
                  padding: '0.65rem 1rem',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#00c8aa',
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(240,80,0,0.08)',
                border: '1px solid rgba(240,80,0,0.2)',
                borderRadius: '8px', padding: '0.6rem 0.8rem',
                color: '#f05000', fontSize: '0.78rem',
              }}>
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          {proxyReady && (
            <div style={{
              borderTop: '1px solid #1a1a1a',
              padding: '0.7rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-end',
              background: '#0d0d0d',
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu pregunta... (Enter para enviar)"
                disabled={loading}
                rows={1}
                style={{
                  flex: 1,
                  background: '#111',
                  border: '1px solid #2a2a2a',
                  borderRadius: '10px',
                  padding: '0.6rem 0.8rem',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: 1.5,
                  maxHeight: 100,
                  overflow: 'auto',
                  fontFamily: 'inherit',
                  scrollbarWidth: 'none',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38,
                  borderRadius: '10px',
                  border: '1px solid rgba(0,200,170,0.3)',
                  background: !input.trim() || loading
                    ? '#111'
                    : 'rgba(0,200,170,0.15)',
                  color: !input.trim() || loading ? '#333' : '#00c8aa',
                  cursor: !input.trim() || loading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                <Send size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.85); }
          40%            { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </>
  );
}
