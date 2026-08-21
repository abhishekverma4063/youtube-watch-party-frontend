import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

interface Reaction {
  id: string;
  emoji: string;
  username: string;
  xOffset: number; // random horizontal offset
}

const LiveReactions: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReaction = (data: { userId: string, username: string, emoji: string }) => {
      const newReaction: Reaction = {
        id: `${Date.now()}-${Math.random()}`,
        emoji: data.emoji,
        username: data.username,
        xOffset: Math.floor(Math.random() * 40) - 20, // -20px to 20px
      };
      
      setReactions(prev => [...prev, newReaction]);
      
      // Remove after animation completes (3 seconds)
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== newReaction.id));
      }, 3000);
    };

    socket.on('reaction', handleReaction);
    return () => {
      socket.off('reaction', handleReaction);
    };
  }, [socket, isConnected]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {reactions.map(r => (
        <div 
          key={r.id} 
          className="absolute bottom-0 left-1/2 flex flex-col items-center animate-float-up opacity-0"
          style={{ transform: `translateX(calc(-50% + ${r.xOffset}px))` }}
        >
          <div className="bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 border border-white/10 shadow-lg">
            {r.username}
          </div>
          <div className="text-4xl filter drop-shadow-lg">
            {r.emoji}
          </div>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(100px) scale(0.5); opacity: 0; }
          10% { transform: translateY(0px) scale(1.2); opacity: 1; }
          20% { transform: translateY(-20px) scale(1); opacity: 1; }
          100% { transform: translateY(-300px) scale(1); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 3s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default LiveReactions;
