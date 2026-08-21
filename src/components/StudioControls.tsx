import React, { useState, useRef } from 'react';
import { Camera, Video, Square, Download, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const StudioControls: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
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

      // Handle user clicking "Stop sharing" on the browser banner
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
    setRecordedChunks([]); // clear after download
  };

  const takeScreenshot = async () => {
    try {
      // Due to YouTube iframe cross-origin restrictions, we cannot read pixels from it directly.
      // We'll prompt the user to select the tab they want to capture using getDisplayMedia.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
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
        }, 300); // small delay to ensure frame is painted
      };
    } catch (err) {
      console.error(err);
      toast.error('Screenshot cancelled');
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl shadow-indigo-500/10 transition-all hover:bg-zinc-900">
      <div className="flex items-center gap-2 mr-2 cursor-help" title="Record or Snapshot the Session">
        <Activity size={16} className="text-indigo-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Studio</span>
      </div>

      <button 
        onClick={takeScreenshot}
        className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors group"
        title="Take Screenshot"
      >
        <Camera size={18} className="group-hover:scale-110 transition-transform" />
      </button>

      {!isRecording ? (
        <button 
          onClick={startRecording}
          className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors group"
          title="Start Recording"
        >
          <Video size={18} className="group-hover:scale-110 transition-transform text-red-400" />
        </button>
      ) : (
        <button 
          onClick={stopRecording}
          className="p-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors group flex items-center justify-center animate-pulse"
          title="Stop Recording"
        >
          <Square size={16} className="fill-current" />
        </button>
      )}

      {recordedChunks.length > 0 && !isRecording && (
        <button 
          onClick={downloadRecording}
          className="p-2 rounded-full bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors group animate-bounce"
          title="Download Recording"
        >
          <Download size={18} />
        </button>
      )}
    </div>
  );
};

export default StudioControls;
