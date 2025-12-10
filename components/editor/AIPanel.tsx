import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { 
  generateLyrics, 
  generateMusicConcept, 
  generateVoiceProfileDescription,
  MusicConceptParams, 
  MusicConcept 
} from '../../services/geminiService';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null); // 'voice', 'lyrics', 'music'
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  // State for Voice
  const [voicePrompt, setVoicePrompt] = useState('');
  const [voiceResult, setVoiceResult] = useState('');

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
  
  // Enhanced musical keys with enharmonic equivalents
  const keyRoots = ['Auto', 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
  const keyScales = ['Major', 'Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian', 'Harmonic Minor', 'Melodic Minor', 'Pentatonic', 'Blues', 'Whole Tone'];
  
  const primaryInstruments = ['Synthesizer', 'Piano/Keys', 'Electric Guitar', 'Acoustic Guitar', 'Orchestral Strings', '808 Bass', 'Electric Bass', 'Drum Machine', 'Acoustic Drums', 'Vocal Chops', 'Atmospheric Pads', 'Cinematic Percussion', 'Lo-Fi Drums', 'Hybrid Synth/Orch'];

  const loadingMessages = [
    "Analyzing parameters...",
    "Consulting creative models...",
    "Structuring output...",
    "Finalizing details..."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) { 
        setLoadingPhase(0);
        interval = setInterval(() => {
            setLoadingPhase(prev => (prev + 1) % loadingMessages.length);
        }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleVoiceGen = async () => {
    if (!voicePrompt) return;
    setLoading(true);
    setActiveGenerator('voice');
    
    // Optional: clear other results to focus attention
    // setMusicResult(null); 
    // setLyricResult('');
    
    try {
      const result = await generateVoiceProfileDescription(voicePrompt);
      setVoiceResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setActiveGenerator(null);
    }
  };

  const handleLyricsGen = async () => {
    if (!lyricPrompt) return;
    setLoading(true);
    setActiveGenerator('lyrics');
    
    try {
      const result = await generateLyrics(lyricPrompt);
      setLyricResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setActiveGenerator(null);
    }
  };

  const handleMusicGen = async () => {
    setLoading(true);
    setActiveGenerator('music');
    
    try {
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setActiveGenerator(null);
    }
  };

  return (
    <div 
      className={`
        fixed top-0 right-0 h-full w-[450px] bg-bg-secondary border-l border-[#252540] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-30 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#252540] flex justify-between items-center bg-bg-tertiary shrink-0">
        <div className="flex items-center gap-2">
            <i className="fas fa-robot text-accent text-xl"></i>
            <h2 className="text-lg font-bold bg-gradient-to-r from-accent to-brand-purple bg-clip-text text-transparent">
            AI Studio
            </h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-accent transition-transform hover:rotate-90">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        
        {/* Voice Trainer Section */}
        <section className={`bg-bg-tertiary border rounded-xl overflow-hidden transition-all duration-300 ${activeGenerator === 'voice' ? 'border-brand-pink shadow-[0_0_15px_rgba(255,77,141,0.2)]' : 'border-[#252540] hover:border-brand-pink'}`}>
            <div className="p-4 border-b border-[#252540]/50 bg-gradient-to-r from-brand-pink/10 to-transparent">
                <h3 className="text-brand-pink font-semibold flex items-center gap-2">
                    <i className="fas fa-microphone-lines"></i> Voice Trainer
                </h3>
            </div>
            <div className="p-4">
                <textarea 
                    className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-3 text-sm text-gray-200 focus:border-brand-pink focus:outline-none resize-y min-h-[80px] mb-3"
                    placeholder="Describe the voice character (e.g., 'A raspy, soulful female jazz singer with a wide vibrato')..."
                    value={voicePrompt}
                    onChange={(e) => setVoicePrompt(e.target.value)}
                />
                <Button 
                    variant="secondary" 
                    className="w-full justify-center hover:bg-brand-pink hover:text-white hover:border-brand-pink"
                    onClick={handleVoiceGen}
                    disabled={loading}
                >
                    {loading && activeGenerator === 'voice' ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-fingerprint"/>}
                    {loading && activeGenerator === 'voice' ? 'Analyzing...' : 'Generate Profile'}
                </Button>

                {voiceResult && (
                    <div className="mt-4 p-3 bg-bg-secondary rounded border-l-2 border-brand-pink text-sm text-gray-300 whitespace-pre-wrap animate-fadeIn">
                        <h4 className="text-[10px] font-bold text-brand-pink uppercase tracking-wider mb-2">Technical Profile</h4>
                        {voiceResult}
                    </div>
                )}
            </div>
        </section>

        {/* Lyrics Section */}
        <section className={`bg-bg-tertiary border rounded-xl overflow-hidden transition-all duration-300 ${activeGenerator === 'lyrics' ? 'border-accent shadow-[0_0_15px_rgba(0,231,255,0.2)]' : 'border-[#252540] hover:border-accent'}`}>
            <div className="p-4 border-b border-[#252540]/50 bg-gradient-to-r from-accent/10 to-transparent">
                <h3 className="text-accent font-semibold flex items-center gap-2">
                    <i className="fas fa-pen-fancy"></i> Lyric Assistant
                </h3>
            </div>
            <div className="p-4">
                <textarea 
                    className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-3 text-sm text-gray-200 focus:border-accent focus:outline-none resize-y min-h-[80px] mb-3"
                    placeholder="Describe the song theme, mood, or story..."
                    value={lyricPrompt}
                    onChange={(e) => setLyricPrompt(e.target.value)}
                />
                <Button 
                    variant="secondary" 
                    className="w-full justify-center hover:bg-accent hover:text-bg-primary hover:border-accent"
                    onClick={handleLyricsGen}
                    disabled={loading}
                >
                    {loading && activeGenerator === 'lyrics' ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-wand-magic-sparkles"/>}
                    {loading && activeGenerator === 'lyrics' ? 'Writing...' : 'Generate Lyrics'}
                </Button>
                
                {lyricResult && (
                    <div className="mt-4 p-4 bg-bg-secondary rounded border-l-2 border-accent text-sm whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto animate-fadeIn relative">
                        <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2 sticky top-0 bg-bg-secondary py-1">Generated Lyrics</h4>
                        {lyricResult}
                    </div>
                )}
            </div>
        </section>

        {/* Music Concept Section */}
        <section className={`bg-bg-tertiary border rounded-xl overflow-hidden transition-all duration-300 ${activeGenerator === 'music' ? 'border-brand-purple shadow-[0_0_15px_rgba(185,103,255,0.2)]' : 'border-[#252540] hover:border-brand-purple'}`}>
            <div className="p-4 border-b border-[#252540]/50 bg-gradient-to-r from-brand-purple/10 to-transparent">
                <h3 className="text-brand-purple font-semibold flex items-center gap-2">
                    <i className="fas fa-music"></i> Music Generator
                </h3>
            </div>
            
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block font-medium">Genre</label>
                        <select 
                            className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                            value={musicGenre}
                            onChange={(e) => setMusicGenre(e.target.value)}
                        >
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block font-medium">Mood</label>
                        <select 
                            className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                            value={musicMood}
                            onChange={(e) => setMusicMood(e.target.value)}
                        >
                            {moods.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block font-medium">Tempo</label>
                        <select 
                            className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                            value={musicTempo}
                            onChange={(e) => setMusicTempo(e.target.value)}
                        >
                            {tempos.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block font-medium">Key</label>
                        <div className="flex gap-1">
                            <select 
                                className="w-[55%] bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                                value={musicKeyRoot}
                                onChange={(e) => setMusicKeyRoot(e.target.value)}
                            >
                                {keyRoots.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <select 
                                className="w-[45%] bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none disabled:opacity-50"
                                value={musicKeyScale}
                                onChange={(e) => setMusicKeyScale(e.target.value)}
                                disabled={musicKeyRoot === 'Auto'}
                            >
                                {keyScales.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block font-medium">Instrumentation</label>
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
                            placeholder="+ Additional instruments..."
                            value={musicInstrSecondary}
                            onChange={(e) => setMusicInstrSecondary(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block font-medium">Additional Context</label>
                    <textarea 
                        className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-3 text-sm text-gray-200 focus:border-brand-purple focus:outline-none resize-y min-h-[60px]"
                        placeholder="Structure, reference tracks, specific elements..."
                        value={musicDescription}
                        onChange={(e) => setMusicDescription(e.target.value)}
                    />
                </div>

                <Button 
                    variant="secondary" 
                    className="w-full justify-center bg-brand-purple/10 border-brand-purple/50 text-brand-purple hover:bg-brand-purple hover:text-white"
                    onClick={handleMusicGen}
                    disabled={loading}
                >
                    {loading && activeGenerator === 'music' ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-lightbulb"/>}
                    {loading && activeGenerator === 'music' ? 'Composing...' : 'Generate Concept'}
                </Button>
            </div>

            {/* Loading Indicator (Music) */}
            {loading && activeGenerator === 'music' && (
                <div className="p-6 bg-bg-secondary/50 border-t border-[#252540] flex flex-col items-center justify-center animate-fadeIn">
                    <div className="relative w-12 h-12 mb-3">
                        <div className="absolute inset-0 rounded-full border-2 border-[#252540]"></div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-brand-purple animate-spin"></div>
                    </div>
                    <div className="text-brand-purple font-mono text-xs font-bold animate-pulse">{loadingMessages[loadingPhase]}</div>
                </div>
            )}

            {/* Music Results Display */}
            {!loading && musicResult && (
                <div className="p-5 border-t border-[#252540] space-y-4 animate-slideUp bg-bg-secondary/30">
                    {/* Header Card */}
                    <div className="relative p-5 rounded-xl border border-brand-purple/30 bg-gradient-to-br from-bg-secondary to-[#2a1b3d] overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i className="fas fa-compact-disc text-9xl text-brand-purple"></i>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="text-[10px] font-mono text-brand-pink tracking-widest uppercase mb-1">Concept</div>
                            <h3 className="text-xl font-bold text-white mb-4 leading-tight">{musicResult.conceptName || "Untitled Track"}</h3>
                            
                            <div className="flex gap-3">
                                <div className="flex-1 bg-bg-primary/40 backdrop-blur-md rounded px-3 py-2 border border-brand-purple/20">
                                    <div className="text-[9px] text-gray-400 uppercase font-bold">BPM</div>
                                    <div className="text-sm font-mono font-bold text-white">{musicResult.bpm}</div>
                                </div>
                                <div className="flex-1 bg-bg-primary/40 backdrop-blur-md rounded px-3 py-2 border border-brand-purple/20">
                                    <div className="text-[9px] text-gray-400 uppercase font-bold">Key</div>
                                    <div className="text-sm font-mono font-bold text-white">{musicResult.key}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Structure Timeline */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Structure</h4>
                        <div className="relative pl-3 space-y-2">
                            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-brand-purple/30"></div>
                            {musicResult.structure?.map((section, i) => (
                                <div key={i} className="flex items-center gap-3 relative z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple"></div>
                                    <div className="text-xs text-gray-300 bg-bg-primary/50 px-2 py-1 rounded border border-[#252540] w-full">
                                        {section}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instruments */}
                    <div>
                         <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Instruments</h4>
                         <div className="flex flex-wrap gap-1.5">
                            {musicResult.instrumentation?.map((inst, i) => (
                                <span key={i} className="text-[10px] font-medium bg-[#1a1a2e] px-2 py-1 rounded text-accent border border-accent/10">
                                    {inst}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-bg-primary/30 p-3 rounded border border-[#252540]">
                         <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Production Tips</h4>
                         <ul className="space-y-1">
                            {musicResult.productionTips?.map((tip, i) => (
                                <li key={i} className="text-[11px] text-gray-400 flex gap-2">
                                    <span className="text-brand-pink">•</span> {tip}
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            )}
        </section>

         {/* Stems Placeholder */}
         <section className="bg-bg-tertiary border border-[#252540] rounded-xl p-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <h3 className="text-gray-400 font-semibold mb-3 flex items-center gap-2">
                <i className="fas fa-layer-group"></i> Stem Separator
            </h3>
            <div className="text-xs text-center p-4 border border-dashed border-[#252540] rounded-lg">
                Drag audio files here to split stems <br/> (Coming Soon)
            </div>
         </section>

      </div>
    </div>
  );
};