import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Play, ArrowRight, User, Lock, Share, Copy, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://youtube-watch-party-backend-production.up.railway.app');

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        login(data.accessToken, data.user);
        toast.success('Logged in successfully!');
        navigate('/');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-[#070815] font-sans">
      
      {/* Background matching RoomPage (relates one page with another) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#4f61e4]/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#bd3ef9]/15 blur-[120px]"></div>
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#7e8df6]/5 blur-[100px]"></div>
        {/* Diagonal flares */}
        <div className="absolute bottom-[-10%] right-[15%] w-[2px] h-[500px] bg-gradient-to-t from-[#bd3ef9]/40 to-transparent transform rotate-[35deg] blur-[2px]"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[2px] h-[400px] bg-gradient-to-t from-[#4f61e4]/40 to-transparent transform rotate-[35deg] blur-[2px]"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none mask-image-radial-gradient z-0"></div>

      {/* Background Typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
        <h1 className="text-[12vw] font-black text-white/[0.03] tracking-tighter leading-none whitespace-nowrap">
          WATCH. TOGETHER.
        </h1>
      </div>

      {/* Top Right Icons matching image */}
      <div className="absolute top-8 right-8 flex items-center gap-3 z-50 hidden sm:flex">
        <button className="w-11 h-11 rounded-full bg-[#121636]/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors shadow-lg">
          <Share size={18} />
        </button>
        <button className="w-11 h-11 rounded-full bg-[#121636]/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors shadow-lg">
          <Copy size={18} />
        </button>
        <button className="w-11 h-11 rounded-full bg-[#121636]/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors shadow-lg">
          <Download size={18} />
        </button>
      </div>

      <div className="w-full max-w-[600px] px-6 relative z-10 flex flex-col items-center mt-[-40px]">
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#3b4bbf] to-[#7e8df6] flex items-center justify-center shadow-[0_0_20px_rgba(79,97,228,0.4)] border border-white/20">
              <Play className="text-white w-5 h-5 ml-0.5" fill="currentColor" />
            </div>
            <span className="text-[26px] font-bold tracking-tight text-white drop-shadow-md">
              WatchParty
            </span>
          </div>
        </motion.div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#121636]/80 backdrop-blur-xl border border-[#4c59a8]/40 rounded-[2rem] p-10 sm:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full"
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-wide text-white mb-3">Welcome back</h1>
            <p className="text-white/60 text-base font-medium">Enter your details to sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div className="flex flex-col gap-2.5">
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                className="w-full px-6 py-4 bg-[#111328] border border-[#38437f] rounded-full text-white text-base placeholder-white/30 focus:outline-none focus:border-[#7e8df6] focus:bg-[#1a1d3d] shadow-inner transition-all duration-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="flex flex-col gap-2.5">
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full px-6 py-4 bg-[#111328] border border-[#38437f] rounded-full text-white text-base placeholder-white/30 focus:outline-none focus:border-[#7e8df6] focus:bg-[#1a1d3d] shadow-inner transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full py-4 px-6 bg-gradient-to-r from-[#924ae6] via-[#7154e2] to-[#5a6bed] hover:opacity-90 text-white font-bold text-lg rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.4)] transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-white/50 text-[13px] font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white font-bold hover:underline underline-offset-4 transition-all">
              Sign up
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
