import React, { useState, useEffect, useCallback } from 'react';

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTE_MAP: Record<string, { note: string, type: 'white' | 'black', offset: number }> = {
  'a': { note: 'C', type: 'white', offset: 0 },
  'w': { note: 'C#', type: 'black', offset: 0.5 },
  's': { note: 'D', type: 'white', offset: 1 },
  'e': { note: 'D#', type: 'black', offset: 1.5 },
  'd': { note: 'E', type: 'white', offset: 2 },
  'f': { note: 'F', type: 'white', offset: 3 },
  't': { note: 'F#', type: 'black', offset: 3.5 },
  'g': { note: 'G', type: 'white', offset: 4 },
  'y': { note: 'G#', type: 'black', offset: 4.5 },
  'h': { note: 'A', type: 'white', offset: 5 },
  'u': { note: 'A#', type: 'black', offset: 5.5 },
  'j': { note: 'B', type: 'white', offset: 6 },
  'k': { note: 'C', type: 'white', offset: 7 },
  'o': { note: 'C#', type: 'black', offset: 7.5 },
  'l': { note: 'D', type: 'white', offset: 8 },
  'p': { note: 'D#', type: 'black', offset: 8.5 },
  ';': { note: 'E', type: 'white', offset: 9 },
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ isOpen, onClose }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [octave, setOctave] = useState(4);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (NOTE_MAP[key]) {
      setActiveKeys(prev => new Set(prev).add(key));
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  if (!isOpen) return null;

  const renderKeys = () => {
    const keys = [];
    const whiteKeyWidth = 40;
    
    // Render 10 white keys for nearly 1.5 octaves
    for (let i = 0; i < 10; i++) {
      const keyChar = Object.keys(NOTE_MAP).find(k => NOTE_MAP[k].type === 'white' && NOTE_MAP[k].offset === i);
      const isActive = keyChar && activeKeys.has(keyChar);
      
      keys.push(
        <div 
          key={`white-${i}`}
          className={`relative h-full border-r border-gray-300 transition-all duration-75 flex flex-col justify-end items-center pb-2 select-none cursor-pointer
            ${isActive ? 'bg-accent shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2)] h-[98%]' : 'bg-white hover:bg-gray-100'}`}
          style={{ width: whiteKeyWidth }}
          onMouseDown={() => keyChar && setActiveKeys(prev => new Set(prev).add(keyChar))}
          onMouseUp={() => keyChar && setActiveKeys(prev => {
            const n = new Set(prev); n.delete(keyChar); return n;
          })}
        >
          <span className={`text-[9px] font-bold ${isActive ? 'text-bg-primary' : 'text-gray-400'}`}>
            {keyChar?.toUpperCase()}
          </span>
        </div>
      );
    }

    // Render black keys on top
    const blackKeys = [];
    const blackKeyWidth = 24;
    for (let i = 0; i < 10; i++) {
        const offset = i + 0.5;
        const keyChar = Object.keys(NOTE_MAP).find(k => NOTE_MAP[k].type === 'black' && NOTE_MAP[k].offset === offset);
        if (!keyChar) continue;
        
        const isActive = activeKeys.has(keyChar);
        
        blackKeys.push(
            <div 
                key={`black-${i}`}
                className={`absolute top-0 h-[60%] border-x border-black z-10 transition-all duration-75 flex flex-col justify-end items-center pb-1 select-none cursor-pointer rounded-b-sm
                    ${isActive ? 'bg-brand-purple shadow-[0_5px_15px_rgba(185,103,255,0.4)] h-[58%]' : 'bg-bg-primary hover:bg-gray-900'}`}
                style={{ 
                    width: blackKeyWidth, 
                    left: offset * whiteKeyWidth - (blackKeyWidth / 2) 
                }}
                onMouseDown={() => setActiveKeys(prev => new Set(prev).add(keyChar))}
                onMouseUp={() => setActiveKeys(prev => {
                    const n = new Set(prev); n.delete(keyChar); return n;
                })}
            >
                <span className={`text-[8px] font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {keyChar.toUpperCase()}
                </span>
            </div>
        );
    }

    return (
      <div className="relative flex h-full">
        {keys}
        {blackKeys}
      </div>
    );
  };

  return (
    <div className="h-40 bg-bg-secondary border-t border-[#252540] flex animate-slideUp z-30 shrink-0">
      {/* Controls */}
      <div className="w-48 border-r border-[#252540] p-4 flex flex-col gap-3 bg-bg-tertiary">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-accent tracking-widest">Octave</span>
            <span className="text-xs font-mono text-white">{octave}</span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setOctave(Math.max(0, octave - 1))}
                className="flex-1 h-8 bg-bg-secondary border border-[#252540] rounded hover:border-accent text-white text-xs"
            >
                <i className="fas fa-minus"></i>
            </button>
            <button 
                onClick={() => setOctave(Math.min(8, octave + 1))}
                className="flex-1 h-8 bg-bg-secondary border border-[#252540] rounded hover:border-accent text-white text-xs"
            >
                <i className="fas fa-plus"></i>
            </button>
        </div>
        <div className="mt-auto flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span className="text-[9px] text-gray-500 font-bold uppercase">MIDI Active</span>
             </div>
             <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
                <i className="fas fa-chevron-down"></i>
             </button>
        </div>
      </div>

      {/* Piano Keys Container */}
      <div className="flex-1 flex justify-center py-2 bg-black/20">
        <div className="h-full border-l border-gray-300">
           {renderKeys()}
        </div>
      </div>

      {/* Mod Wheels */}
      <div className="w-32 border-l border-[#252540] p-4 flex gap-4 bg-bg-tertiary">
        <div className="flex-1 bg-black/40 rounded border border-[#252540] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-full bg-accent/20 transition-all duration-100" style={{ height: activeKeys.size > 0 ? '40%' : '10%' }}></div>
            <div className="absolute inset-0 flex items-center justify-center rotate-90 text-[8px] font-black text-gray-600 uppercase tracking-widest pointer-events-none">Pitch</div>
        </div>
        <div className="flex-1 bg-black/40 rounded border border-[#252540] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-full bg-brand-purple/20 transition-all duration-100" style={{ height: '25%' }}></div>
            <div className="absolute inset-0 flex items-center justify-center rotate-90 text-[8px] font-black text-gray-600 uppercase tracking-widest pointer-events-none">Mod</div>
        </div>
      </div>
    </div>
  );
};
