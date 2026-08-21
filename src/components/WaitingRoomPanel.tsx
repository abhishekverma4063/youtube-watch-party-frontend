import React from 'react';
import { Check, X } from 'lucide-react';

interface Props {
  waitingUsers: { userId: string, username: string }[];
  onApprove: (userId: string) => void;
  onDeny: (userId: string) => void;
}

const WaitingRoomPanel: React.FC<Props> = ({ waitingUsers, onApprove, onDeny }) => {
  if (waitingUsers.length === 0) return null;

  return (
    <div className="absolute top-20 right-6 w-80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-zinc-200 dark:border-white/10 p-4 z-50">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        Waiting Room ({waitingUsers.length})
      </h3>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
        {waitingUsers.map((user) => (
          <div key={user.userId} className="flex items-center justify-between bg-zinc-100 dark:bg-black/40 p-2 rounded-lg border border-zinc-200 dark:border-white/5">
            <span className="text-sm font-medium truncate pr-2">{user.username}</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onApprove(user.userId)}
                className="p-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-md transition-colors"
                title="Approve"
              >
                <Check size={14} />
              </button>
              <button 
                onClick={() => onDeny(user.userId)}
                className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors"
                title="Deny"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaitingRoomPanel;
