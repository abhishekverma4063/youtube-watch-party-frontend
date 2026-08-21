import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Wifi, WifiHigh, WifiLow } from 'lucide-react';

const NetworkLatency: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    if (!socket || !isConnected) return;

    let pingStart: number;
    
    const interval = setInterval(() => {
      pingStart = Date.now();
      socket.emit('ping_req');
    }, 2000); // Check every 2s

    const handlePong = () => {
      setLatency(Date.now() - pingStart);
    };

    socket.on('pong_res', handlePong);

    return () => {
      clearInterval(interval);
      socket.off('pong_res', handlePong);
    };
  }, [socket, isConnected]);

  if (!isConnected) return null;

  // Determine quality
  const getQualityColor = () => {
    if (latency < 50) return 'text-emerald-400';
    if (latency < 150) return 'text-amber-400';
    return 'text-red-400';
  };

  const getQualityIcon = () => {
    if (latency < 50) return <WifiHigh size={16} className={getQualityColor()} />;
    if (latency < 150) return <Wifi size={16} className={getQualityColor()} />;
    return <WifiLow size={16} className={getQualityColor()} />;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full shadow-inner" title={`Network Latency: ${latency}ms`}>
      {getQualityIcon()}
      <span className={`text-xs font-bold font-mono tracking-wider w-8 ${getQualityColor()}`}>
        {latency}ms
      </span>
    </div>
  );
};

export default NetworkLatency;
