import React from 'react';
import { Role } from '../types';
import type { UserData, SessionLog } from '../types';
import { useSocket } from '../context/SocketContext';
import { Shield, Crown, User, UserMinus, Eye, Coffee } from 'lucide-react';

interface Props {
  participants: UserData[];
  currentUser: UserData | null;
  totalJoined: number;
  sessionLogs?: SessionLog[];
}

const ParticipantList: React.FC<Props> = ({ participants, currentUser, totalJoined, sessionLogs = [] }) => {
  const { socket } = useSocket();

  const isHost = currentUser?.role === Role.Host;

  const offlineUsers = sessionLogs.filter(log => !participants.some(p => p.userId === log.userId));

  const handleRoleChange = (userId: string, newRole: Role) => {
    socket?.emit('assign_role', { userId, role: newRole });
  };

  const handleRemove = (userId: string) => {
    if (confirm('Are you sure you want to remove this participant?')) {
      socket?.emit('remove_participant', { userId });
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.Host: return <Crown size={14} className="text-yellow-500" />;
      case Role.Moderator: return <Shield size={14} className="text-indigo-400" />;
      case Role.Viewer: return <Eye size={14} className="text-zinc-500" />;
      default: return <User size={14} className="text-zinc-500" />;
    }
  };

  const formatJoinTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-3">
      {participants.map((p) => (
        <div key={p.userId} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 transition-all hover:bg-black/40">
          <div className="flex items-center gap-3">
            <div className={`relative w-9 h-9 rounded-full bg-[#4f61e4] text-white font-bold flex items-center justify-center shadow-[0_0_10px_rgba(79,97,228,0.4)]`}>
              {/* Crown for Host */}
              {p.role === Role.Host && (
                <div className="absolute -top-1 -left-1 text-yellow-500 drop-shadow-md bg-[#121636] rounded-full p-0.5">
                  <Crown size={12} className="fill-yellow-500" />
                </div>
              )}
              {p.username.charAt(0).toUpperCase()}
              {/* Active dot */}
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#121636] ${p.isAFK ? 'bg-amber-500' : 'bg-green-500'}`} title={p.isAFK ? 'Away' : 'Active'} />
            </div>
            <div>
              <div className="font-medium text-[13px] flex items-center gap-2 text-white/90">
                {p.username} 
                {p.userId === currentUser?.userId && <span className="text-white/40 text-[11px]">(You)</span>}
                {p.isAFK && <span className="text-amber-500 text-[10px] flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-md"><Coffee size={10} /> AFK</span>}
              </div>
              <div className="text-[11px] text-white/50 flex items-center gap-1.5 mt-0.5">
                <span className={`uppercase tracking-wider font-bold ${p.role === Role.Host ? 'text-green-500' : 'text-white/60'}`}>
                  {p.role}
                </span>
                {p.joinTime && <span className="opacity-60 text-[10px]">• Joined {formatJoinTime(p.joinTime)}</span>}
              </div>
            </div>
          </div>
          
          {isHost && p.userId !== currentUser?.userId && (
            <div className="flex items-center gap-2">
              <select 
                value={p.role}
                onChange={(e) => handleRoleChange(p.userId, e.target.value as Role)}
                className="bg-zinc-800 text-white border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                <option value={Role.Participant}>Participant</option>
                <option value={Role.Viewer}>Viewer</option>
                <option value={Role.Moderator}>Moderator</option>
                <option value={Role.Host}>Host</option>
              </select>
              <button 
                onClick={() => handleRemove(p.userId)}
                title="Remove User"
                className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <UserMinus size={14} />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Offline Users */}
      {offlineUsers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">Offline ({offlineUsers.length})</h4>
          <div className="flex flex-col gap-2">
            {offlineUsers.map((p) => (
              <div key={p.userId} className="flex items-center gap-3 p-2 px-3 bg-black/10 rounded-xl border border-white/5 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600">
                  <UserMinus size={14} />
                </div>
                <div>
                  <div className="font-medium text-sm text-zinc-400 line-through decoration-zinc-600">
                    {p.username}
                  </div>
                  <div className="text-xs text-zinc-500 flex flex-col mt-0.5">
                    <span>Joined: {formatJoinTime(p.joinTime)}</span>
                    <span>Left: {formatJoinTime(p.leaveTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;
