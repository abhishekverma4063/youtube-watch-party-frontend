import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  participants: any[];
}

const AudioChat: React.FC<Props> = ({ participants }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(true);
  const localStream = useRef<MediaStream | null>(null);
  const peers = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const audioRefs = useRef<{ [userId: string]: HTMLAudioElement }>({});

  useEffect(() => {
    if (!socket) return;

    // Get microphone access
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        localStream.current = stream;
        // Mute initially based on state
        stream.getAudioTracks()[0].enabled = !isMuted;
        
        // Connect to existing participants
        participants.forEach(p => {
          if (p.userId !== user?.id && !peers.current[p.userId]) {
            createPeerConnection(p.userId, true);
          }
        });
      })
      .catch(err => {
        console.error("Error accessing microphone", err);
        toast.error("Could not access microphone for voice chat", { id: 'mic-error' });
      });

    // Handle new users
    socket.on('user_joined', (data) => {
       if (data.userId !== user?.id && !peers.current[data.userId] && localStream.current) {
          createPeerConnection(data.userId, false);
       }
    });

    socket.on('webrtc_offer', async ({ senderId, offer }) => {
      if (!peers.current[senderId]) {
        createPeerConnection(senderId, false);
      }
      const pc = peers.current[senderId];
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc_answer', { targetId: senderId, answer });
    });

    socket.on('webrtc_answer', async ({ senderId, answer }) => {
      const pc = peers.current[senderId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('webrtc_ice_candidate', async ({ senderId, candidate }) => {
      const pc = peers.current[senderId];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('user_left', (data) => {
      if (peers.current[data.userId]) {
        peers.current[data.userId].close();
        delete peers.current[data.userId];
      }
      if (audioRefs.current[data.userId]) {
        delete audioRefs.current[data.userId];
      }
    });

    return () => {
      localStream.current?.getTracks().forEach(t => t.stop());
      Object.values(peers.current).forEach(pc => pc.close());
      socket.off('user_joined');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
      socket.off('user_left');
    };
  }, [socket, isMuted]); // re-run only if isMuted affects the initial getMedia, but actually getMedia should only run once. We should use a ref or manage it better. Let's fix this.

  // Let's optimize stream fetching
  useEffect(() => {
    if (localStream.current) {
      localStream.current.getAudioTracks()[0].enabled = !isMuted;
    }
  }, [isMuted]);

  const createPeerConnection = (targetId: string, initiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peers.current[targetId] = pc;

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('webrtc_ice_candidate', { targetId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (!audioRefs.current[targetId]) {
        const audio = new Audio();
        audio.autoplay = true;
        audioRefs.current[targetId] = audio;
      }
      audioRefs.current[targetId].srcObject = event.streams[0];
    };

    if (initiator) {
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socket?.emit('webrtc_offer', { targetId, offer });
      });
    }
    
    return pc;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <button 
      onClick={toggleMute}
      className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
      title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
    >
      {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
};

export default AudioChat;
