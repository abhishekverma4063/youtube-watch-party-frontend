import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Sparkles } from 'lucide-react';

const EMOJIS = ['🔥', '😂', '😍', '👏', '🎉', '😮', '💯'];

const ReactionPicker: React.FC = () => {
  const { socket } = useSocket();

  const sendReaction = (emoji: string) => {
    socket?.emit('reaction', { emoji });
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <div className="flex items-center gap-1.5 mr-2 text-zinc-400">
        <Sparkles size={16} className="text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-widest">React</span>
      </div>
      
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          className="text-xl hover:scale-125 hover:-translate-y-1 transition-all duration-200 active:scale-95"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
