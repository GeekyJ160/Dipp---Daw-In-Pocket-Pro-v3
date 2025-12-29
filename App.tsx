import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { Timeline } from './components/editor/Timeline';
import { AIPanel } from './components/editor/AIPanel';
import { VirtualKeyboard } from './components/editor/VirtualKeyboard';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { Track, TrackType, ProjectStats, Region } from './types';

// Initial Demo Data
const INITIAL_TRACKS: Track[] = [
    { 
        id: 1, 
        name: 'Drums', 
        type: TrackType.DRUM, 
        color: '#ff4466', 
        muted: false, 
        solo: false, 
        volume: 0.8,
        pan: 0,
        fxEnabled: true,
        regions: [
            { id: 'r1', start: 0, duration: 8, name: 'Kick Loop', waveformSeed: 123 },
            { id: 'r2', start: 16, duration: 8, name: 'Full Kit', waveformSeed: 124 }
        ]
    },
    { 
        id: 2, 
        name: 'Bass', 
        type: TrackType.SYNTH, 
        color: '#00e7ff', 
        muted: false, 
        solo: false, 
        volume: 0.7,
        pan: -0.2,
        fxEnabled: false,
        regions: [
            { id: 'r3', start: 4, duration: 12, name: 'Sub Bass', waveformSeed: 555 }
        ]
    },
    { 
        id: 3, 
        name: 'Vocals', 
        type: TrackType.VOCAL, 
        color: '#b967ff', 
        muted: false, 
        solo: false, 
        volume: 0.9,
        pan: 0.1,
        fxEnabled: true,
        regions: [
            { id: 'r4', start: 8, duration: 4, name: 'Verse 1', waveformSeed: 999 },
            { id: 'r5', start: 16, duration: 8, name: 'Chorus', waveformSeed: 888 }
        ]
    },
];

const App: React.FC = () => {
  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [addTrackModalOpen, setAddTrackModalOpen] = useState(false);

  // Project State & History
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [history, setHistory] = useState<Track[][]>([]);
  const [future, setFuture] = useState<Track[][]>([]);
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Add Track Form State
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackType, setNewTrackType] = useState<TrackType>(TrackType.AUDIO);

  // History Actions
  const pushHistory = useCallback((newTracks: Track[]) => {
      setHistory(prev => [...prev, tracks]);
      setFuture([]); 
      setTracks(newTracks);
  }, [tracks]);

  const undo = useCallback(() => {
      if (history.length === 0) return;
      const previous = history[history.length - 1];
      const newHistory = history.slice(0, history.length - 1);
      
      setFuture(prev => [tracks, ...prev]);
      setTracks(previous);
      setHistory(newHistory);
  }, [history, tracks]);

  const redo = useCallback(() => {
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);

      setHistory(prev => [...prev, tracks]);
      setTracks(next);
      setFuture(newFuture);
  }, [future, tracks]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            redo();
        }
        if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
            e.preventDefault();
            setIsPlaying(prev => !prev);
        }
        // Toggle keyboard with 'K' if not typing in inputs
        if (e.key.toLowerCase() === 'k' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
          setKeyboardOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Track Actions
  const handleAddTrack = () => {
    const colors = ['#ff4466', '#00e7ff', '#b967ff', '#ffaa00', '#00ff88'];
    const newTrack: Track = {
      id: Date.now(),
      name: newTrackName || `Track ${tracks.length + 1}`,
      type: newTrackType,
      color: colors[tracks.length % colors.length],
      muted: false,
      solo: false,
      volume: 0.8,
      pan: 0,
      fxEnabled: false,
      regions: []
    };
    pushHistory([...tracks, newTrack]);
    setAddTrackModalOpen(false);
    setNewTrackName('');
  };

  const handleDeleteTrack = (id: number) => {
    if (window.confirm('Delete this track?')) {
        pushHistory(tracks.filter(t => t.id !== id));
    }
  };

  const handleVolumeChange = (id: number, volume: number) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, volume } : t));
  };

  const handlePanChange = (id: number, pan: number) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, pan } : t));
  };

  const handleToggleMute = (id: number) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
  };

  const handleToggleSolo = (id: number) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, solo: !t.solo } : t));
  };

  const handleTrackRegionUpdate = (trackId: number, newRegions: Region[]) => {
      setTracks(prev => prev.map(t => t.id === trackId ? { ...t, regions: newRegions } : t));
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
        toggleKeyboard={() => setKeyboardOpen(!keyboardOpen)}
        isKeyboardOpen={keyboardOpen}
        onUndo={undo}
        onRedo={redo}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={sidebarOpen} 
          tracks={tracks}
          stats={stats}
          onAddTrack={() => setAddTrackModalOpen(true)}
          onDeleteTrack={handleDeleteTrack}
          onVolumeChange={handleVolumeChange}
          onPanChange={handlePanChange}
          onToggleMute={handleToggleMute}
          onToggleSolo={handleToggleSolo}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
            <Timeline 
              tracks={tracks}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onStop={() => setIsPlaying(false)}
              bpm={bpm}
              setBpm={setBpm}
              onTrackUpdate={handleTrackRegionUpdate}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
            />
            <VirtualKeyboard 
                isOpen={keyboardOpen} 
                onClose={() => setKeyboardOpen(false)} 
            />
        </div>

        <AIPanel 
          isOpen={aiPanelOpen} 
          onClose={() => setAiPanelOpen(false)}
          projectBpm={bpm}
        />
      </div>

      <button 
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent rounded-full shadow-[0_0_20px_rgba(0,231,255,0.6)] text-bg-primary flex items-center justify-center text-2xl transition-all hover:scale-110 hover:rotate-90 z-20"
        title="Quick Record"
      >
        <i className="fas fa-microphone"></i>
      </button>

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
              <option value={TrackType.SAMPLER}>Sampler</option>
              <option value={TrackType.LOOP}>Audio Loop</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
