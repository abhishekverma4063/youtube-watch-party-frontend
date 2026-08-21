import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { useSocket } from '../context/SocketContext';
import { Send } from 'lucide-react';

interface Props {
  messages: ChatMessage[];
}

const Chat: React.FC<Props> = ({ messages }) => {
  const { socket } = useSocket();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    socket?.emit('chat_message', { text: inputValue });
    setInputValue('');
  };

  const sendReaction = (emoji: string) => {
    socket?.emit('reaction', { emoji });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 pb-4">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 mt-8 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-indigo-400">{msg.username}</span>
                {msg.role && (
                  <span className={`text-[0.6rem] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${msg.role === 'Host' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'}`}>
                    {msg.role}
                  </span>
                )}
                <span className="text-[0.65rem] text-zinc-500 ml-auto">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="bg-white/5 px-3 py-2 rounded-r-xl rounded-bl-xl mt-1 break-words text-sm text-zinc-200">
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 pt-4 mt-auto">
        <div className="flex gap-2 mb-3">
           {['😂', '❤️', '🔥', '👏', '😲'].map(emoji => (
             <button 
               key={emoji} 
               className="text-xl p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" 
               onClick={() => sendReaction(emoji)}
             >
               {emoji}
             </button>
           ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm" 
            placeholder="Type a message..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={!inputValue.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
