import React from 'react';
import { X, Clock, Users, UserCheck, UserMinus } from 'lucide-react';
import type { SessionLog, UserData } from '../types';

interface Props {
  onClose: () => void;
  sessionLogs?: SessionLog[];
  participants?: UserData[];
  totalDuration: number;
}

const AuditLogModal: React.FC<Props> = ({ onClose, sessionLogs = [], participants = [], totalDuration }) => {
  // If sessionLogs isn't populated for some reason, fallback to active participants
  const logsToRender = sessionLogs.length > 0 ? sessionLogs : participants.map(p => ({
    userId: p.userId,
    username: p.username,
    joinTime: p.joinTime,
  }));

  const formatTime = (ts?: number) => {
    if (!ts) return 'Unknown';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121636] rounded-2xl shadow-2xl w-full max-w-lg border border-[#4c59a8]/40 flex flex-col overflow-hidden text-white font-sans">
        <div className="p-6 border-b border-[#4c59a8]/30 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#9ea9ff] to-[#ff99d0] bg-clip-text text-transparent">Session Summary</h2>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1a1d3d] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2">
              <Users size={24} className="text-[#9ea9ff]" />
              <div className="text-2xl font-bold">{logsToRender.length}</div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Total Joined</div>
            </div>
            <div className="bg-[#1a1d3d] p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2">
              <Clock size={24} className="text-[#ff99d0]" />
              <div className="text-2xl font-bold">{Math.round(totalDuration / 60)}m</div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Session Duration</div>
            </div>
          </div>
          
          <h3 className="font-semibold mb-3 text-[11px] text-white/40 uppercase tracking-widest pl-1">Participant Log</h3>
          <div className="flex flex-col gap-2">
            {logsToRender.map((log, i) => {
              const isActive = participants.some(p => p.userId === log.userId);
              const leftTime = (log as SessionLog).leaveTime;

              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isActive ? 'bg-[#7e8df6]/10 border-[#7e8df6]/30' : 'bg-black/20 border-white/5 opacity-70 grayscale hover:grayscale-0'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-[#7e8df6]/20 text-[#7e8df6]' : 'bg-white/10 text-white/40'}`}>
                      {isActive ? <UserCheck size={14} /> : <UserMinus size={14} />}
                    </div>
                    <div>
                      <div className={`font-medium text-[13px] ${isActive ? 'text-white' : 'text-white/60 line-through decoration-white/30'}`}>{log.username}</div>
                      <div className="text-[10px] text-white/40 mt-0.5 font-mono">
                        Joined: {formatTime(log.joinTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {isActive ? (
                      <span className="text-[10px] font-bold tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded-md uppercase">Available</span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-wider text-red-400 bg-red-400/10 px-2 py-1 rounded-md uppercase">Left @ {formatTime(leftTime)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-6 border-t border-[#4c59a8]/30 bg-black/20 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#8155ff] to-[#bd3ef9] hover:opacity-90 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(189,62,249,0.3)]"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;
