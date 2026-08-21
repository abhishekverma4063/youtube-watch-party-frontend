import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Video, Lock, KeyRound, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import ProfileMenu from './ProfileMenu';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const navigate = useNavigate();

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoomId = generateRoomId();
    navigate(`/room/${newRoomId}`, { state: { password: createPassword, isCreating: true } });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    navigate(`/room/${roomCode}`, { state: { password: joinPassword, isCreating: false } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background matching other pages */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#070815] pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#4f61e4]/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#bd3ef9]/15 blur-[120px]"></div>
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#7e8df6]/5 blur-[100px]"></div>
        {/* Diagonal flares */}
        <div className="absolute bottom-[-10%] right-[15%] w-[2px] h-[500px] bg-gradient-to-t from-[#bd3ef9]/40 to-transparent transform rotate-[35deg] blur-[2px]"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[2px] h-[400px] bg-gradient-to-t from-[#4f61e4]/40 to-transparent transform rotate-[35deg] blur-[2px]"></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none mask-image-radial-gradient z-0"></div>
      
      <div className="absolute top-8 right-8 z-50">
        <ProfileMenu />
      </div>

      <div className="w-full max-w-5xl px-4 relative z-10 flex flex-col items-center">
        
        {/* Header Text */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-px bg-white/40"></div>
            <span className="uppercase tracking-[0.2em] text-[10px] font-semibold text-white/80">Premium Sync Experience</span>
            <div className="w-10 h-px bg-white/40"></div>
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-bold text-white tracking-tight leading-none drop-shadow-xl flex items-center justify-center gap-3">
            <span>WATCH</span>
            <span className="bg-gradient-to-r from-[#9ea9ff] via-[#d6a5ff] to-[#ff99d0] bg-clip-text text-transparent">PARTY</span>
          </h1>
          
          <p className="mt-4 text-[15px] sm:text-base text-white/90 font-medium max-w-xl text-center leading-relaxed drop-shadow-md">
            Experience movies and videos together in perfect sync with real-time voice and live reactions.
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#0f1123]/90 backdrop-blur-xl border border-[#4c59a8]/50 rounded-[2rem] p-10 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-[650px] relative"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-wide text-white mb-3 drop-shadow-md">
              Welcome, {user?.username || 'Abhishek Verma'}
            </h2>
            <p className="text-white/60 text-base font-medium">Create or join a room below</p>
          </div>

          <div className="flex flex-col gap-10">
            {/* Create Room Section */}
            <form onSubmit={handleCreateRoom} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest ml-1">New Room</label>
                <input 
                  type="password" 
                  placeholder="Set password (optional)" 
                  className="w-full px-6 py-4 bg-[#111328] border border-[#38437f] rounded-full text-white text-base placeholder-white/30 focus:outline-none focus:border-[#7e8df6] focus:bg-[#1a1d3d] shadow-inner transition-all duration-200"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full py-4 px-6 bg-[#7e8df6] hover:bg-[#6b77e8] text-white font-bold text-lg rounded-full transition-colors flex items-center justify-center shadow-[0_10px_20px_rgba(126,141,246,0.3)] mt-2">
                <Video className="w-5 h-5 mr-2" /> Create Room
              </button>
            </form>
            
            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="px-5 text-[10px] font-bold text-white/50 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Join Room Section */}
            <form onSubmit={handleJoinRoom} className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Enter room ID" 
                  required
                  className="w-full px-6 py-4 bg-[#111328] border border-[#38437f] rounded-full text-white text-base placeholder-white/30 focus:outline-none focus:border-[#7e8df6] focus:bg-[#1a1d3d] shadow-inner transition-all duration-200 uppercase font-mono tracking-widest"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />
                <input 
                  type="password" 
                  placeholder="Enter password" 
                  className="w-full px-6 py-4 bg-[#111328] border border-[#38437f] rounded-full text-white text-base placeholder-white/30 focus:outline-none focus:border-[#7e8df6] focus:bg-[#1a1d3d] shadow-inner transition-all duration-200"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                />
              </div>
              <button type="submit" disabled={!roomCode.trim()} className="w-full py-4 px-6 bg-gradient-to-r from-[#b340ff] to-[#ce45f9] hover:opacity-90 text-white font-bold text-lg rounded-full transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(206,69,249,0.3)] mt-2">
                <Users className="w-5 h-5 mr-2" /> Join Room
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
