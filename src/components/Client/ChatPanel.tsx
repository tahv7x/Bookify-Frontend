import { useState, useRef, useEffect } from 'react';
import { X, Send, Clock, ExternalLink } from 'lucide-react';
import { getConversation, sendMessage } from '../../services/Client/messageService';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logoLight from '../../assets/LogoB.png';
import logoDark from '../../assets/LogoW.png';

interface Message {
  id: number;
  senderId: 'client' | 'provider';
  content: string;
  sentAt: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: number;
    userId: number;
    name: string;
    title: string;
    image: string;
    responseTime: string;
  } | null;
}

export default function ChatPanel({ isOpen, onClose, provider }: ChatPanelProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const providerRef = useRef(provider);
  const previousMessagesLengthRef = useRef(0);

  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  const fetchMessages = async (showLoading = true) => {
    const currentProvider = providerRef.current;
    if (!currentProvider) return;
    
    try {
      if (showLoading) setLoading(true);
      const data = await getConversation(currentProvider.userId);
      
      if (providerRef.current?.userId !== currentProvider.userId) return;

      const mapped: Message[] = data.map((m: any) => ({
        id: m.id,
        senderId: m.senderId === currentProvider.userId ? 'provider' : 'client',
        content: m.content,
        sentAt: new Date(m.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(mapped);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && provider) {
      fetchMessages(true);
      const interval = setInterval(() => {
        fetchMessages(false);
      }, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, provider]);

  useEffect(() => {
    if (isOpen) {
      const container = messagesContainerRef.current;
      if (!container) return;

      const isScrolledToBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      const hasNewMessages = messages.length > previousMessagesLengthRef.current;

      if (isScrolledToBottom || hasNewMessages) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      
      previousMessagesLengthRef.current = messages.length;
    }
  }, [isOpen, messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !provider || isSending) return;

    setIsSending(true);
    const tempId = Date.now();
    const newMsg: Message = {
      id: tempId,
      senderId: 'client',
      content: trimmed,
      sentAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    try {
      await sendMessage(provider.userId, trimmed);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!provider) return null;

  return (
    <>
      <style>{`
        .glass-panel {
          background: ${theme === 'dark' ? 'rgba(15, 17, 23, 0.75)' : 'rgba(255, 255, 255, 0.75)'};
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-left: 1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)'};
        }
        .msg-bubble-c {
          background: linear-gradient(135deg, #0059B2, #1A6FD1);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .msg-bubble-p {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
          border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          color: ${theme === 'dark' ? '#E5E7EB' : '#1F2937'};
          border-bottom-left-radius: 4px;
        }
        .input-glass {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)'};
          backdrop-filter: blur(12px);
          border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'};
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-[70] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full glass-panel shadow-2xl rounded-l-3xl overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-4 flex items-center gap-4 shrink-0 border-b border-gray-200/20 dark:border-white/5 bg-white/20 dark:bg-black/20">
            <div className="relative shrink-0">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-12 h-12 rounded-2xl object-cover shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0f1117] rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white font-bold text-base truncate">{provider.name}</p>
              <p className="text-[#1A6FD1] dark:text-blue-400 text-xs font-semibold truncate">{provider.title}</p>
            </div>
            
            <button
              onClick={() => {
                onClose();
                navigate('/Messages');
              }}
              title="Voir dans l'espace messages"
              className="flex items-center justify-center gap-1.5 bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              <span className="text-xs text-gray-700 dark:text-gray-300 font-bold whitespace-nowrap">Ouvrir</span>
              <ExternalLink size={14} className="text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-all shrink-0 ml-1 text-gray-500 dark:text-gray-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Response Time Banner */}
          <div className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shrink-0">
            <Clock size={13} className="text-amber-600 dark:text-amber-400 shrink-0"/>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 tracking-wide uppercase">{provider.responseTime}</span>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-5 py-6 space-y-5 custom-scrollbar"
          >
            {loading && messages.length === 0 ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-[#1A6FD1] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center flex flex-col items-center justify-center h-full text-gray-400 text-xs gap-3">
                <img src={theme === 'dark' ? logoDark : logoLight} alt="Bookify" className="w-16 h-auto mb-2 opacity-50 grayscale" />
                <p>Aucun message avec {provider.name}</p>
                <p className="text-[10px]">Envoyez un message pour démarrer la discussion.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center my-4">
                  <div className="px-3 py-1 rounded-full bg-gray-100/80 dark:bg-white/5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest backdrop-blur-sm">
                    Aujourd'hui
                  </div>
                </div>

                {messages.map((msg, idx) => {
                  const isClient = msg.senderId === 'client';
                  const showAvatar = !isClient && (idx === messages.length - 1 || messages[idx + 1]?.senderId === 'client');
                  
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isClient ? 'flex-row-reverse' : 'flex-row'}`}>
                      {showAvatar ? (
                        <img src={provider.image} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 shadow-sm"/>
                      ) : !isClient ? (
                        <div className="w-6 h-6 shrink-0" />
                      ) : null}
                      
                      <div className={`group max-w-[80%] flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isClient ? 'msg-bubble-c' : 'msg-bubble-p'}`}>
                          {msg.content}
                        </div>
                        {/* Only show time on the last message of a group */}
                        {(idx === messages.length - 1 || messages[idx + 1]?.senderId !== msg.senderId) && (
                          <p className="text-[10px] text-gray-400/80 dark:text-gray-500 mt-1 font-semibold px-1">
                            {msg.sentAt}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input Area */}
          <div className="px-4 py-4 shrink-0 bg-white/30 dark:bg-black/30 border-t border-gray-200/20 dark:border-white/5">
            <div className="flex items-end gap-2 input-glass rounded-2xl px-2 py-2 focus-within:ring-2 focus-within:ring-[#1A6FD1]/30 transition-all shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                rows={1}
                className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white outline-none resize-none placeholder-gray-500 dark:placeholder-gray-400 font-medium px-2 py-2 custom-scrollbar"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#0059B2] to-[#1A6FD1] flex items-center justify-center disabled:opacity-50 hover:shadow-lg hover:shadow-[#1A6FD1]/30 transition-all mb-0.5 mr-0.5"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={16} className="text-white ml-0.5"/>
                )}
              </button>
            </div>
            <div className="flex justify-center mt-2">
              <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                🔒 Sécurisé par Bookify
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
