import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, X, Bot, Sparkles, Send, Trash2, 
  ExternalLink, Key, RefreshCw, ChevronRight, CheckCircle2, MessageCircle
} from 'lucide-react';
import { fetchWatches } from '../utils/api';
import { formatPrice, getImageUrl, getMessengerUrl, getWhatsAppUrl } from '../utils/format';
import { 
  sendAiAgentMessage, 
  getAiApiKeyConfig, 
  extractWatchCardsFromText 
} from '../services/aiAgentService';

export default function FloatingAiAgent() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTooltipClosing, setIsTooltipClosing] = useState(false);
  
  const [watches, setWatches] = useState([]);
  const [loadingWatches, setLoadingWatches] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const apiConfig = getAiApiKeyConfig();

  // Load catalog on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      setLoadingWatches(true);
      try {
        const res = await fetchWatches();
        if (isMounted && res && Array.isArray(res.watches)) {
          setWatches(res.watches);
        }
      } catch (err) {
        console.warn('Failed to load watches for AI Agent context:', err);
      } finally {
        if (isMounted) setLoadingWatches(false);
      }
    }
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  // Pop out tooltip bubble after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Auto-hide tooltip after 7 seconds
  useEffect(() => {
    if (showTooltip && !isTooltipClosing && !isOpen) {
      const autoHideTimer = setTimeout(() => {
        closeTooltip();
      }, 7000);
      return () => clearTimeout(autoHideTimer);
    }
  }, [showTooltip, isTooltipClosing, isOpen]);

  // Initialize initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const watchCountText = watches.length > 0 ? `all ${watches.length}` : 'all active';
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: `Hello! 👋 Welcome to WatchLab Cebu.\n\nI am your **AI Watch Specialist**. I have real-time access to **${watchCountText} luxury watches** in our system database.\n\nAsk me anything about our Rolex, Patek Philippe, Audemars Piguet, Omega models, pricing, or conditions!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [watches]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 200);
      }
    }
  }, [messages, isOpen, isThinking]);

  const closeTooltip = () => {
    if (isTooltipClosing) return;
    setIsTooltipClosing(true);
    setTimeout(() => {
      setShowTooltip(false);
      setIsTooltipClosing(false);
    }, 350);
  };

  const handleToggleChat = () => {
    setShowTooltip(false);
    setIsOpen(prev => !prev);
  };

  const handleClearChat = () => {
    const watchCountText = watches.length > 0 ? `all ${watches.length}` : 'all active';
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat history cleared. I'm ready to assist you with any questions about our **${watchCountText} luxury watches**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (textToSend = null) => {
    const messageText = textToSend || inputValue;
    if (!messageText || !messageText.trim() || isThinking) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsThinking(true);

    try {
      // Build history for API
      const historyForApi = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendAiAgentMessage({
        userMessage: messageText.trim(),
        history: historyForApi,
        watches
      });

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        hasApiKey: response.hasApiKey,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error in AI message handler:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I ran into an issue searching our catalog. Please try again or reach out to our human concierge.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestionChips = [
    { label: '⌚ Rolex Models', query: 'Show all Rolex watches in stock' },
    { label: '✨ Brand New', query: 'List all Brand New watches available' },
    { label: '🏷️ Under ₱500,000', query: 'Which watches are priced under ₱500,000?' },
    { label: '💎 Pre-Owned Deals', query: 'What pre-owned luxury watches do you have?' }
  ];

  // Render text content formatted with bold syntax and removes tags
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    // Remove [WATCH_ID:xxx] tags from the visible text since watch cards handle them visually
    const cleanText = text.replace(/\[WATCH_ID:\d+\]/g, '').trim();

    const paragraphs = cleanText.split('\n\n');
    return paragraphs.map((para, idx) => {
      const lines = para.split('\n');
      return (
        <p key={idx} style={{ marginBottom: idx === paragraphs.length - 1 ? 0 : '8px', lineHeight: '1.5' }}>
          {lines.map((line, lineIdx) => {
            // Convert **text** to bold
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <React.Fragment key={lineIdx}>
                {parts.map((part, partIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={partIdx} style={{ fontWeight: 700, color: 'var(--maroon-primary)' }}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 99999 }}>
      {/* Floating Styles */}
      <style>{`
        @keyframes aiPopIn {
          0% { opacity: 0; transform: scale(0.3) translateY(30px); }
          70% { transform: scale(1.03) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes aiZoomOut {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.2) translateY(30px); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>

      {/* Tooltip Speech Bubble when closed */}
      {showTooltip && !isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '72px',
          right: '0',
          background: '#FFFFFF',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '12px 16px',
          boxShadow: '0 12px 35px rgba(127, 29, 29, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '280px',
          transformOrigin: 'bottom right',
          animation: isTooltipClosing
            ? 'aiZoomOut 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'aiPopIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--maroon-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(127, 29, 29, 0.3)'
          }}>
            <Sparkles size={20} />
          </div>

          <div style={{ flexGrow: 1, cursor: 'pointer' }} onClick={handleToggleChat}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--maroon-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              WatchLab AI Agent
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              Ask me about all {watches.length > 0 ? watches.length : ''} watches in stock & prices!
            </div>
          </div>

          <button
            onClick={closeTooltip}
            aria-label="Close AI Chat Tooltip"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main AI Chat Drawer/Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: 'calc(100vw - 32px)',
          maxWidth: '430px',
          height: '620px',
          maxHeight: 'calc(100vh - 120px)',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(127, 29, 29, 0.25), 0 8px 24px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'aiPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          transformOrigin: 'bottom right',
          zIndex: 999999
        }}>
          {/* Header Bar */}
          <div style={{
            background: 'var(--maroon-gradient)',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#FFFFFF',
                color: 'var(--maroon-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                <Bot size={24} />
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#22C55E',
                  border: '2px solid #FFFFFF'
                }} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  WatchLab AI Concierge
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 500 }}>
                  Online • Luxury Watch Specialist
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={handleToggleChat}
                aria-label="Close Chat Window"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Message Scroll Area */}
          <div style={{
            flexGrow: 1,
            padding: '16px',
            overflowY: 'auto',
            background: 'var(--bg-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Quick Suggestion Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={isThinking}
                  style={{
                    whiteSpace: 'nowrap',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--maroon-primary)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Messages List */}
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const extractedCards = !isUser ? extractWatchCardsFromText(msg.content, watches) : [];

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    background: isUser ? 'var(--maroon-gradient)' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                    border: isUser ? 'none' : '1px solid var(--border-glass)',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '12px 16px',
                    fontSize: '0.88rem',
                    boxShadow: isUser ? '0 4px 12px rgba(127, 29, 29, 0.25)' : '0 4px 12px rgba(0,0,0,0.05)',
                    wordBreak: 'break-word'
                  }}>
                    {isUser ? msg.content : renderFormattedText(msg.content)}
                  </div>

                  {/* Render Watch Cards if AI referenced specific watches */}
                  {extractedCards.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginTop: '8px',
                      width: '100%'
                    }}>
                      {extractedCards.map(w => (
                        <div
                          key={w.id}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '14px',
                            padding: '10px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            boxShadow: '0 4px 12px rgba(127, 29, 29, 0.08)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <img
                            src={getImageUrl(w.image_url)}
                            alt={w.name}
                            style={{
                              width: '56px',
                              height: '56px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1px solid var(--border-glass)'
                            }}
                          />
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--maroon-primary)', textTransform: 'uppercase' }}>
                              {w.brand}
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {w.name}
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--maroon-primary)' }}>
                              {formatPrice(w.price)}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                navigate(`/watch/${w.id}`);
                              }}
                              style={{
                                background: 'var(--maroon-gradient)',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                padding: '6px 10px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              View <ChevronRight size={12} />
                            </button>
                            <a
                              href={getWhatsAppUrl(w.name, w.price)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#25D366',
                                color: '#FFFFFF',
                                borderRadius: '14px',
                                padding: '5px 8px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                textAlign: 'center'
                              }}
                            >
                              Inquire
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    marginTop: '3px',
                    padding: '0 4px'
                  }}>
                    {msg.timestamp}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Typing indicator */}
            {isThinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Searching catalog...</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--maroon-primary)',
                          animation: 'typingBounce 1.4s infinite ease-in-out',
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div style={{
            background: '#FFFFFF',
            borderTop: '1px solid var(--border-glass)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about watches, prices, specs..."
                disabled={isThinking}
                style={{
                  flexGrow: 1,
                  background: 'var(--bg-light)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '24px',
                  padding: '10px 16px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isThinking}
                aria-label="Send Message"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: inputValue.trim() && !isThinking ? 'var(--maroon-gradient)' : '#E5E7EB',
                  color: inputValue.trim() && !isThinking ? '#FFFFFF' : '#9CA3AF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputValue.trim() && !isThinking ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <Send size={18} />
              </button>
            </div>

            {/* Direct Human Fallback Links */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)'
            }}>
              <span>Prefer human concierge?</span>
              <a
                href={getMessengerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0084FF', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <MessageCircle size={12} /> Messenger
              </a>
              <span>•</span>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <MessageSquare size={12} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Circle Button - MATCHES USER SCREENSHOT PIXEL PERFECT */}
      <button
        onClick={handleToggleChat}
        aria-label="Open AI Watch Specialist Chat"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: 'var(--maroon-gradient)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(127, 29, 29, 0.45)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <>
            <MessageSquare size={28} fill="currentColor" />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#22C55E',
              border: '2px solid #FFFFFF',
              boxShadow: '0 0 8px #22C55E'
            }} />
          </>
        )}
      </button>
    </div>
  );
}
