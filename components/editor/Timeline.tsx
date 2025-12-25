import React, { useEffect, useRef, useState } from 'react';
import { Track, Region } from '../../types';

interface TimelineProps {
  tracks: Track[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  onTrackUpdate: (trackId: number, newRegions: Region[]) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  tracks, 
  isPlaying, 
  onTogglePlay, 
  onStop,
  bpm,
  setBpm,
  onTrackUpdate,
  currentTime,
  setCurrentTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [zoom, setZoom] = useState(50); // pixels per second
  
  // Interaction State
  const [selectedRegion, setSelectedRegion] = useState<{ trackId: number, regionId: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<{ trackId: number, regionId: string, initialStartTime: number, initialMouseX: number } | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Animation Loop
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastPauseTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (startTimeRef.current === 0) startTimeRef.current = time;
    const rawTime = (time - startTimeRef.current) / 1000;
    setCurrentTime(lastPauseTimeRef.current + rawTime);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
        startTimeRef.current = 0;
        requestRef.current = requestAnimationFrame(animate);
    } else {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        lastPauseTimeRef.current = currentTime;
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, currentTime, setCurrentTime]);

  // Keyboard Shortcuts for Selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedRegion) return;

      const { trackId, regionId } = selectedRegion;
      const track = tracks.find(t => t.id === trackId);
      if (!track) return;

      const region = track.regions.find(r => r.id === regionId);
      if (!region) return;

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const newRegions = track.regions.filter(r => r.id !== regionId);
        onTrackUpdate(trackId, newRegions);
        setSelectedRegion(null);
      }

      // Duplicate (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const newRegion: Region = {
          ...region,
          id: `r-${Date.now()}`,
          start: region.start + region.duration,
          name: `${region.name} (Copy)`
        };
        const newRegions = [...track.regions, newRegion];
        onTrackUpdate(trackId, newRegions);
        setSelectedRegion({ trackId, regionId: newRegion.id });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRegion, tracks, onTrackUpdate]);

  /**
   * Auto-scroll Logic (Follow Mode)
   * This implementation uses "Paging" logic common in professional DAWs.
   * When the playhead reaches the right 90% of the visible container, 
   * the view jumps forward so the playhead is at the left 10% mark.
   */
  useEffect(() => {
    if (!isPlaying || !autoScroll || !containerRef.current) return;

    const container = containerRef.current;
    const playheadX = currentTime * zoom;
    const visibleStart = container.scrollLeft;
    const visibleWidth = container.clientWidth;
    const visibleEnd = visibleStart + visibleWidth;

    // Threshold for jumping (90% of visible width)
    const jumpThreshold = visibleStart + (visibleWidth * 0.9);

    // If playhead goes out of bounds (past threshold or before left edge)
    if (playheadX > jumpThreshold || playheadX < visibleStart) {
      // Jump so the playhead is at 10% from the left for a fresh view
      const newScrollLeft = Math.max(0, playheadX - (visibleWidth * 0.1));
      container.scrollTo({ left: newScrollLeft, behavior: 'auto' });
    }
  }, [currentTime, isPlaying, autoScroll, zoom]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let maxTime = 60;
    tracks.forEach(t => t.regions.forEach(r => maxTime = Math.max(maxTime, r.start + r.duration)));
    
    const contentWidth = Math.max(container.clientWidth, maxTime * zoom + 1000);
    const contentHeight = Math.max(container.clientHeight, (tracks.length + 1) * 100 + 50);

    if (canvas.width !== contentWidth || canvas.height !== contentHeight) {
        canvas.width = contentWidth;
        canvas.height = contentHeight;
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const secondsPerBeat = 60 / bpm;
    const pixelsPerBeat = secondsPerBeat * zoom;
    
    ctx.strokeStyle = '#252540';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += pixelsPerBeat) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
    }
    ctx.stroke();

    const trackHeight = 100;
    const startY = 40;

    const isAnySolo = tracks.some(t => t.solo);

    tracks.forEach((track, index) => {
        const y = index * trackHeight + startY;
        const isEffectivelyMuted = track.muted || (isAnySolo && !track.solo);

        ctx.fillStyle = index % 2 === 0 ? '#141420' : '#11111b';
        ctx.fillRect(0, y, width, trackHeight);

        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(0, y + trackHeight);
        ctx.lineTo(width, y + trackHeight);
        ctx.stroke();

        track.regions.forEach(region => {
            const x = region.start * zoom;
            const w = region.duration * zoom;
            const isSelected = selectedRegion?.regionId === region.id;

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y + 5, w, trackHeight - 10, 6);
            ctx.clip();

            if (isEffectivelyMuted) {
              ctx.fillStyle = '#1a1a2e';
            } else {
              ctx.fillStyle = isSelected ? track.color + '55' : track.color + '33';
            }
            ctx.fillRect(x, y + 5, w, trackHeight - 10);
            
            ctx.strokeStyle = isSelected ? '#ffffff' : (isEffectivelyMuted ? '#252540' : track.color);
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(x, y + 5, w, trackHeight - 10);

            if (isSelected && !isEffectivelyMuted) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = track.color;
              ctx.strokeRect(x, y + 5, w, trackHeight - 10);
            }

            ctx.fillStyle = isEffectivelyMuted ? '#444' : '#fff';
            ctx.font = `bold ${isSelected ? '11px' : '10px'} "Outfit", sans-serif`;
            ctx.fillText(region.name, x + 5, y + 20);

            ctx.beginPath();
            ctx.strokeStyle = isEffectivelyMuted ? '#333' : (isSelected ? '#ffffff' : track.color);
            ctx.lineWidth = 1;
            
            const middleY = y + trackHeight / 2;
            const step = 2;
            const currentVolume = isEffectivelyMuted ? 0 : track.volume;

            for (let px = 0; px < w; px += step) {
                const timeOffset = px;
                const noise = Math.sin(timeOffset * 0.1 + region.waveformSeed) * Math.cos(timeOffset * 0.5 + region.waveformSeed * 2);
                const heightVal = Math.abs(noise) * (trackHeight - 30) * 0.4 * currentVolume;
                ctx.moveTo(x + px, middleY - heightVal);
                ctx.lineTo(x + px, middleY + heightVal);
            }
            ctx.stroke();
            ctx.restore();
        });
    });

    ctx.fillStyle = '#141420';
    ctx.fillRect(0, 0, width, startY);
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    for (let sec = 0; sec < maxTime + 20; sec++) {
        const x = sec * zoom;
        if (x > width) break;
        ctx.fillRect(x, startY - 5, 1, 5);
        if (sec % 5 === 0) {
            ctx.fillRect(x, startY - 10, 1, 10);
            ctx.fillText(formatTimeShort(sec), x + 3, startY - 12);
        }
    }
    ctx.strokeStyle = '#252540';
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(width, startY);
    ctx.stroke();

    const playheadX = currentTime * zoom;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 12);
    ctx.lineTo(playheadX - 6, 0);
    ctx.fill();

  }, [tracks, currentTime, isPlaying, zoom, bpm, selectedRegion]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  };

  const formatTimeShort = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = x / zoom;

    if (y < 40) {
        setIsScrubbing(true);
        setCurrentTime(time);
        return;
    }

    const startY = 40;
    const trackHeight = 100;
    const trackIndex = Math.floor((y - startY) / trackHeight);
    
    if (trackIndex >= 0 && trackIndex < tracks.length) {
        const track = tracks[trackIndex];
        const region = track.regions.find(r => time >= r.start && time <= r.start + r.duration);
        
        if (region) {
            setSelectedRegion({ trackId: track.id, regionId: region.id });
            setIsDragging(true);
            setDragTarget({
                trackId: track.id,
                regionId: region.id,
                initialStartTime: region.start,
                initialMouseX: e.clientX
            });
        } else {
            setSelectedRegion(null);
        }
    } else {
        setSelectedRegion(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScrubbing) {
         const rect = canvasRef.current?.getBoundingClientRect();
         if (!rect) return;
         const x = e.clientX - rect.left;
         const newTime = Math.max(0, x / zoom);
         setCurrentTime(newTime);
         return;
    }

    if (isDragging && dragTarget) {
        const deltaPixels = e.clientX - dragTarget.initialMouseX;
        const deltaTime = deltaPixels / zoom;
        const newStart = Math.max(0, dragTarget.initialStartTime + deltaTime);

        const track = tracks.find(t => t.id === dragTarget.trackId);
        if (track) {
            const newRegions = track.regions.map(r => 
                r.id === dragTarget.regionId ? { ...r, start: newStart } : r
            );
            onTrackUpdate(dragTarget.trackId, newRegions);
        }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsScrubbing(false);
    setDragTarget(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary relative">
        <div className="h-16 bg-bg-secondary border-b border-[#252540] px-6 flex gap-6 items-center shrink-0">
            <div className="flex gap-2">
                <button 
                    onClick={() => {
                        setCurrentTime(0);
                        if (containerRef.current) containerRef.current.scrollLeft = 0;
                    }}
                    className="w-10 h-10 rounded-full bg-bg-tertiary border border-[#252540] text-white hover:bg-accent hover:text-bg-primary hover:scale-110 transition-all flex items-center justify-center"
                    title="Reset to Start"
                >
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
            </div>

            <div className="font-mono text-2xl font-bold text-accent min-w-[140px] drop-shadow-[0_0_5px_rgba(0,231,255,0.5)] select-none">
                {formatTime(currentTime)}
            </div>

            <div className="flex items-center gap-3 ml-auto">
                <div className="flex bg-bg-tertiary rounded border border-[#252540]">
                    <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5">
                        <i className="fas fa-minus"></i>
                    </button>
                    <div className="w-px bg-[#252540]"></div>
                    <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5">
                        <i className="fas fa-plus"></i>
                    </button>
                </div>

                <div className="h-8 w-px bg-[#252540] mx-2"></div>

                <button 
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`h-8 px-3 rounded text-xs font-medium border transition-all flex items-center gap-2 ${
                        autoScroll 
                        ? 'bg-accent/10 border-accent text-accent' 
                        : 'bg-bg-tertiary border-[#252540] text-gray-400 hover:text-white'
                    }`}
                    title={autoScroll ? "Disable Auto-scroll" : "Enable Auto-scroll"}
                >
                    <i className={`fas fa-arrow-right-to-bracket ${autoScroll ? 'animate-pulse' : ''}`}></i>
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

        <div 
            ref={containerRef}
            className="flex-1 overflow-auto relative bg-[radial-gradient(#1a1a2e_1px,transparent_1px)] [background-size:20px_20px] custom-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <canvas ref={canvasRef} className="absolute top-0 left-0 cursor-crosshair" />
            
            {isScrubbing && (
                <div 
                    className="absolute top-10 bg-accent text-bg-primary text-xs font-bold px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2"
                    style={{ left: currentTime * zoom }}
                >
                    {formatTime(currentTime)}
                </div>
            )}

            {selectedRegion && (
              <div className="absolute top-20 right-6 bg-bg-tertiary/80 backdrop-blur px-3 py-1.5 rounded-lg border border-accent/30 text-[10px] text-gray-400 font-mono shadow-xl pointer-events-none animate-fadeIn">
                <span className="text-accent font-bold">Region Selected</span>: [Delete] to remove, [Ctrl+D] to duplicate
              </div>
            )}
        </div>
    </div>
  );
};