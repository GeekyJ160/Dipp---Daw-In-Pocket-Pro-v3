import React from 'react';
import { Track, TrackType, ProjectStats } from '../../types';
import { Button } from '../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  tracks: Track[];
  stats: ProjectStats;
  onAddTrack: () => void;
  onDeleteTrack: (id: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, tracks, stats, onAddTrack, onDeleteTrack }) => {
  return (
    <aside 
      className={`
        fixed md:relative z-10 h-[calc(100vh-64px)] w-[280px] bg-bg-secondary border-r border-[#252540] flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}
      `}
    >
      {/* Tabs */}
      <div className="flex border-b border-[#252540]">
        {['Tracks', 'Library', 'Mixer'].map((tab, i) => (
          <button 
            key={tab}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${i === 0 ? 'text-accent bg-bg-tertiary' : 'text-gray-500 hover:text-white'}`}
          >
            {tab}
            {i === 0 && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />}
          </button>
        ))}
      </div>

      {/* Tracks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <Button variant="primary" className="w-full justify-center mb-4" onClick={onAddTrack} icon={<i className="fas fa-plus" />}>
          Add Track
        </Button>

        {tracks.map(track => (
          <div 
            key={track.id}
            className="group bg-bg-tertiary border border-[#252540] rounded-lg p-3 hover:border-accent hover:translate-x-1 transition-all relative overflow-hidden cursor-pointer"
            style={{ borderColor: track.solo ? track.color : undefined }}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 transition-transform duration-300" 
              style={{ backgroundColor: track.color }} 
            />
            
            <div className="flex justify-between items-center mb-2 pl-2">
              <span className="font-semibold text-sm">{track.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-xs text-gray-400 hover:text-white"><i className="fas fa-volume-mute"></i></button>
                <button className="p-1 text-xs text-gray-400 hover:text-white"><i className="fas fa-headphones"></i></button>
                <button 
                    className="p-1 text-xs text-gray-400 hover:text-red-400"
                    onClick={(e) => { e.stopPropagation(); onDeleteTrack(track.id); }}
                >
                    <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            {/* Mini visualizer placeholder */}
            <div className="h-8 bg-bg-secondary rounded opacity-50 flex items-end gap-[2px] overflow-hidden px-1 pb-1">
                {[...Array(20)].map((_, i) => (
                     <div key={i} className="w-full bg-accent/30" style={{ height: `${Math.random() * 100}%`}}></div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Project Stats */}
      <div className="p-4 bg-bg-tertiary border-t border-[#252540]">
        <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
                <div className="text-lg font-bold text-accent">{stats.trackCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Tracks</div>
            </div>
            <div className="text-center">
                <div className="text-lg font-bold text-accent">{stats.duration}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Time</div>
            </div>
            <div className="text-center">
                <div className="text-lg font-bold text-accent">{stats.bpm}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">BPM</div>
            </div>
        </div>
      </div>
    </aside>
  );
};