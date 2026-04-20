import { useState, useRef, useEffect } from 'react'
import api from '../utils/api'

const SUGGESTED = [
  'What services do you offer?',
  'How do I book a service?',
  'Do you have any coupons?',
  'How does payment work?',
]

export default function AIChatBubble() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    {
      role:    'assistant',
      content: 'Hi! 👋 I\'m ServeNow\'s AI assistant. How can I help you today?'
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread]   = useState(0)
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return

    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/ai/chat', {
        messages: newMessages.filter(m => m.role !== 'system')
      })
      const reply = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, reply])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Sorry, I\'m having trouble right now. Please try again in a moment.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
          width: 360, height: 520,
          background: 'white', borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp .25s ease'
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18
              }}>🤖</div>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>
                  ServeNow AI
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#4ade80'
                  }}/>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: 0 }}>
                    Online · Replies instantly
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: '50%', width: 30, height: 30,
              color: 'white', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>×</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 12
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {m.role === 'assistant' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#667eea,#764ba2)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 14,
                    marginRight: 8, flexShrink: 0, alignSelf: 'flex-end'
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user'
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg,#667eea,#764ba2)'
                    : '#f1f5f9',
                  color: m.role === 'user' ? 'white' : '#1e293b',
                  fontSize: 14, lineHeight: 1.5
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#667eea,#764ba2)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14
                }}>🤖</div>
                <div style={{
                  background: '#f1f5f9', borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px', display: 'flex', gap: 4
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#94a3b8',
                      animation: `bounce .8s ${i * 0.15}s infinite`
                    }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested questions — show only at start */}
            {messages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                  Suggested questions:
                </p>
                {SUGGESTED.map(q => (
                  <button key={q} onClick={() => sendMessage(q)} style={{
                    background: 'white', border: '1.5px solid #e2e8f0',
                    borderRadius: 12, padding: '8px 12px',
                    fontSize: 13, color: '#667eea', cursor: 'pointer',
                    textAlign: 'left', transition: 'all .15s',
                    fontWeight: 500
                  }}
                  onMouseEnter={e => e.target.style.borderColor = '#667eea'}
                  onMouseLeave={e => e.target.style.borderColor = '#e2e8f0'}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: 8, alignItems: 'center'
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              disabled={loading}
              style={{
                flex: 1, padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12, fontSize: 14,
                outline: 'none', transition: 'border .2s',
                background: loading ? '#f8fafc' : 'white'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: input.trim()
                  ? 'linear-gradient(135deg,#667eea,#764ba2)'
                  : '#e2e8f0',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16,
                transition: 'all .2s', flexShrink: 0
              }}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Bubble Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          zIndex: 1001,
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg,#667eea,#764ba2)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24,
          transition: 'transform .2s',
          transform: open ? 'rotate(0deg)' : 'rotate(0deg)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '🤖'}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 20, height: 20, borderRadius: '50%',
            background: '#ef4444', color: 'white',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white'
          }}>{unread}</div>
        )}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>
    </>
  )
}