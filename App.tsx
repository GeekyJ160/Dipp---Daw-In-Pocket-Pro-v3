import React, { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { Timeline } from './components/editor/Timeline';
import { AIPanel } from './components/editor/AIPanel';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { Track, TrackType, ProjectStats } from './types';

const App: React.FC = () => {
  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [addTrackModalOpen, setAddTrackModalOpen] = useState(false);

  // Project State
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([
    { id: 1, name: 'Drums', type: TrackType.DRUM, color: '#ff4466', muted: false, solo: false, volume: 0.8 },
    { id: 2, name: 'Bass', type: TrackType.SYNTH, color: '#00e7ff', muted: false, solo: false, volume: 0.7 },
    { id: 3, name: 'Vocals', type: TrackType.VOCAL, color: '#b967ff', muted: false, solo: false, volume: 0.9 },
  ]);

  // Add Track Form State
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackType, setNewTrackType] = useState<TrackType>(TrackType.AUDIO);

  const handleAddTrack = () => {
    const colors = ['#ff4466', '#00e7ff', '#b967ff', '#ffaa00', '#00ff88'];
    const newTrack: Track = {
      id: Date.now(),
      name: newTrackName || `Track ${tracks.length + 1}`,
      type: newTrackType,
      color: colors[tracks.length % colors.length],
      muted: false,
      solo: false,
      volume: 0.8
    };
    setTracks([...tracks, newTrack]);
    setAddTrackModalOpen(false);
    setNewTrackName('');
  };

  const handleDeleteTrack = (id: number) => {
    if (window.confirm('Delete this track?')) {
        setTracks(tracks.filter(t => t.id !== id));
    }
  };

  const handleVolumeChange = (id: number, volume: number) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, volume } : t));
  };

  const stats: ProjectStats = {
    trackCount: tracks.length,
    duration: '3:45',
    bpm: bpm
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-gray-200 font-sans overflow-hidden">
      <TopBar 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        toggleAiPanel={() => setAiPanelOpen(!aiPanelOpen)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={sidebarOpen} 
          tracks={tracks}
          stats={stats}
          onAddTrack={() => setAddTrackModalOpen(true)}
          onDeleteTrack={handleDeleteTrack}
          onVolumeChange={handleVolumeChange}
        />
        
        <Timeline 
          tracks={tracks}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onStop={() => setIsPlaying(false)}
          bpm={bpm}
          setBpm={setBpm}
        />

        <AIPanel 
          isOpen={aiPanelOpen} 
          onClose={() => setAiPanelOpen(false)}
        />
      </div>

      {/* Floating Record Action Button */}
      <button 
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent rounded-full shadow-[0_0_20px_rgba(0,231,255,0.6)] text-bg-primary flex items-center justify-center text-2xl transition-all hover:scale-110 hover:rotate-90 z-20"
        title="Quick Record"
      >
        <i className="fas fa-microphone"></i>
      </button>

      {/* Add Track Modal */}
      <Modal 
        isOpen={addTrackModalOpen} 
        onClose={() => setAddTrackModalOpen(false)} 
        title="Add New Track"
        footer={
          <>
            <Button onClick={() => setAddTrackModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddTrack}>Create Track</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Track Name</label>
            <input 
              type="text" 
              className="w-full bg-bg-primary border border-[#252540] rounded p-2 text-white focus:border-accent focus:outline-none"
              placeholder="e.g. Lead Guitar"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <select 
              className="w-full bg-bg-primary border border-[#252540] rounded p-2 text-white focus:border-accent focus:outline-none"
              value={newTrackType}
              onChange={(e) => setNewTrackType(e.target.value as TrackType)}
            >
              <option value={TrackType.AUDIO}>Audio Recording</option>
              <option value={TrackType.MIDI}>MIDI Instrument</option>
              <option value={TrackType.VOCAL}>AI Vocal Synth</option>
              <option value={TrackType.DRUM}>Drum Machine</option>
              <option value={TrackType.SYNTH}>Synthesizer</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;