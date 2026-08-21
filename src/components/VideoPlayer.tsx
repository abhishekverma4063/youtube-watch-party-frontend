import React, { useEffect, useRef, useState, useCallback } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { Role } from '../types';
import type { VideoState, UserData } from '../types';
import { useSocket } from '../context/SocketContext';
import { Search, Minimize, Tv, Monitor, Film, Activity, Camera, Video as VideoIcon, Square, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import LiveReactions from './LiveReactions';
import ReactionPicker from './ReactionPicker';

interface Props {
  videoState: VideoState | null;
  currentUser: UserData | null;
}

const VideoPlayer: React.FC<Props> = ({ videoState, currentUser }) => {
  const { socket } = useSocket();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [internalState, setInternalState] = useState<VideoState | null>(null);
  const [actualPlayerState, setActualPlayerState] = useState<number>(-1);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const handleInteract = () => setHasInteracted(true);
    window.addEventListener('click', handleInteract, { once: true });
    window.addEventListener('keydown', handleInteract, { once: true });
    return () => {
      window.removeEventListener('click', handleInteract);
      window.removeEventListener('keydown', handleInteract);
    };
  }, []);

  const syncPlayerToState = (player: YouTubePlayer, state: VideoState) => {
    const playerState = player.getPlayerState();
    
    // Handle Seek sync if discrepancy is > 2 seconds
    const currentTime = player.getCurrentTime();
    let expectedTime = state.currentTime;
    if (state.isPlaying) {
      const elapsed = (Date.now() - state.lastSyncTime) / 1000;
      expectedTime += elapsed;
    }
    
    // Always seek if it's unstarted (0) or if the drift is large
    if (Math.abs(currentTime - expectedTime) > 2) {
      // Avoid seeking to 0 on an unstarted video, which can cause infinite buffering
      if (playerState !== -1 || expectedTime > 0) {
        player.seekTo(expectedTime, true);
      }
    }

    // Handle Play/Pause
    if (state.isPlaying && playerState !== 1 && playerState !== 3) {
      // If the browser hasn't received a user interaction, programmatically calling playVideo() 
      // will cause the YouTube iframe to freeze in a permanent buffering state due to autoplay policies.
      if (hasInteracted || canControl) {
        player.playVideo();
      }
    } else if (!state.isPlaying && playerState === 1) {
      player.pauseVideo();
    }
  };

  // Sync with incoming server state
  useEffect(() => {
    if (!videoState) return;
    setInternalState(videoState);

    if (playerRef.current) {
      syncPlayerToState(playerRef.current, videoState);
    }
    
    // Initial late join toast
    if (!initialSyncDone && !canControl) {
      if (videoState.isPlaying) {
        let expectedTime = videoState.currentTime;
        const elapsed = (Date.now() - videoState.lastSyncTime) / 1000;
        expectedTime += elapsed;
        
        if (expectedTime > 5) {
           toast(`You joined ${Math.floor(expectedTime / 60)}m ${Math.floor(expectedTime % 60)}s late! Syncing to live...`, { icon: '🍿', duration: 5000 });
        }
      }
      setInitialSyncDone(true);
    }
  }, [videoState]);

  const canControl = currentUser?.role === Role.Host || currentUser?.role === Role.Moderator;

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setActualPlayerState(event.target.getPlayerState());
    
    // If we already received state from server before player was ready, sync it now
    if (internalState) {
       syncPlayerToState(event.target, internalState);
    } else if (!videoState) {
       socket?.emit('sync_request');
    }
  };

  const onStateChange = (event: YouTubeEvent) => {
    setActualPlayerState(event.data);
    
    if (!canControl) {
      // Revert state if unauthorized user tries to change it (e.g. if they somehow click it)
      if (internalState) {
        // DO NOT force play here in a loop if autoplay is blocked! It causes a buffering infinite loop.
        // We only forcefully pause if they shouldn't be playing.
        if (!internalState.isPlaying && event.data === 1) {
           event.target.pauseVideo();
        }
      }
      return;
    }

    // Emit changes if authorized
    const currentTime = event.target.getCurrentTime();
    
    if (event.data === 1) { // Playing
      socket?.emit('play');
      socket?.emit('seek', { time: currentTime });
    } else if (event.data === 2) { // Paused
      socket?.emit('pause');
      socket?.emit('seek', { time: currentTime });
    }
  };

  const handleChangeVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canControl || !inputUrl) return;

    let videoId = inputUrl.trim();
    // Basic youtube URL parsing
    try {
      if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
        let parseUrl = videoId;
        if (!parseUrl.startsWith('http')) {
          parseUrl = 'https://' + parseUrl;
        }
        const url = new URL(parseUrl);
        videoId = url.searchParams.get('v') || url.pathname.split('/').pop() || videoId;
      }
    } catch (e) {
      console.error("Invalid URL");
    }

    socket?.emit('change_video', { videoId });
    setInputUrl('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        audio: true
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9,opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        setIsRecording(false);
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        toast.success('Recording finished! Ready to download.');
      };

      stream.getVideoTracks()[0].onended = () => {
        mediaRecorder.stop();
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (err) {
      console.error(err);
      toast.error('Could not start recording. Permission denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watch-party-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    setRecordedChunks([]);
  };

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        audio: false
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        setTimeout(() => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `watch-party-snapshot-${Date.now()}.png`;
            a.click();
            toast.success('Screenshot saved!');
          }
          const tracks = stream.getTracks();
          tracks.forEach(t => t.stop());
        }, 300);
      };
    } catch (err) {
      console.error(err);
      toast.error('Screenshot cancelled');
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {canControl && (
        <div className="flex items-center justify-between w-full px-2 py-1 mb-2">
          <form onSubmit={handleChangeVideo} className="flex w-full gap-4 items-center">
            <div className="w-[300px]">
               <input 
                 type="text" 
                 className="w-full px-4 py-1.5 bg-transparent border border-white/10 rounded-full focus:outline-none focus:border-[#7e8df6] transition-colors text-sm text-white/80 placeholder-white/40" 
                 placeholder="Paste YouTube URL or Video ID" 
                 value={inputUrl}
                 onChange={(e) => setInputUrl(e.target.value)}
               />
            </div>
            <div className="flex-1 flex items-center justify-center text-[#7e8df6] font-bold text-[11px] tracking-widest gap-3">
              <Activity size={16} className="text-[#4c59a8]" />
              STUDIO
              
              <button type="button" onClick={takeScreenshot} className="hover:scale-110 transition-transform" title="Take Screenshot">
                <Camera size={14} className="text-white/60 hover:text-white" />
              </button>
              
              {!isRecording ? (
                <button type="button" onClick={startRecording} className="hover:scale-110 transition-transform" title="Start Recording">
                  <VideoIcon size={14} className="text-[#e25555] hover:text-red-400" />
                </button>
              ) : (
                <button type="button" onClick={stopRecording} className="animate-pulse" title="Stop Recording">
                  <Square size={14} className="text-red-500 fill-current" />
                </button>
              )}

              {recordedChunks.length > 0 && !isRecording && (
                <button type="button" onClick={downloadRecording} className="animate-bounce" title="Download Recording">
                  <Download size={14} className="text-emerald-400" />
                </button>
              )}
            </div>
            <button type="submit" className="px-5 py-1.5 bg-gradient-to-r from-[#4f61e4] to-[#3e50d3] hover:opacity-90 text-white rounded-full font-semibold shadow-[0_0_15px_rgba(79,97,228,0.4)] transition-all text-sm">
              Change Video
            </button>
          </form>
        </div>
      )}
      
      {/* Controls for Theater / Mini Player */}
      {videoState?.videoId && (
        <div className="flex items-center justify-end gap-2 px-1">
          <button 
            onClick={() => {
              setIsMiniPlayer(!isMiniPlayer);
              if (isTheaterMode) setIsTheaterMode(false);
            }}
            className={`p-2 rounded-lg transition-colors ${isMiniPlayer ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
            title="Toggle Mini Player"
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={() => {
              setIsTheaterMode(!isTheaterMode);
              if (isMiniPlayer) setIsMiniPlayer(false);
            }}
            className={`p-2 rounded-lg transition-colors ${isTheaterMode ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
            title="Toggle Theater Mode"
          >
            {isTheaterMode ? <Minimize size={18} /> : <Tv size={18} />}
          </button>
        </div>
      )}

      {/* Video Container */}
      <div 
        className={`
          flex-1 bg-black/40 overflow-hidden relative transition-all duration-300
          ${isTheaterMode ? 'fixed inset-0 z-[100] rounded-none' : ''}
          ${isMiniPlayer ? 'fixed bottom-6 right-6 w-96 h-54 z-[90] rounded-xl shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10' : ''}
          ${!isTheaterMode && !isMiniPlayer ? 'rounded-[1.5rem] border-2 border-[#4c59a8] shadow-[0_0_60px_rgba(79,97,228,0.45)] h-full' : ''}
        `}
      >
        {isTheaterMode && (
          <button 
            onClick={() => setIsTheaterMode(false)}
            className="absolute top-6 right-6 z-50 p-3 bg-black/50 hover:bg-black/80 rounded-xl text-white backdrop-blur transition-colors"
          >
            <Minimize size={24} />
          </button>
        )}
        
        {videoState?.videoId ? (
          <YouTube 
            key={videoState.videoId}
            videoId={videoState.videoId}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 0,
                controls: canControl ? 1 : 0, // Hide controls for participants
                disablekb: canControl ? 0 : 1, // Disable keyboard for participants
                rel: 0,
              },
            }}
            onReady={onReady}
            onStateChange={onStateChange}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-8 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <Film size={350} strokeWidth={0.5} className="text-[#7e8df6] drop-shadow-[0_0_30px_rgba(126,141,246,0.3)]" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-10">
              <div className="text-white/60 flex flex-col items-center gap-4">
                <Tv size={56} className="opacity-50" />
                <p className="text-sm font-medium">{canControl ? 'Enter a video URL to start watching' : 'Waiting for host to select a video...'}</p>
              </div>
              
              {canControl && (
                <form onSubmit={handleChangeVideo} className="w-[400px]">
                  <input 
                    type="text" 
                    className="w-full px-6 py-3 bg-[#24357a]/60 border-2 border-[#4f61e4] rounded-full focus:outline-none focus:border-[#7e8df6] focus:shadow-[0_0_20px_rgba(126,141,246,0.6)] transition-all text-sm text-white placeholder-white/60 shadow-[0_0_20px_rgba(79,97,228,0.4)] text-center" 
                    placeholder="Paste YouTube URL or Video ID" 
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                  />
                </form>
              )}
            </div>
          </div>
        )}
        
        <LiveReactions />
        
        {/* Overlay to prevent ANY interactions (clicks, double clicks, seeking) if not authorized */}
        {!canControl && (() => {
          const needsClickToPlay = videoState?.isPlaying && actualPlayerState !== 1 && actualPlayerState !== 3 && actualPlayerState !== 0;
          return (
            <div 
              className={`absolute inset-0 z-10 ${needsClickToPlay ? 'cursor-pointer' : 'cursor-not-allowed'}`} 
              title="Only the Host can control the video"
              onClick={() => {
                 if (playerRef.current && needsClickToPlay) {
                   playerRef.current.playVideo();
                 }
              }}
            >
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 border border-white/10">
                Viewing as Participant
              </div>
              
              {/* If the host is playing, but the participant's video is stuck (due to browser autoplay policies), prompt them to click */}
              {needsClickToPlay && !hasInteracted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-[#7e8df6]/90 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_30px_rgba(126,141,246,0.5)] animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    Click anywhere to sync playback
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {videoState?.videoId && (
        <div className="flex justify-center mt-2">
          <ReactionPicker />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
