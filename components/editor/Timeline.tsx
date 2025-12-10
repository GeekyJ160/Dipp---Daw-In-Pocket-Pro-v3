import React, { useEffect, useRef, useState } from 'react';
import { Track } from '../../types';

interface TimelineProps {
  tracks: Track[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  bpm: number;
  setBpm: (bpm: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  tracks, 
  isPlaying, 
  onTogglePlay, 
  onStop,
  bpm,
  setBpm
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastPauseTimeRef = useRef<number>(0);

  // Animation Loop
  const animate = (time: number) => {
    if (startTimeRef.current === 0) startTimeRef.current = time;
    
    // Calculate time delta
    const rawTime = (time - startTimeRef.current) / 1000;
    setCurrentTime(lastPauseTimeRef.current + rawTime);
    
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
        startTimeRef.current = 0; // Reset relative start
        requestRef.current = requestAnimationFrame(animate);
    } else {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        lastPauseTimeRef.current = currentTime;
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Reset handling
  useEffect(() => {
    if (currentTime === 0 && !isPlaying) {
        lastPauseTimeRef.current = 0;
    }
  }, [currentTime, isPlaying]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize
    canvas.width = Math.max(container.clientWidth, 2000);
    canvas.height = Math.max(container.clientHeight, (tracks.length + 1) * 100 + 100);

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    const pixelsPerBeat = 100;
    ctx.strokeStyle = '#252540';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += pixelsPerBeat) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Draw Tracks
    const trackHeight = 100;
    const startY = 50;

    tracks.forEach((track, index) => {
        const y = index * trackHeight + startY;

        // Track bg
        ctx.fillStyle = '#141420';
        ctx.fillRect(0, y, width, trackHeight);

        // Border
        ctx.beginPath();
        ctx.moveTo(0, y + trackHeight);
        ctx.lineTo(width, y + trackHeight);
        ctx.stroke();

        // Regions (Fake data visualization)
        ctx.fillStyle = track.color + '40'; // hex + alpha
        ctx.strokeStyle = track.color;
        ctx.lineWidth = 2;

        // Deterministic pseudo-random regions based on track ID
        const seed = track.id;
        for (let i = 0; i < 5; i++) {
            const regionStart = (i * 400) + ((seed % 5) * 50);
            const regionWidth = 300;
            
            if (regionStart < width) {
                // Region box
                ctx.fillRect(regionStart, y + 10, regionWidth, trackHeight - 20);
                ctx.strokeRect(regionStart, y + 10, regionWidth, trackHeight - 20);
                
                // Waveform line inside region
                ctx.beginPath();
                ctx.strokeStyle = track.color;
                ctx.lineWidth = 1;
                ctx.moveTo(regionStart, y + trackHeight/2);
                for(let w = 0; w < regionWidth; w+=5) {
                    const amp = Math.sin(w * 0.1) * 20 * Math.random();
                    ctx.lineTo(regionStart + w, y + trackHeight/2 + amp);
                }
                ctx.stroke();
            }
        }
    });

    // Playhead
    const pixelsPerSecond = 50;
    const playheadX = currentTime * pixelsPerSecond;

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Playhead Cap
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 10);
    ctx.fill();

    // Auto Scroll logic
    if (isPlaying && autoScroll) {
        if (playheadX > container.scrollLeft + container.clientWidth * 0.9) {
            container.scrollLeft = playheadX - container.clientWidth * 0.2;
        }
    }

  }, [tracks, currentTime, isPlaying, autoScroll]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary relative">
        {/* Transport Bar */}
        <div className="h-16 bg-bg-secondary border-b border-[#252540] px-6 flex gap-6 items-center shrink-0">
            <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-bg-tertiary border border-[#252540] text-white hover:bg-accent hover:text-bg-primary hover:scale-110 transition-all flex items-center justify-center">
                    <i className="fas fa-backward"></i>
                </button>
                <button 
                    onClick={onTogglePlay}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${isPlaying ? 'bg-green-500 text-bg-primary border-green-500 shadow-[0_0_15px_rgba(0,255,136,0.5)]' : 'bg-bg-tertiary text-white border-[#252540] hover:bg-accent hover:text-bg-primary hover:border-accent'}`}
                >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                </button>
                <button 
                    onClick={() => { onStop(); setCurrentTime(0); }}
                    className="w-10 h-10 rounded-full bg-bg-tertiary border border-[#252540] text-white hover:bg-accent hover:text-bg-primary hover:scale-110 transition-all flex items-center justify-center"
                >
                    <i className="fas fa-stop"></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-bg-tertiary border border-[#252540] text-white hover:bg-red-500 hover:text-white hover:border-red-500 hover:animate-pulse transition-all flex items-center justify-center group relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full group-hover:bg-white"></div>
                </button>
            </div>

            <div className="font-mono text-2xl font-bold text-accent min-w-[140px] drop-shadow-[0_0_5px_rgba(0,231,255,0.5)]">
                {formatTime(currentTime)}
            </div>

            <div className="flex items-center gap-3 ml-auto">
                <button 
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`h-8 px-3 rounded text-xs font-medium border transition-all flex items-center gap-2 ${
                        autoScroll 
                        ? 'bg-accent/10 border-accent text-accent' 
                        : 'bg-bg-tertiary border-[#252540] text-gray-400 hover:text-white'
                    }`}
                    title="Toggle Auto-Scroll"
                >
                    <i className={`fas fa-arrow-right ${autoScroll ? 'animate-pulse' : ''}`}></i>
                    <span>Follow</span>
                </button>

                <div className="h-8 w-px bg-[#252540] mx-2"></div>

                <label className="text-sm text-gray-400 font-medium">BPM</label>
                <input 
                    type="number" 
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-16 bg-bg-tertiary border border-[#252540] rounded px-2 py-1 text-center font-mono focus:border-accent focus:outline-none"
                />
            </div>
        </div>

        {/* Canvas Container */}
        <div 
            ref={containerRef}
            className="flex-1 overflow-auto relative bg-[radial-gradient(#1a1a2e_1px,transparent_1px)] [background-size:20px_20px]"
        >
            <canvas 
                ref={canvasRef}
                className="absolute top-0 left-0 cursor-crosshair"
            />
            
            {/* Decorative Visualizer Overlay at bottom */}
            <div className="fixed bottom-0 left-[280px] right-0 h-20 pointer-events-none flex items-end justify-center gap-1 px-4 opacity-30">
                 {[...Array(50)].map((_, i) => (
                     <div 
                        key={i} 
                        className="w-2 bg-gradient-to-t from-accent to-brand-purple rounded-t-sm transition-all duration-100 ease-out"
                        style={{ 
                            height: isPlaying ? `${Math.random() * 100}%` : '10%' 
                        }}
                     />
                 ))}
            </div>
        </div>
    </div>
  );
};