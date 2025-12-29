import React, { useState, useMemo } from 'react';
import { Track, TrackType, ProjectStats, SidebarTab } from '../../types';
import { Button } from '../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  tracks: Track[];
  stats: ProjectStats;
  onAddTrack: () => void;
  onDeleteTrack: (id: number) => void;
  onVolumeChange: (id: number, volume: number) => void;
  onPanChange: (id: number, pan: number) => void;
  onToggleMute: (id: number) => void;
  onToggleSolo: (id: number) => void;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  duration?: string;
  type: 'loop' | 'one-shot';
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  tracks, 
  stats, 
  onAddTrack, 
  onDeleteTrack,
  onVolumeChange,
  onPanChange,
  onToggleMute,
  onToggleSolo
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.TRACKS);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isAnySolo = tracks.some(t => t.solo);

  const assets: Asset[] = useMemo(() => [
    { id: '1', name: 'Crunchy_Vinyl_Kick.wav', category: 'Drums', type: 'one-shot' },
    { id: '2', name: 'Neon_Future_Lead_128bpm.wav', category: 'Synths', type: 'loop', duration: '8.0s' },
    { id: '3', name: 'Soulful_Rhodes_Chords.mid', category: 'MIDI', type: 'loop', duration: '16.0s' },
    { id: '4', name: 'Cyber_Atmosphere_Pad.wav', category: 'FX', type: 'loop', duration: '32.0s' },
    { id: '5', name: 'Trap_Hat_Roll_01.wav', category: 'Drums', type: 'one-shot' },
  ], []);

  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderTracks = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar animate-fadeIn">
      <Button variant="primary" className="w-full justify-center mb-4" onClick={onAddTrack} icon={<i className="fas fa-plus" />}>
        Add Track
      </Button>

      {tracks.map(track => {
        const isEffectivelyMuted = track.muted || (isAnySolo && !track.solo);
        
        return (
          <div 
            key={track.id}
            className={`group bg-bg-tertiary border border-[#252540] rounded-lg p-3 hover:border-accent hover:translate-x-1 transition-all relative overflow-hidden cursor-pointer ${isEffectivelyMuted ? 'opacity-60 grayscale-[0.5]' : ''}`}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 transition-transform duration-300" 
              style={{ backgroundColor: track.color }} 
            />
            
            <div className="flex justify-between items-center mb-2 pl-2">
              <span className="font-semibold text-sm truncate pr-2">{track.name}</span>
              <div className="flex gap-1 shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleMute(track.id); }}
                  className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded transition-colors ${track.muted ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-bg-secondary text-gray-400 hover:text-white'}`}
                >M</button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleSolo(track.id); }}
                  className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded transition-colors ${track.solo ? 'bg-accent text-bg-primary shadow-[0_0_8px_rgba(0,231,255,0.4)]' : 'bg-bg-secondary text-gray-400 hover:text-white'}`}
                >S</button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1 mb-2 group/vol relative">
                 <div className="flex-1 relative h-4 flex items-center">
                   <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      aria-label={`Volume for ${track.name}`}
                      value={track.volume}
                      onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
                      className="w-full h-1 bg-bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                   />
                 </div>
                 <div className="text-[10px] w-9 text-right font-mono text-gray-500 group-hover/vol:text-accent font-bold">
                    {Math.round(track.volume * 100)}%
                 </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLibrary = () => (
    <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn bg-bg-primary/20">
      <div className="p-4 space-y-4 border-b border-[#252540] bg-bg-tertiary/40">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-tertiary border border-[#252540] rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:border-accent focus:outline-none placeholder-gray-600 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['All', 'Loops', 'MIDI', 'Drums', 'Synths'].map(filter => (
            <button key={filter} className="whitespace-nowrap px-3 py-1 bg-bg-secondary border border-[#252540] rounded-full text-[10px] text-gray-500 hover:border-accent hover:text-accent transition-all font-bold">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {filteredAssets.map(asset => (
          <div 
            key={asset.id} 
            onClick={() => setSelectedAsset(asset)}
            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${selectedAsset?.id === asset.id ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(0,231,255,0.1)]' : 'border-transparent hover:bg-bg-tertiary'}`}
          >
            <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] ${asset.category === 'MIDI' ? 'bg-brand-purple/20 text-brand-purple' : 'bg-accent/20 text-accent'}`}>
              <i className={`fas ${asset.category === 'Drums' ? 'fa-drum' : asset.category === 'MIDI' ? 'fa-file-lines' : 'fa-wave-square'}`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate text-gray-300">{asset.name}</div>
              <div className="text-[9px] text-gray-600 font-mono uppercase tracking-tighter">{asset.category} • {asset.duration || 'One-Shot'}</div>
            </div>
            {selectedAsset?.id === asset.id && <i className="fas fa-play text-[10px] text-accent animate-pulse"></i>}
          </div>
        ))}
      </div>

      {selectedAsset && (
        <div className="p-4 bg-bg-tertiary/90 backdrop-blur-md border-t border-[#252540] animate-slideUp">
          <div className="flex justify-between items-start mb-3">
             <div className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Previewer</div>
             <button onClick={() => setSelectedAsset(null)} className="text-gray-600 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
          </div>
          <div className="h-12 bg-black/40 rounded border border-[#252540] mb-3 relative overflow-hidden flex items-center px-2">
              <div className="w-full h-6 flex items-end gap-[1.5px]">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="flex-1 bg-accent/40 rounded-t-[1px]" style={{ height: `${10 + Math.random() * 90}%` }} />
                  ))}
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_white] animate-scan" style={{ animation: 'scan 2s linear infinite' }} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1 justify-center text-xs" icon={<i className="fas fa-plus"/>}>Import to Track</Button>
            <Button variant="secondary" className="w-10 h-10 p-0 justify-center"><i className="fas fa-heart text-gray-600 hover:text-brand-pink transition-colors"/></Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMixer = () => (
    <div className="flex-1 overflow-x-auto flex custom-scrollbar animate-fadeIn bg-[#0d0d15]">
      {tracks.map(track => {
        const isEffectivelyMuted = track.muted || (isAnySolo && !track.solo);
        const panValue = track.pan || 0;
        
        return (
          <div key={track.id} className="w-[110px] shrink-0 border-r border-[#252540] flex flex-col items-center py-4 bg-gradient-to-b from-transparent to-black/20">
            {/* Pan Knob */}
            <div className="mb-4 flex flex-col items-center relative group">
              <div className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest">Pan</div>
              <div className="relative w-14 h-1.5 bg-black rounded-full overflow-hidden border border-[#252540]">
                <div 
                  className="absolute top-0 bottom-0 w-1.5 bg-accent shadow-[0_0_8px_#00e7ff]" 
                  style={{ left: `${50 + panValue * 50}%`, transform: 'translateX(-50%)' }} 
                />
              </div>
              <div className="text-[8px] font-mono mt-1 text-gray-400 group-hover:text-accent transition-colors">
                {panValue === 0 ? 'C' : panValue < 0 ? `L${Math.abs(Math.round(panValue * 100))}` : `R${Math.round(panValue * 100)}`}
              </div>
              <input 
                type="range" min="-1" max="1" step="0.01" 
                value={panValue} 
                onChange={(e) => onPanChange(track.id, parseFloat(e.target.value))}
                className="w-14 h-4 opacity-0 absolute top-4 cursor-pointer z-10"
              />
            </div>

            {/* Inserts Rack */}
            <div className="w-[85%] space-y-1.5 mb-6">
                <div className="text-[8px] font-black uppercase text-gray-600 mb-1 text-center">Inserts</div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-4.5 rounded-[3px] border text-[8px] flex items-center justify-center font-black uppercase tracking-tighter transition-all cursor-pointer ${track.fxEnabled && i === 0 ? 'bg-brand-purple/20 border-brand-purple/50 text-brand-purple' : 'bg-bg-tertiary border-[#252540] text-gray-700 hover:text-gray-400'}`}>
                    {i === 0 && track.fxEnabled ? 'DYN-EQ v2' : '- empty -'}
                  </div>
                ))}
            </div>

            {/* Meter */}
            <div className="flex-1 w-8 bg-black rounded-sm border-2 border-[#1a1a2e] p-[2.5px] relative flex flex-col justify-end overflow-hidden mb-4">
              <div className="absolute inset-0 flex flex-col justify-between py-1 px-[1px] opacity-10 pointer-events-none z-10">
                {[...Array(20)].map((_, i) => <div key={i} className="h-px bg-white w-full" />)}
              </div>
              <div 
                className="w-full transition-all duration-75 rounded-t-[1px]"
                style={{ 
                  height: `${isEffectivelyMuted ? 0 : Math.max(3, track.volume * (30 + Math.random() * 70))}%`, 
                  backgroundColor: track.color,
                  boxShadow: `0 -4px 15px ${track.color}88`
                }}
              />
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 opacity-20" />
            </div>

            {/* Fader */}
            <div className="h-48 w-12 relative flex justify-center mb-6">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-2 bg-black rounded-full border border-[#252540]" />
              <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none opacity-20 flex flex-col justify-between items-center py-2 px-1">
                  {[...Array(10)].map((_, i) => <div key={i} className="w-full h-[1px] bg-gray-400" />)}
              </div>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={track.volume}
                onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
                className="mixer-fader absolute inset-0 cursor-pointer z-20"
                style={{ appearance: 'none', background: 'transparent', width: '100%', height: '100%', WebkitAppearance: 'slider-vertical' } as any}
              />
              <div 
                className="absolute w-8 h-12 bg-bg-tertiary border-2 rounded-sm shadow-2xl pointer-events-none z-10 flex flex-col justify-center items-center group-hover:scale-105 transition-transform"
                style={{ bottom: `${track.volume * 85}%`, borderColor: track.color }}
              >
                <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: track.color, boxShadow: `0 0 10px ${track.color}` }} />
              </div>
            </div>

            {/* Strip Footer */}
            <div className="w-full space-y-2 px-2.5">
              <div className="flex gap-1.5">
                <button 
                  onClick={() => onToggleMute(track.id)}
                  className={`flex-1 h-7 text-[10px] font-black rounded border transition-all ${track.muted ? 'bg-red-500 border-red-400 text-white' : 'bg-bg-tertiary border-[#252540] text-gray-500 hover:text-gray-300'}`}
                >M</button>
                <button 
                  onClick={() => onToggleSolo(track.id)}
                  className={`flex-1 h-7 text-[10px] font-black rounded border transition-all ${track.solo ? 'bg-accent border-accent-dark text-bg-primary' : 'bg-bg-tertiary border-[#252540] text-gray-500 hover:text-gray-300'}`}
                >S</button>
              </div>
              <div className="bg-black/40 rounded-[4px] py-1.5 border border-[#252540] shadow-inner">
                  <div className="text-[9px] font-black text-center truncate px-1 uppercase tracking-tighter" style={{ color: track.color }}>{track.name}</div>
                  <div className="text-[8px] font-mono text-center text-gray-600 mt-0.5">{Math.round(track.volume * 100)} dB</div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Master Section */}
      <div className="w-[140px] shrink-0 border-r-2 border-accent/20 bg-[#0a0a14] flex flex-col items-center py-4 relative shadow-2xl">
        <div className="absolute top-2 text-[10px] font-black text-accent tracking-[0.4em] uppercase opacity-40">Main Out</div>
        
        <div className="flex-1 w-12 bg-black rounded-sm border-2 border-accent/20 p-[3px] relative flex items-end gap-[3px] mb-4 mt-8">
           <div className="flex-1 h-[75%] bg-gradient-to-t from-accent via-accent to-brand-pink rounded-t-[1px] shadow-[0_0_20px_rgba(0,231,255,0.4)] transition-all duration-100"></div>
           <div className="flex-1 h-[73%] bg-gradient-to-t from-accent via-accent to-brand-pink rounded-t-[1px] shadow-[0_0_20px_rgba(0,231,255,0.4)] transition-all duration-100"></div>
        </div>

        <div className="h-48 w-14 relative flex justify-center mb-6">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-2.5 bg-black rounded-full border border-accent/10" />
            <div className="absolute w-9 h-14 bg-accent border-2 border-white rounded shadow-[0_0_40px_rgba(0,231,255,0.5)] z-10 bottom-[65%] flex flex-col justify-center items-center">
                <div className="w-7 h-2 bg-bg-primary rounded-full shadow-inner" />
            </div>
        </div>
        
        <div className="w-full px-3 mt-auto">
            <div className="bg-accent/10 rounded-xl p-3 border border-accent/40 text-center backdrop-blur-sm">
                <div className="text-[10px] font-black uppercase text-accent tracking-widest mb-1">Master</div>
                <div className="text-sm font-mono text-white font-bold">+1.2</div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <aside 
      className={`
        fixed md:relative z-10 h-[calc(100vh-64px)] w-[320px] bg-bg-secondary border-r border-[#252540] flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
      `}
    >
      <div className="flex border-b border-[#252540] bg-bg-tertiary shrink-0">
        {(Object.values(SidebarTab) as SidebarTab[]).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative ${activeTab === tab ? 'text-accent bg-bg-secondary' : 'text-gray-600 hover:text-gray-300'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-accent shadow-[0_0_15px_#00e7ff]" />}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === SidebarTab.TRACKS && renderTracks()}
        {activeTab === SidebarTab.LIBRARY && renderLibrary()}
        {activeTab === SidebarTab.MIXER && renderMixer()}
      </div>

      {activeTab === SidebarTab.TRACKS && (
        <div className="p-4 bg-bg-tertiary border-t border-[#252540]">
          <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-black/30 rounded-lg border border-[#252540] hover:border-accent/40 transition-colors">
                  <div className="text-sm font-bold text-accent">{stats.trackCount}</div>
                  <div className="text-[8px] uppercase tracking-wider text-gray-600 font-black">Tracks</div>
              </div>
              <div className="text-center p-2 bg-black/30 rounded-lg border border-[#252540] hover:border-accent/40 transition-colors">
                  <div className="text-sm font-bold text-accent">{stats.duration}</div>
                  <div className="text-[8px] uppercase tracking-wider text-gray-600 font-black">Time</div>
              </div>
              <div className="text-center p-2 bg-black/30 rounded-lg border border-[#252540] hover:border-accent/40 transition-colors">
                  <div className="text-sm font-bold text-accent">{stats.bpm}</div>
                  <div className="text-[8px] uppercase tracking-wider text-gray-600 font-black">BPM</div>
              </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          from { left: 0%; }
          to { left: 100%; }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </aside>
  );
};
