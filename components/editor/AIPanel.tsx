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
  projectBpm: number;
}

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose, projectBpm }) => {
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
  const [musicBpm, setMusicBpm] = useState<number>(projectBpm);
  const [musicTimeSig, setMusicTimeSig] = useState('4/4');
  const [musicArrangement, setMusicArrangement] = useState('Simple (Verse-Chorus)');
  
  // Granular Controls
  const [musicKeyRoot, setMusicKeyRoot] = useState('Auto');
  const [musicKeyScale, setMusicKeyScale] = useState('Minor');
  const [musicInstrPrimary, setMusicInstrPrimary] = useState('Synthesizer');
  const [musicInstrSecondary, setMusicInstrSecondary] = useState('');
  
  const [musicDescription, setMusicDescription] = useState('');
  const [musicResult, setMusicResult] = useState<MusicConcept | null>(null);

  const genres = ['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Ambient', 'Cinematic', 'Lo-Fi', 'R&B', 'Techno', 'House', 'Trap', 'Orchestral'];
  const moods = ['Energetic', 'Chill', 'Dark', 'Happy', 'Sad', 'Romantic', 'Aggressive', 'Dreamy', 'Focus', 'Uplifting', 'Melancholic', 'Euphoric'];
  const timeSignatures = ['4/4', '3/4', '6/8', '5/4', '7/8', '12/8'];
  const arrangementOptions = [
    'Simple (Verse-Chorus)',
    'Complex (Intro-Verse-Chorus-Bridge-Outro)',
    'Experimental'
  ];
  
  const keyRoots = ['Auto', 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
  const keyScales = ['Major', 'Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian', 'Harmonic Minor', 'Melodic Minor', 'Pentatonic', 'Blues', 'Whole Tone'];
  
  const primaryInstruments = ['Synthesizer', 'Piano/Keys', 'Electric Guitar', 'Acoustic Guitar', 'Orchestral Strings', '808 Bass', 'Electric Bass', 'Drum Machine', 'Acoustic Drums', 'Vocal Chops', 'Atmospheric Pads', 'Cinematic Percussion', 'Lo-Fi Drums', 'Hybrid Synth/Orch'];

  const loadingMessages = [
    "Analyzing parameters...",
    "Consulting creative models...",
    "Structuring output...",
    "Finalizing details..."
  ];

  // Initialize with project BPM when panel opens or project BPM changes
  useEffect(() => {
    if (isOpen) {
      setMusicBpm(projectBpm);
    }
  }, [isOpen, projectBpm]);

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
          tempo: `${musicBpm} BPM`,
          timeSignature: musicTimeSig,
          key: keyParam,
          instrumentation: instrParam,
          arrangement: musicArrangement,
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

  const getSectionColor = (section: string) => {
    const s = section.toLowerCase();
    if (s.includes('chorus') || s.includes('drop') || s.includes('hook')) {
        return 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(0,231,255,0.3)]';
    }
    if (s.includes('verse')) {
        return 'bg-brand-purple/20 border-brand-purple text-brand-purple';
    }
    if (s.includes('intro') || s.includes('outro') || s.includes('build')) {
        return 'bg-bg-tertiary border-[#252540] text-gray-500';
    }
    if (s.includes('bridge') || s.includes('solo') || s.includes('break')) {
        return 'bg-brand-pink/20 border-brand-pink text-brand-pink';
    }
    return 'bg-bg-tertiary border-[#252540] text-gray-400';
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

                {/* Tempo Slider Section */}
                <div className="p-3 bg-bg-secondary/50 rounded-lg border border-[#252540]">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-gray-400 font-medium">Tempo (BPM)</label>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setMusicBpm(projectBpm)}
                            className="text-[9px] px-1.5 py-0.5 rounded border border-[#252540] text-gray-500 hover:text-accent hover:border-accent transition-colors uppercase font-bold"
                            title="Sync with project BPM"
                          >
                            Sync: {projectBpm}
                          </button>
                          <input 
                              type="number"
                              min="40"
                              max="240"
                              value={musicBpm}
                              onChange={(e) => setMusicBpm(Math.min(240, Math.max(40, parseInt(e.target.value) || 40)))}
                              className="w-12 bg-bg-tertiary border border-[#252540] rounded px-1 py-0.5 text-xs text-accent text-center font-mono focus:border-accent focus:outline-none"
                          />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 font-mono">40</span>
                        <input 
                            type="range"
                            min="40"
                            max="240"
                            step="1"
                            value={musicBpm}
                            onChange={(e) => setMusicBpm(parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent shadow-[0_0_10px_rgba(0,231,255,0.1)]"
                        />
                        <span className="text-[10px] text-gray-500 font-mono">240</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-xs text-gray-400 mb-1 block font-medium">Time Sig.</label>
                        <select 
                            className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                            value={musicTimeSig}
                            onChange={(e) => setMusicTimeSig(e.target.value)}
                        >
                            {timeSignatures.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block font-medium">Key Root & Scale</label>
                        <div className="flex gap-1">
                            <select 
                                className="w-[40%] bg-bg-secondary border border-[#252540] rounded p-2 text-xs text-white focus:border-brand-purple focus:outline-none"
                                value={musicKeyRoot}
                                onChange={(e) => setMusicKeyRoot(e.target.value)}
                                title="Root Note"
                            >
                                {keyRoots.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <select 
                                className="w-[60%] bg-bg-secondary border border-[#252540] rounded p-2 text-xs text-white focus:border-brand-purple focus:outline-none disabled:opacity-50"
                                value={musicKeyScale}
                                onChange={(e) => setMusicKeyScale(e.target.value)}
                                disabled={musicKeyRoot === 'Auto'}
                                title="Scale"
                            >
                                {keyScales.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block font-medium">Arrangement Style</label>
                    <select 
                        className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                        value={musicArrangement}
                        onChange={(e) => setMusicArrangement(e.target.value)}
                    >
                        {arrangementOptions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
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
                        <div className="relative group">
                            <div className="absolute left-3 top-2 text-xs text-brand-purple pointer-events-none opacity-50"><i className="fas fa-plus"></i></div>
                            <input 
                                type="text"
                                className="w-full bg-bg-secondary border border-[#252540] rounded p-2 pl-8 text-sm text-white focus:border-brand-purple focus:outline-none placeholder-gray-600"
                                placeholder="Add custom instruments..."
                                value={musicInstrSecondary}
                                onChange={(e) => setMusicInstrSecondary(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block font-medium">Additional Context</label>
                    <textarea 
                        className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-3 text-sm text-gray-200 focus:border-brand-purple focus:outline-none resize-y min-h-[60px]"
                        placeholder="Describe structure, dynamics, or specific production elements..."
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

            {/* Results Display */}
            {loading && activeGenerator === 'music' && (
                <div className="p-6 bg-bg-secondary/50 border-t border-[#252540] flex flex-col items-center justify-center animate-fadeIn">
                    <div className="relative w-12 h-12 mb-3">
                        <div className="absolute inset-0 rounded-full border-2 border-[#252540]"></div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-brand-purple animate-spin"></div>
                    </div>
                    <div className="text-brand-purple font-mono text-xs font-bold animate-pulse">{loadingMessages[loadingPhase]}</div>
                </div>
            )}

            {!loading && musicResult && (
                <div className="p-5 border-t border-[#252540] space-y-6 animate-slideUp bg-bg-secondary/30">
                    <div className="relative p-6 rounded-2xl border border-brand-purple/30 bg-gradient-to-br from-[#1a1a2e] to-[#2a1b3d] overflow-hidden shadow-2xl">
                        <div className="absolute -top-10 -right-10 opacity-5">
                            <i className="fas fa-compact-disc text-[12rem] animate-spin-slow"></i>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-brand-pink tracking-[0.2em] uppercase font-bold">Studio Concept</span>
                                <i className="fas fa-wave-square text-accent/40"></i>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                                {musicResult.conceptName || "Untitled Composition"}
                            </h3>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/5 flex flex-col items-center justify-center">
                                    <span className="text-[8px] text-gray-500 uppercase font-black mb-1">Tempo</span>
                                    <span className="text-sm font-mono font-bold text-accent">{musicResult.bpm}</span>
                                </div>
                                <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/5 flex flex-col items-center justify-center">
                                    <span className="text-[8px] text-gray-500 uppercase font-black mb-1">Musical Key</span>
                                    <span className="text-sm font-mono font-bold text-brand-pink truncate w-full text-center px-1" title={musicResult.key}>{musicResult.key}</span>
                                </div>
                                <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/5 flex flex-col items-center justify-center">
                                    <span className="text-[8px] text-gray-500 uppercase font-black mb-1">Signature</span>
                                    <span className="text-sm font-mono font-bold text-white">{musicResult.timeSignature || "4/4"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-layer-group text-brand-purple"></i> Arrangement Timeline
                            </h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5 p-3 bg-black/20 rounded-xl border border-[#252540]">
                            {musicResult.structure?.map((section, i) => (
                                <div 
                                    key={i} 
                                    className={`px-3 py-2 rounded-md border text-[10px] font-black transition-all hover:scale-105 cursor-default flex items-center gap-2 ${getSectionColor(section)}`}
                                >
                                    <span className="opacity-40">{i + 1}</span>
                                    {section}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fas fa-guitar text-accent"></i> Core Instrumentation
                         </h4>
                         <div className="flex flex-wrap gap-2">
                            {musicResult.instrumentation?.map((inst, i) => (
                                <span key={i} className="text-[10px] font-bold bg-[#141420] px-3 py-1.5 rounded-full text-gray-300 border border-[#252540] hover:border-accent hover:text-white transition-colors cursor-default">
                                    {inst}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-bg-tertiary to-bg-secondary p-4 rounded-xl border border-[#252540] relative overflow-hidden group">
                         <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink opacity-50"></div>
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <i className="fas fa-sliders text-brand-pink"></i> Production Insights
                         </h4>
                         <ul className="space-y-3">
                            {musicResult.productionTips?.map((tip, i) => (
                                <li key={i} className="text-[11px] text-gray-400 flex gap-3 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0 mt-1"></span> 
                                    <span className="group-hover:text-gray-200 transition-colors">{tip}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            )}
        </section>

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