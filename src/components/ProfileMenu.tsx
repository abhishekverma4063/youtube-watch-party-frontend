import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Laptop, Smartphone, AlertTriangle, Monitor, X, Settings, Image as ImageIcon, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

interface Session {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  isCurrent: boolean;
}

const ProfileMenu: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [avatarInput, setAvatarInput] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSessions = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'}/api/auth/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenSessions = () => {
    setIsOpen(false);
    setShowSessions(true);
    fetchSessions();
  };

  const handleOpenSettings = () => {
    setIsOpen(false);
    setAvatarInput(user?.avatarUrl || '');
    setShowSettings(true);
  };

  const handleSaveAvatar = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl: avatarInput }),
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('Profile updated! Refresh to see changes.');
        setShowSettings(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (e) {
      toast.error('An error occurred');
    }
  };

  const handleRevoke = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'}/api/auth/sessions/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('All other sessions revoked successfully!');
        fetchSessions();
      } else {
        toast.error('Failed to revoke sessions');
      }
    } catch (e) {
      toast.error('An error occurred');
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg border border-white/20 transition-transform hover:scale-105 overflow-hidden"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            user.username[0].toUpperCase()
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-white/10 bg-black/20">
              <p className="text-sm text-zinc-400">Signed in as</p>
              <p className="font-bold text-white text-lg truncate">{user.username}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                <Shield size={12} />
                JWT Secured Session
              </div>
            </div>
            <div className="p-2">
              <button 
                onClick={handleOpenSettings}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings size={16} className="text-zinc-400" />
                Profile Settings
              </button>
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button 
                onClick={handleOpenSessions}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Monitor size={16} className="text-indigo-400" />
                Active Sessions
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {showSessions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Security Dashboard</h3>
                  <p className="text-xs text-zinc-400">Manage your active authenticated sessions</p>
                </div>
              </div>
              <button onClick={() => setShowSessions(false)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
              {sessions.map(session => {
                const isMobile = session.userAgent.toLowerCase().includes('mobile');
                return (
                  <div key={session.id} className={`p-4 rounded-xl border ${session.isCurrent ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-black/20 border-white/5'} flex items-start justify-between gap-4`}>
                    <div className="flex gap-3 mt-1">
                      {isMobile ? <Smartphone className="text-zinc-400" size={20} /> : <Laptop className="text-zinc-400" size={20} />}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white text-sm">
                            {session.userAgent.split(' ')[0] || 'Unknown Device'}
                          </p>
                          {session.isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white uppercase tracking-wider">This Device</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1" title={session.userAgent}>{session.userAgent}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs font-medium text-zinc-400">
                          <span>IP: {session.ipAddress}</span>
                          <span>•</span>
                          <span>Signed in: {new Date(session.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sessions.length > 1 && (
              <div className="p-5 border-t border-white/10 bg-black/20">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Unrecognized activity?</p>
                    <p className="text-xs opacity-80 mt-1 mb-3">Revoke all other sessions to instantly log out from all other devices.</p>
                    <button 
                      onClick={handleRevoke}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg"
                    >
                      Revoke All Other Sessions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Profile Settings</h3>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Avatar Image URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    className="w-full pl-11 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-base placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                  />
                </div>
                <p className="text-xs text-zinc-500">Paste a direct link to an image to use as your avatar.</p>
              </div>

              {avatarInput && (
                <div className="flex justify-center my-2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg">
                    <img src={avatarInput} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error'; }} />
                  </div>
                </div>
              )}

              <button 
                onClick={handleSaveAvatar}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileMenu;
