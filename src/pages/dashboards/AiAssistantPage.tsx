import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { 
  Bot, Send, Plus, Trash2, Pin, MessageSquare, Search, 
  ThumbsUp, ThumbsDown, Copy, Download, Trash, 
  Mic, Paperclip, ChevronLeft, ChevronRight, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AiAssistantPage: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    chatHistory,
    isThinking,
    suggestions,
    selectConversation,
    createConversation,
    deleteConversation,
    togglePinConversation,
    sendThreadMessage,
    submitMessageFeedback,
    clearChat,
  } = useAI();

  const [chatInput, setChatInput] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  // Initial conversation check: if conversations exist but none active, load the first one
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      selectConversation(conversations[0].id);
    }
  }, [conversations, activeConversationId, selectConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    await sendThreadMessage(chatInput);
    setChatInput('');
  };

  const handleSuggestionClick = async (text: string) => {
    await sendThreadMessage(text);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 1500);
  };

  const handleExportChat = () => {
    const rawText = chatHistory
      .map((m) => `[${m.sender.toUpperCase()} - ${m.timestamp.toLocaleTimeString()}] ${m.text}`)
      .join('\n\n');
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `civicmind-chat-${activeConversationId || 'new'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter conversations in sidebar
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  // Filter chat messages
  const filteredMessages = chatHistory.filter((m) =>
    m.text.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border border-white/10 dark:border-white/5 bg-slate-950/40 backdrop-blur-md relative shadow-2xl">
      
      {/* 1. Sidebar Chats Panel */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '280px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col h-full border-r border-white/10 dark:border-white/5 bg-slate-950/65 shrink-0 select-none overflow-hidden"
          >
            {/* Sidebar actions: New Chat */}
            <div className="p-4 border-b border-white/5 flex gap-2 justify-between items-center shrink-0">
              <button
                onClick={() => createConversation('New AI Assistant Chat')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-md cursor-pointer transition-all border-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Sidebar Search */}
            <div className="p-4 border-b border-white/5 relative shrink-0">
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-slate-950/70 border border-white/10 dark:border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50"
              />
              <Search className="w-3.5 h-3.5 text-slate-550 absolute left-7 top-[27px]" />
            </div>

            {/* Threads scroll container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all border ${
                      isActive
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                    }`}
                  >
                    <div
                      onClick={() => selectConversation(conv.id)}
                      className="flex-1 flex items-center gap-2.5 min-w-0 pr-2"
                    >
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold truncate block">{conv.title}</span>
                        <span className="text-[9px] text-slate-500 block truncate mt-0.5">{conv.category}</span>
                      </div>
                    </div>

                    {/* Actions: Pin, Delete */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinConversation(conv.id);
                        }}
                        className={`p-1 hover:text-amber-500 rounded bg-transparent border-0 cursor-pointer ${
                          conv.is_pinned ? 'text-amber-500 opacity-100' : 'text-slate-500'
                        }`}
                      >
                        <Pin className="w-3 h-3 fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-500 rounded bg-transparent border-0 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredConversations.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No conversations found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse/Expand Sidebar Trigger Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute left-[-2px] md:relative md:left-0 z-40 h-10 w-6 border-y border-r border-white/10 dark:border-white/5 bg-slate-900 text-slate-400 hover:text-slate-200 flex items-center justify-center rounded-r-lg self-center cursor-pointer shadow-md"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* 2. Main Chat Console Window */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/20 backdrop-blur-sm relative overflow-hidden">
        
        {/* Chat Window Header */}
        <div className="h-16 px-6 border-b border-white/10 dark:border-white/5 flex justify-between items-center bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold shadow">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-100">
                Citizen Assistant AI
              </h4>
              <span className="text-[9px] text-slate-500 font-semibold block">
                Google ADK + Gemini 2.5 Active
              </span>
            </div>
          </div>

          {/* Action widgets: Search in chat, Clear chat, Export, Auto scroll */}
          <div className="flex items-center gap-2">
            {showChatSearch && (
              <input
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Search messages..."
                className="bg-slate-950/60 border border-white/10 dark:border-white/5 rounded-lg py-1 px-2.5 text-[10px] text-slate-250 placeholder-slate-550 focus:outline-none focus:border-primary/45 w-40"
              />
            )}
            <button
              onClick={() => {
                setShowChatSearch(!showChatSearch);
                setChatSearch('');
              }}
              className={`p-1.5 hover:bg-slate-900 rounded-lg text-slate-450 hover:text-slate-200 border-0 bg-transparent cursor-pointer`}
              title="Search conversation"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportChat}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-450 hover:text-slate-200 border-0 bg-transparent cursor-pointer"
              title="Export Conversation"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={clearChat}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-450 hover:text-slate-200 border-0 bg-transparent cursor-pointer"
              title="Clear Thread"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Welcome Screen when chat history empty */}
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-12">
              <div className="w-14 h-14 rounded-full bg-slate-950/60 border border-white/5 flex items-center justify-center text-slate-400 mb-4 animate-bounce">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                Hello, I am CivicMind AI Assistant
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                How can I assist you with municipal wards, public services, schemes, reporting complaints, or hazard safety guidelines today?
              </p>

              {/* Suggestions prompt list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(sug)}
                    className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-[10px] font-bold text-slate-300 hover:border-primary/20 hover:bg-slate-900/20 text-left transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages list */}
          {(chatSearch ? filteredMessages : chatHistory).map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'self-end ml-auto flex-row-reverse' : 'self-start'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] border shrink-0 ${
                  isUser 
                    ? 'bg-primary/25 border-primary/20 text-primary' 
                    : isSystem 
                    ? 'bg-rose-500/25 border-rose-500/20 text-rose-500' 
                    : 'bg-gradient-to-tr from-primary to-secondary border-transparent text-slate-950'
                }`}>
                  {isUser ? 'U' : isSystem ? 'S' : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble content */}
                <div className="space-y-1">
                  <div className={`rounded-2xl p-4 border relative overflow-hidden group/bubble ${
                    isUser
                      ? 'bg-slate-950/60 border-white/5 text-slate-100 rounded-tr-none'
                      : msg.isSafetyViolation
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 rounded-tl-none'
                      : 'bg-slate-900/30 border-white/10 dark:border-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    {/* Header info */}
                    {!isUser && !isSystem && (
                      <div className="flex items-center justify-between gap-4.5 pb-2 mb-2 border-b border-white/5 text-[9px] font-mono text-slate-500 select-none">
                        <span className="font-extrabold uppercase text-amber-500 tracking-wider">
                          {msg.agentName?.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 bg-slate-950 rounded uppercase text-[8px] font-bold">
                            {msg.category}
                          </span>
                          {msg.confidence !== undefined && (
                            <span className="flex items-center gap-0.5 text-[8px] font-semibold text-slate-400">
                              <Brain className="w-2.5 h-2.5 text-secondary" />
                              {Math.round(msg.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Text Body */}
                    <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {/* Citations index matches */}
                    {msg.knowledgeSources && msg.knowledgeSources.length > 0 && (
                      <div className="mt-3.5 pt-2 border-t border-white/5 space-y-2 select-none">
                        <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest block">
                          Knowledge References
                        </span>
                        <div className="space-y-1.5">
                          {msg.knowledgeSources.map((src, sIdx) => (
                            <div key={sIdx} className="bg-slate-950/40 p-2 border border-white/5 rounded text-[9px] font-semibold leading-relaxed text-slate-400">
                              <div className="flex justify-between items-center font-bold text-slate-300">
                                <span>{src.title}</span>
                                <span className="text-[8px] text-amber-500 uppercase font-mono">{src.category}</span>
                              </div>
                              <p className="mt-0.5 text-slate-500 leading-normal">{src.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar Overlay */}
                    {!isSystem && (
                      <div className="flex items-center gap-2 pt-3 mt-3.5 border-t border-white/5 opacity-0 group-hover/bubble:opacity-100 transition-opacity select-none">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="p-1 hover:text-slate-200 text-slate-500 rounded bg-transparent border-0 cursor-pointer"
                          title="Copy text"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedMessageId === msg.id && (
                          <span className="text-[8px] text-emerald-500 font-bold uppercase">Copied</span>
                        )}

                        {!isUser && (
                          <>
                            <button
                              onClick={() => submitMessageFeedback(Number(msg.id), 'like')}
                              className={`p-1 hover:text-emerald-500 rounded bg-transparent border-0 cursor-pointer ${
                                msg.feedback === 'like' ? 'text-emerald-500' : 'text-slate-500'
                              }`}
                              title="Like"
                            >
                              <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => submitMessageFeedback(Number(msg.id), 'dislike')}
                              className={`p-1 hover:text-rose-500 rounded bg-transparent border-0 cursor-pointer ${
                                msg.feedback === 'dislike' ? 'text-rose-500' : 'text-slate-500'
                              }`}
                              title="Dislike"
                            >
                              <ThumbsDown className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-500 block text-right px-1 select-none">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Thinking typing dots loader */}
          {isThinking && (
            <div className="flex gap-3 self-start max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center border-transparent text-slate-950 font-bold text-[10px] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl rounded-tl-none p-4 py-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input form panel */}
        <div className="p-4 border-t border-white/10 dark:border-white/5 bg-slate-950/50 shrink-0 select-none">
          <form onSubmit={handleSendMessage} className="flex gap-2 relative items-center">
            {/* File Upload Placeholder */}
            <button
              type="button"
              className="p-3 bg-slate-950 border border-white/10 dark:border-white/5 text-slate-500 hover:text-slate-300 rounded-xl shrink-0 transition-colors cursor-pointer"
              title="Attach media (Upload Placeholder)"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me something about CivicMind or report an issue..."
              className="flex-1 bg-slate-950/70 border border-white/10 dark:border-white/5 rounded-xl py-3 px-4 pr-12 text-xs text-slate-200 placeholder-slate-550 focus:outline-none focus:border-primary/50"
            />

            {/* Send / Speech Placeholders */}
            <div className="absolute right-16 top-[7px] flex items-center gap-1.5">
              <button
                type="button"
                className="p-1.5 text-slate-500 hover:text-slate-350 bg-transparent border-0 cursor-pointer"
                title="Voice dictate (Speech Placeholder)"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isThinking || !chatInput.trim()}
              className="p-3 bg-gradient-to-tr from-primary to-secondary disabled:from-slate-800 disabled:to-slate-900 text-white disabled:text-slate-500 rounded-xl shrink-0 cursor-pointer border-0 shadow hover:shadow-md transition-all"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AiAssistantPage;
