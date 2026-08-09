'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Menu, 
  X 
} from 'lucide-react';
import { chatService, ChatMessage } from '@/services/chat.service';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'gemini',
      text: 'Hello! I am your AI Study Assistant. What concept, assignment, or topic would you like to explore today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    const newMsgId = Date.now().toString();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message immediately
    const userMessage: ChatMessage = {
      id: newMsgId,
      sender: 'user',
      text: userText,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call backend via chat.service.ts
      const data = await chatService.sendMessage(userText);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: data.response || 'No response received from AI.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: 'Sorry, something went wrong while connecting to the server. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#1F242E] text-[#F3F4F6] overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - History / Navigation */}
      <aside 
        className={`fixed md:relative z-30 w-64 h-full bg-[#181C24] border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#60A5FA]" />
            <span className="font-bold text-lg text-white tracking-wide">AI-StudyHub</span>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <button 
            onClick={() => setMessages([])} 
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-lg transition font-medium text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Chats</p>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#93C5FD] bg-[#1F242E] rounded-md border border-gray-700/50 truncate">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Current Study Session</span>
          </button>
        </div>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          AI-StudyHub v1.0
        </div>
      </aside>

      {/* Main Chat Container */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 bg-[#1F242E]/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#3B82F6]/20 rounded-lg border border-[#3B82F6]/30">
                <Bot className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <div>
                <h1 className="font-semibold text-sm md:text-base text-white">Study Assistant</h1>
                <p className="text-xs text-gray-400">Powered by Gemini AI</p>
              </div>
            </div>
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  msg.sender === 'user' ? 'bg-[#3B82F6]' : 'bg-[#181C24] border border-gray-700'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-[#60A5FA]" />
                )}
              </div>

              {/* Text Bubble */}
              <div className="flex flex-col space-y-1 max-w-[85%] md:max-w-[75%]">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#3B82F6] text-white rounded-tr-none'
                      : 'bg-[#181C24] text-[#F3F4F6] border border-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span
                  className={`text-[10px] text-gray-500 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-[#181C24] border border-gray-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#60A5FA]" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-[#181C24] border border-gray-800 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#60A5FA] animate-spin" />
                <span className="text-sm text-gray-400">Gemini is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input Field */}
        <div className="p-4 border-t border-gray-800 bg-[#1F242E]">
          <form 
            onSubmit={handleSendMessage} 
            className="max-w-3xl mx-auto relative flex items-center"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about your studies..."
              disabled={isLoading}
              className="w-full bg-[#181C24] text-[#F3F4F6] placeholder-gray-500 text-sm rounded-xl pl-4 pr-12 py-3.5 border border-gray-700/60 focus:outline-none focus:border-[#3B82F6] transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 p-2 bg-[#3B82F6] hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-center text-gray-500 mt-2">
            AI can make mistakes. Verify important study details.
          </p>
        </div>

      </main>
    </div>
  );
}