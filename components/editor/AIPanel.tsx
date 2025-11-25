import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { generateLyrics, generateMusicConcept, MusicConceptParams, MusicConcept } from '../../services/geminiService';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  // State for Lyrics
  const [lyricPrompt, setLyricPrompt] = useState('');
  const [lyricResult, setLyricResult] = useState('');

  // State for Music
  const [musicGenre, setMusicGenre] = useState('Electronic');
  const [musicMood, setMusicMood] = useState('Energetic');
  const [musicTempo, setMusicTempo] = useState('Medium (90-110 BPM)');
  
  // Granular Controls
  const [musicKeyRoot, setMusicKeyRoot] = useState('Auto');
  const [musicKeyScale, setMusicKeyScale] = useState('Minor');
  const [musicInstrPrimary, setMusicInstrPrimary] = useState('Synthesizer');
  const [musicInstrSecondary, setMusicInstrSecondary] = useState('');
  
  const [musicDescription, setMusicDescription] = useState('');
  const [musicResult, setMusicResult] = useState<MusicConcept | null>(null);

  const genres = ['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Ambient', 'Cinematic', 'Lo-Fi', 'R&B', 'Techno', 'House', 'Trap', 'Orchestral'];
  const moods = ['Energetic', 'Chill', 'Dark', 'Happy', 'Sad', 'Romantic', 'Aggressive', 'Dreamy', 'Focus', 'Uplifting', 'Melancholic', 'Euphoric'];
  const tempos = ['Slow (< 90 BPM)', 'Medium (90-110 BPM)', 'Upbeat (110-128 BPM)', 'Fast (128+ BPM)', 'Variable/Dynamic'];
  
  const keyRoots = ['Auto', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keyScales = ['Major', 'Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian', 'Harmonic Minor', 'Melodic Minor', 'Pentatonic'];
  
  const primaryInstruments = ['Synthesizer', 'Piano/Keys', 'Electric Guitar', 'Acoustic Guitar', 'Orchestral Strings', '808 Bass', 'Electric Bass', 'Drum Machine', 'Acoustic Drums', 'Vocal Chops', 'Atmospheric Pads'];

  const loadingMessages = [
    "Analyzing genre parameters...",
    "Constructing musical structure...",
    "Selecting instrumentation...",
    "Finalizing production details..."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading && !lyricResult) { 
        setLoadingPhase(0);
        interval = setInterval(() => {
            setLoadingPhase(prev => (prev + 1) % loadingMessages.length);
        }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading, lyricResult]);

  const handleLyricsGen = async () => {
    if (!lyricPrompt) return;
    setLoading(true);
    setMusicResult(null); // Clear other results
    const result = await generateLyrics(lyricPrompt);
    setLyricResult(result);
    setLoading(false);
  };

  const handleMusicGen = async () => {
    setLoading(true);
    setLyricResult(''); // Clear other results
    
    // Construct simplified parameters from granular controls
    const keyParam = musicKeyRoot === 'Auto' ? 'Auto' : `${musicKeyRoot} ${musicKeyScale}`;
    const instrParam = `${musicInstrPrimary}${musicInstrSecondary ? ', ' + musicInstrSecondary : ''}`;

    const params: MusicConceptParams = {
        genre: musicGenre,
        mood: musicMood,
        tempo: musicTempo,
        key: keyParam,
        instrumentation: instrParam,
        description: musicDescription
    };
    
    const result = await generateMusicConcept(params);
    setMusicResult(result);
    setLoading(false);
  };

  return (
    <div 
      className={`
        fixed top-0 right-0 h-full w-[400px] bg-bg-secondary border-l border-[#252540] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-30 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#252540] flex justify-between items-center bg-bg-tertiary">
        <h2 className="text-lg font-bold bg-gradient-to-r from-accent to-brand-purple bg-clip-text text-transparent">
          AI Studio
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-accent transition-transform hover:rotate-90">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Lyrics Section */}
        <div className="bg-bg-tertiary border border-[#252540] rounded-xl p-4 hover:border-accent transition-colors">
            <h3 className="text-accent font-semibold mb-3 flex items-center gap-2">
                <i className="fas fa-pen"></i> Lyric Assistant
            </h3>
            <textarea 
                className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-3 text-sm text-gray-200 focus:border-accent focus:outline-none resize-y min-h-[100px]"
                placeholder="Describe the song theme or mood..."
                value={lyricPrompt}
                onChange={(e) => setLyricPrompt(e.target.value)}
            />
            <Button 
                variant="primary" 
                className="w-full mt-3 justify-center"
                onClick={handleLyricsGen}
                disabled={loading}
            >
                {loading && !musicResult ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-wand-magic-sparkles"/>}
                {loading && !musicResult ? 'Generating...' : 'Generate Lyrics'}
            </Button>
            
            {lyricResult && (
                <div className="mt-4 p-3 bg-bg-secondary rounded border border-[#252540] text-sm whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto animate-fadeIn">
                    {lyricResult}
                </div>
            )}
        </div>

        {/* Music Concept Section */}
        <div className="bg-bg-tertiary border border-[#252540] rounded-xl p-4 hover:border-accent transition-colors">
            <h3 className="text-brand-purple font-semibold mb-3 flex items-center gap-2">
                <i className="fas fa-music"></i> Music Generator
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Genre</label>
                    <select 
                        className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                        value={musicGenre}
                        onChange={(e) => setMusicGenre(e.target.value)}
                    >
                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Mood</label>
                    <select 
                        className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                        value={musicMood}
                        onChange={(e) => setMusicMood(e.target.value)}
                    >
                        {moods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Tempo Range</label>
                    <select 
                        className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                        value={musicTempo}
                        onChange={(e) => setMusicTempo(e.target.value)}
                    >
                        {tempos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Key & Scale</label>
                    <div className="flex gap-1">
                        <select 
                            className="w-[45%] bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                            value={musicKeyRoot}
                            onChange={(e) => setMusicKeyRoot(e.target.value)}
                        >
                            {keyRoots.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <select 
                            className="w-[55%] bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            value={musicKeyScale}
                            onChange={(e) => setMusicKeyScale(e.target.value)}
                            disabled={musicKeyRoot === 'Auto'}
                        >
                            {keyScales.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label className="text-xs text-gray-400 mb-1 block">Instrumentation</label>
                <div className="space-y-2">
                    <select 
                        className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                        value={musicInstrPrimary}
                        onChange={(e) => setMusicInstrPrimary(e.target.value)}
                    >
                        {primaryInstruments.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <input 
                        type="text"
                        className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none placeholder-gray-600"
                        placeholder="+ Additional instruments/sounds..."
                        value={musicInstrSecondary}
                        onChange={(e) => setMusicInstrSecondary(e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-3">
                 <label className="text-xs text-gray-400 mb-1 block">Additional Details</label>
                <textarea 
                    className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-3 text-sm text-gray-200 focus:border-brand-purple focus:outline-none resize-y min-h-[80px]"
                    placeholder="Describe any specific ideas, reference tracks, or structural elements..."
                    value={musicDescription}
                    onChange={(e) => setMusicDescription(e.target.value)}
                />
            </div>

            <Button 
                variant="primary" 
                className="w-full mt-1 justify-center bg-brand-purple border-brand-purple hover:bg-purple-600 shadow-[0_0_15px_rgba(185,103,255,0.3)]"
                onClick={handleMusicGen}
                disabled={loading}
            >
                {loading && !lyricResult ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-lightbulb"/>}
                {loading && !lyricResult ? 'Thinking...' : 'Generate Concept'}
            </Button>

            {loading && !lyricResult && (
                <div className="mt-4 p-6 bg-bg-secondary/50 rounded-lg border border-[#252540] flex flex-col items-center justify-center animate-fadeIn">
                    <div className="relative w-12 h-12 mb-3">
                        <div className="absolute inset-0 rounded-full border-2 border-[#252540]"></div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-brand-purple animate-spin"></div>
                    </div>
                    <div className="text-brand-purple font-mono text-sm font-bold animate-pulse">{loadingMessages[loadingPhase]}</div>
                </div>
            )}

            {!loading && musicResult && (
                <div className="mt-6 space-y-4 animate-slideUp">
                    {/* Header: Title, BPM, Key */}
                    <div className="p-4 bg-gradient-to-br from-bg-secondary to-[#1a1a2e] rounded-xl border border-[#252540] shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <i className="fas fa-music text-8xl"></i>
                        </div>
                        <div className="text-[10px] font-mono text-brand-purple mb-1 tracking-widest uppercase">Generated Concept</div>
                        <h3 className="text-xl font-bold text-white mb-4">{musicResult.conceptName}</h3>
                        <div className="grid grid-cols-2 gap-3 relative z-10">
                             <div className="bg-bg-primary/60 backdrop-blur-sm p-2 rounded border border-[#252540] flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">BPM</div>
                                    <div className="text-sm font-mono text-white">{musicResult.bpm}</div>
                                </div>
                             </div>
                             <div className="bg-bg-primary/60 backdrop-blur-sm p-2 rounded border border-[#252540] flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink">
                                    <i className="fas fa-music"></i>
                                </div>
                                <div>
                                     <div className="text-[10px] text-gray-500 uppercase font-bold">Key</div>
                                     <div className="text-sm font-mono text-white">{musicResult.key}</div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Instrumentation */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <i className="fas fa-guitar text-accent"></i> Instrumentation
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {musicResult.instrumentation?.map((inst, i) => (
                                <span key={i} className="text-xs bg-bg-secondary px-3 py-1.5 rounded-full text-gray-300 border border-[#252540] hover:border-accent hover:text-white transition-all shadow-sm">
                                    {inst}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Structure */}
                    <div className="bg-bg-secondary/50 rounded-xl border border-[#252540] p-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <i className="fas fa-layer-group text-brand-purple"></i> Structure
                        </h4>
                        <div className="relative pl-4 space-y-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#252540]">
                            {musicResult.structure?.map((section, i) => (
                                <div key={i} className="relative flex items-center gap-3">
                                    <div className="absolute -left-[19px] w-2.5 h-2.5 rounded-full bg-bg-tertiary border-2 border-brand-purple"></div>
                                    <div className="flex-1 bg-bg-tertiary p-2 rounded border border-[#252540] text-sm text-gray-300 flex justify-between items-center group hover:border-brand-purple transition-colors">
                                        <span>{section}</span>
                                        <span className="text-[10px] font-mono text-gray-600 group-hover:text-brand-purple">PART {i+1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Production Tips */}
                    <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary rounded-xl border border-[#252540] p-4">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <i className="fas fa-sliders-h text-brand-pink"></i> Production Tips
                         </h4>
                         <ul className="space-y-2">
                            {musicResult.productionTips?.map((tip, i) => (
                                <li key={i} className="flex gap-3 items-start text-xs text-gray-300 bg-bg-primary/50 p-2 rounded border border-transparent hover:border-[#252540]">
                                    <i className="fas fa-lightbulb text-brand-pink mt-0.5"></i>
                                    <span className="leading-relaxed">{tip}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            )}
        </div>

         {/* Stems Placeholder */}
         <div className="bg-bg-tertiary border border-[#252540] rounded-xl p-4 opacity-75">
            <h3 className="text-brand-pink font-semibold mb-3 flex items-center gap-2">
                <i className="fas fa-layer-group"></i> Stem Separator
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
                {['Drums', 'Bass', 'Vocals', 'Other'].map(stem => (
                    <div key={stem} className="bg-bg-secondary p-2 rounded text-center border border-transparent hover:border-brand-pink cursor-pointer transition-all">
                        <div className="text-xl mb-1 text-gray-400"><i className="fas fa-wave-square"></i></div>
                        <div className="text-xs font-bold">{stem}</div>
                    </div>
                ))}
            </div>
            <Button className="w-full justify-center" disabled>Feature Coming Soon</Button>
         </div>

      </div>
    </div>
  );
};
