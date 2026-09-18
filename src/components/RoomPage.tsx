import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import type { UserData, VideoState, ChatMessage, SessionLog } from '../types';
import VideoPlayer from './VideoPlayer';
import ParticipantList from './ParticipantList';
import Chat from './Chat';
import StudioControls from './StudioControls';
import NetworkLatency from './NetworkLatency';
import toast from 'react-hot-toast';
import { LogOut, Copy, Users, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import WaitingRoomPanel from './WaitingRoomPanel';
import AudioChat from './AudioChat';
import AuditLogModal from './AuditLogModal';
import { Coffee, ShieldPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  roomId: string;
  onLeave: () => void;
}

const RoomPage: React.FC<Props> = ({ roomId, onLeave }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [participants, setParticipants] = useState<UserData[]>([]);
  const currentUser = participants.find(p => p.userId === user?.id) || null;
  const [videoState, setVideoState] = useState<VideoState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'participants' | 'chat'>('participants');
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [waitingUsers, setWaitingUsers] = useState<{ userId: string, username: string }[]>([]);
  const [totalJoined, setTotalJoined] = useState<number>(0);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [isWaitingRoomEnabled, setIsWaitingRoomEnabled] = useState(false);
  const [isAFK, setIsAFK] = useState(false);
  const [afkStartTime, setAfkStartTime] = useState<number | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const username = sessionStorage.getItem('wp_username') || 'Anonymous';
    // Get password and creating state from navigation state
    const password = location.state?.password;
    const isCreating = location.state?.isCreating || false;
    
    socket.emit('join_room', { roomId, username, password, isCreating });

    const handleError = (data: { message: string }) => {
      toast.error(data.message, { id: 'room-error' });
      navigate('/');
    };

    const handleUserJoined = (data: any) => {
      if (data.userId !== user?.id) {
        toast.success(`${data.username} joined the room`);
      }
      setParticipants(data.participants);
      if (data.sessionLogs) setSessionLogs(data.sessionLogs);
      setTotalJoined(prev => Math.max(prev, new Set(data.participants.map((p: any) => p.userId)).size));
    };

    const handleUserLeft = (data: any) => {
      toast(`${data.username} left the room`, { icon: '👋' });
      setParticipants(data.participants);
      if (data.sessionLogs) setSessionLogs(data.sessionLogs);
    };

    const handleSyncState = (data: { videoState: VideoState, sessionLogs?: SessionLog[], isInitialJoin?: boolean }) => {
      // The server sends the exact, caught-up currentTime. We set lastSyncTime to our Date.now() to track from here.
      setVideoState({ ...data.videoState, lastSyncTime: Date.now() });
      if (data.sessionLogs) setSessionLogs(data.sessionLogs);

      if (data.isInitialJoin && data.videoState.isPlaying && data.videoState.currentTime > 1) {
        const missedSeconds = Math.floor(data.videoState.currentTime);
        const m = Math.floor(missedSeconds / 60);
        const s = missedSeconds % 60;
        const timeFormatted = m > 0 ? `${m}m ${s}s` : `${s}s`;
        toast(`Host is playing. You joined late and missed ${timeFormatted}. Syncing now!`, { 
          icon: '⏩', 
          duration: 6000 
        });
      }
    };

    const handlePlay = (data: { senderId?: string } = {}) => {
      if (data.senderId === user?.id) return;
      setVideoState(prev => prev ? { ...prev, isPlaying: true, lastSyncTime: Date.now() } : null);
    };

    const handlePause = (data: { senderId?: string } = {}) => {
      if (data.senderId === user?.id) return;
      setVideoState(prev => {
        if (!prev) return null;
        const elapsed = prev.isPlaying ? (Date.now() - prev.lastSyncTime) / 1000 : 0;
        return { 
          ...prev, 
          isPlaying: false, 
          currentTime: prev.currentTime + elapsed,
          lastSyncTime: Date.now() 
        };
      });
    };

    const handleSeek = (data: { time: number, senderId?: string }) => {
      if (data.senderId === user?.id) return;
      setVideoState(prev => prev ? { ...prev, currentTime: data.time, lastSyncTime: Date.now() } : null);
    };

    const handleChangeVideo = (data: { videoId: string }) => {
      setVideoState(prev => prev 
        ? { ...prev, videoId: data.videoId, isPlaying: false, currentTime: 0 } 
        : { videoId: data.videoId, isPlaying: false, currentTime: 0, lastSyncTime: Date.now() }
      );
    };

    const handleRoleAssigned = (data: any) => {
      if (data.userId === user?.id) {
        toast.success(`You are now a ${data.role}`);
      }
      setParticipants(data.participants);
      if (data.sessionLogs) setSessionLogs(data.sessionLogs);
    };

    const handleParticipantRemoved = (data: any) => {
      setParticipants(data.participants);
      if (data.sessionLogs) setSessionLogs(data.sessionLogs);
    };
    
    const handleParticipantUpdated = (data: any) => {
      setParticipants(data.participants);
      if (data.sessionLogs) setSessionLogs(data.sessionLogs);
    };

    const handleJoinRequest = (data: { userId: string, username: string }) => {
      toast(`${data.username} is waiting to join`, { icon: '🚪' });
      setWaitingUsers(prev => [...prev, data]);
    };

    const handleJoinDenied = () => {
      toast.error('Your request to join was denied.');
      navigate('/');
    };

    const handleWaitingForApproval = () => {
      toast('Waiting for host approval...', { icon: '⏳' });
    };

    const handleWaitingRoomToggled = (data: { enabled: boolean }) => {
      setIsWaitingRoomEnabled(data.enabled);
      toast(`Waiting room ${data.enabled ? 'enabled' : 'disabled'}`);
    };

    const handleKicked = () => {
      toast.error('You were removed from the room by the host');
      onLeave();
    };

    const handleChatMessage = (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
    };

    const handleRoomClosed = (data: { message: string }) => {
      toast.error(data.message, { duration: 5000 });
      onLeave();
    };

    socket.on('error_message', handleError);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('sync_state', handleSyncState);
    socket.on('play', handlePlay);
    socket.on('pause', handlePause);
    socket.on('seek', handleSeek);
    socket.on('change_video', handleChangeVideo);
    socket.on('role_assigned', handleRoleAssigned);
    socket.on('participant_removed', handleParticipantRemoved);
    socket.on('participant_updated', handleParticipantUpdated);
    socket.on('kicked_from_room', handleKicked);
    socket.on('chat_message', handleChatMessage);
    socket.on('join_request', handleJoinRequest);
    socket.on('join_denied', handleJoinDenied);
    socket.on('waiting_for_approval', handleWaitingForApproval);
    socket.on('waiting_room_toggled', handleWaitingRoomToggled);
    socket.on('room_closed', handleRoomClosed);

    const handleBeforeUnload = () => {
      socket.emit('leave_room', { roomId });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off('error_message', handleError);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('sync_state', handleSyncState);
      socket.off('play', handlePlay);
      socket.off('pause', handlePause);
      socket.off('seek', handleSeek);
      socket.off('change_video', handleChangeVideo);
      socket.off('role_assigned', handleRoleAssigned);
      socket.off('participant_removed', handleParticipantRemoved);
      socket.off('participant_updated', handleParticipantUpdated);
      socket.off('kicked_from_room', handleKicked);
      socket.off('chat_message', handleChatMessage);
      socket.off('join_request', handleJoinRequest);
      socket.off('join_denied', handleJoinDenied);
      socket.off('waiting_for_approval', handleWaitingForApproval);
      socket.off('waiting_room_toggled', handleWaitingRoomToggled);
      socket.off('room_closed', handleRoomClosed);
    };
  }, [socket, isConnected, roomId, onLeave, navigate, location.state, user?.id]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room code copied to clipboard!');
  };

  const handleLeave = () => {
    if (currentUser?.role === 'Host') {
      setShowAuditLog(true);
    } else {
      socket?.emit('leave_room', { roomId });
      onLeave();
    }
  };

  const confirmLeave = () => {
    socket?.emit('leave_room', { roomId });
    onLeave();
  };

  const toggleAFK = () => {
    const newAFKState = !isAFK;
    setIsAFK(newAFKState);
    if (newAFKState) {
      setAfkStartTime(videoState?.currentTime || 0);
    } else {
      // Returned from AFK, we could show PiP here, but for simplicity we rely on the main video syncing back
      toast('Welcome back! You can catch up on what you missed.', { icon: '🍿' });
      setAfkStartTime(null);
    }
    socket?.emit('toggle_afk', { isAFK: newAFKState });
  };

  const handleApproveJoin = (userId: string) => {
    socket?.emit('approve_join', { userId });
    setWaitingUsers(prev => prev.filter(u => u.userId !== userId));
  };

  const handleDenyJoin = (userId: string) => {
    socket?.emit('deny_join', { userId });
    setWaitingUsers(prev => prev.filter(u => u.userId !== userId));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center text-zinc-900 dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400">Connecting to secure room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden text-white font-sans relative">
      {/* Background matching Image 2 */}
      <div className="absolute inset-0 bg-[#070815] z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#4f61e4]/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#bd3ef9]/15 blur-[120px]"></div>
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#7e8df6]/5 blur-[100px]"></div>
        {/* Diagonal flares */}
        <div className="absolute bottom-[-10%] right-[15%] w-[2px] h-[500px] bg-gradient-to-t from-[#bd3ef9]/40 to-transparent transform rotate-[35deg] blur-[2px]"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[2px] h-[400px] bg-gradient-to-t from-[#4f61e4]/40 to-transparent transform rotate-[35deg] blur-[2px]"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-[#0a0c1b]/60 backdrop-blur-xl border-b border-[#4c59a8]/30">
          <div className="flex items-center gap-4">
            <h2 className="text-[17px] font-bold text-[#7e8df6] m-0 tracking-wide">
              Watch Party
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-transparent border border-white/10 rounded-lg text-xs font-mono">
              <span className="text-white/60">Room:</span>
              <strong className="tracking-wider text-white">{roomId}</strong>
              <button 
                className="text-white/40 hover:text-white transition-colors ml-1" 
                onClick={copyRoomId} 
                title="Copy Room Code"
              >
                <Copy size={12} />
              </button>
            </div>
            <NetworkLatency />
          </div>
          
          <div className="flex items-center gap-4">
            <AudioChat participants={participants} />
            
            <button
              onClick={toggleAFK}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isAFK ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}
            >
              <Coffee size={14} /> AFK
            </button>

            {currentUser?.role === 'Host' && (
              <button
                onClick={() => socket?.emit('toggle_waiting_room', { enabled: !isWaitingRoomEnabled })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isWaitingRoomEnabled ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}`}
                title="Toggle Waiting Room"
              >
                <ShieldPlus size={14} /> Wait Room
              </button>
            )}

            {currentUser && (
              <div className="flex items-center gap-3 ml-2">
                <div className="text-right flex flex-col">
                  <span className="font-semibold text-sm leading-tight text-white">{currentUser.username}</span>
                  <span className="text-[10px] text-[#7e8df6] font-bold tracking-wider">{currentUser.role.toUpperCase()}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#8155ff] flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(129,85,255,0.4)]">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            
            <button 
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#8155ff] to-[#bd3ef9] hover:opacity-90 text-white rounded-full text-sm font-semibold transition-opacity shadow-[0_0_20px_rgba(189,62,249,0.3)] ml-2" 
              onClick={handleLeave}
            >
              <LogOut size={14} /> {currentUser?.role === 'Host' ? 'End Session' : 'Leave'}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {currentUser?.role === 'Host' && (
          <WaitingRoomPanel 
            waitingUsers={waitingUsers} 
            onApprove={handleApproveJoin}
            onDeny={handleDenyJoin}
          />
        )}
        {showAuditLog && (
          <AuditLogModal 
            onClose={confirmLeave} 
            sessionLogs={sessionLogs} 
            participants={participants}
            totalDuration={videoState?.currentTime || 0} 
          />
        )}

        {/* Video Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
           <VideoPlayer 
             videoState={videoState} 
             currentUser={currentUser} 
           />
          
          {/* AFK PiP Catch up preview */}
          {!isAFK && afkStartTime !== null && videoState?.videoId && (
            <div className="absolute bottom-10 left-10 w-64 h-36 rounded-xl overflow-hidden shadow-2xl border-4 border-amber-500 z-50">
               <div className="absolute top-0 left-0 w-full bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 text-center z-10">
                 CATCHING UP (2x)
               </div>
               {/* A pseudo iframe that acts as a catch-up pip */}
               <iframe
                 src={`https://www.youtube.com/embed/${videoState.videoId}?start=${Math.floor(afkStartTime)}&autoplay=1&mute=1&controls=0`}
                 className="w-full h-full pointer-events-none"
                 allow="autoplay"
               />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-[320px] flex flex-col gap-4">
          {/* Participants Panel */}
          <div className="flex-1 flex flex-col rounded-[1.5rem] overflow-hidden bg-[#121636]/60 backdrop-blur-xl border border-[#4c59a8]/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] min-h-0">
            <div className="flex items-center px-4 py-3 border-b border-[#4c59a8]/30 bg-black/20">
              <div className="flex-1 flex items-center gap-2 text-white/90 text-[13px] font-medium">
                <Users size={15} /> Participants ({participants.length})
              </div>
              <div className="flex-1 flex items-center gap-2 text-white/40 text-[13px] font-medium pl-2">
                <MessageSquare size={15} /> Chat
              </div>
            </div>
            <div className="flex justify-between px-4 py-1.5 bg-black/30 text-[10px] text-white/50 border-b border-[#4c59a8]/20">
              <span>Current: {participants.length}</span>
              <span>Total Today: {sessionLogs.length || totalJoined || participants.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ParticipantList 
                participants={participants} 
                currentUser={currentUser}
                totalJoined={sessionLogs.length || totalJoined || participants.length}
                sessionLogs={sessionLogs}
              />
            </div>
          </div>

          {/* Chat Panel */}
          <div className="h-[260px] flex flex-col rounded-[1.5rem] overflow-hidden bg-[#121636]/60 backdrop-blur-xl border border-[#4c59a8]/40 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#4c59a8]/30 bg-black/20 text-white/90 text-[13px] font-medium">
              <MessageSquare size={15} /> Chat
            </div>
            <div className="flex-1 overflow-hidden p-2 pt-0 relative z-10">
              <Chat messages={chatMessages} />
            </div>
            {/* Sparkle decoration */}
            <div className="absolute bottom-6 right-6 text-white/10 pointer-events-none">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
