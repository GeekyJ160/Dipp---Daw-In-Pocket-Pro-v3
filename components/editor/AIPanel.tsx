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
  
  // Granular Tempo Controls
  const [musicTempoCategory, setMusicTempoCategory] = useState('Upbeat (110-128 BPM)');
  const [musicBpm, setMusicBpm] = useState<number>(projectBpm);
  const [musicTimeSig, setMusicTimeSig] = useState('4/4');
  
  // Granular Key Controls
  const [musicKeyRoot, setMusicKeyRoot] = useState('Auto');
  const [musicKeyScale, setMusicKeyScale] = useState('Minor');
  
  // Granular Instrumentation
  const [musicInstrPrimary, setMusicInstrPrimary] = useState('Synthesizer');
  const [musicInstrSecondary, setMusicInstrSecondary] = useState('');
  
  const [musicArrangement, setMusicArrangement] = useState('Simple (Verse-Chorus)');
  const [musicDescription, setMusicDescription] = useState('');
  const [musicResult, setMusicResult] = useState<MusicConcept | null>(null);

  const genres = ['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Ambient', 'Cinematic', 'Lo-Fi', 'R&B', 'Techno', 'House', 'Trap', 'Orchestral', 'Synthwave', 'Phonk', 'Future Bass'];
  const moods = ['Energetic', 'Chill', 'Dark', 'Happy', 'Sad', 'Romantic', 'Aggressive', 'Dreamy', 'Focus', 'Uplifting', 'Melancholic', 'Euphoric', 'Nostalgic', 'Suspenseful'];
  
  const tempoCategories = [
    'Slow (< 90 BPM)',
    'Medium (90-110 BPM)',
    'Upbeat (110-128 BPM)',
    'Fast (128+ BPM)'
  ];
  
  const timeSignatures = ['4/4', '3/4', '6/8', '5/4', '7/8', '12/8'];
  
  const arrangementOptions = [
    'Simple (Verse-Chorus)',
    'Complex (Intro-Verse-Chorus-Bridge-Outro)',
    'Experimental / Cinematic',
    'Club Extended',
    'Radio Edit'
  ];
  
  const keyRoots = ['Auto', 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
  const keyScales = [
    'Major', 'Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian', 
    'Harmonic Minor', 'Melodic Minor', 'Pentatonic Major', 'Pentatonic Minor', 
    'Blues', 'Whole Tone', 'Augmented', 'Diminished'
  ];
  
  const primaryInstruments = [
    'Synthesizer', 'Piano/Keys', 'Electric Guitar', 'Acoustic Guitar', 
    'Orchestral Strings', '808 Bass', 'Electric Bass', 'Drum Machine', 
    'Acoustic Drums', 'Vocal Chops', 'Atmospheric Pads', 'Cinematic Percussion', 
    'Lo-Fi Drums', 'Hybrid Synth/Orch', 'Brass Section', 'Woodwinds', 'Bell/Mallet'
  ];

  const loadingMessages = [
    "Analyzing parameters...",
    "Consulting creative models...",
    "Structuring production sheet...",
    "Finalizing details..."
  ];

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
      const keyParam = musicKeyRoot === 'Auto' ? 'Auto Detection' : `${musicKeyRoot} ${musicKeyScale}`;
      const instrParam = `${musicInstrPrimary}${musicInstrSecondary ? ', ' + musicInstrSecondary : ''}`;
      const tempoParam = `${musicTempoCategory} (User target: ${musicBpm} BPM)`;
  
      const params: MusicConceptParams = {
          genre: musicGenre,
          mood: musicMood,
          tempo: tempoParam,
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
    if (s.includes('chorus') || s.includes('drop') || s.includes('hook')) return 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(0,231,255,0.3)]';
    if (s.includes('verse')) return 'bg-brand-purple/20 border-brand-purple text-brand-purple';
    if (s.includes('intro') || s.includes('outro') || s.includes('build')) return 'bg-bg-tertiary border-[#252540] text-gray-500';
    if (s.includes('bridge') || s.includes('solo') || s.includes('break')) return 'bg-brand-pink/20 border-brand-pink text-brand-pink';
    return 'bg-bg-tertiary border-[#252540] text-gray-400';
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-[450px] bg-bg-secondary border-l border-[#252540] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-30 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b border-[#252540] flex justify-between items-center bg-bg-tertiary shrink-0">
        <div className="flex items-center gap-2">
            <i className="fas fa-robot text-accent text-xl"></i>
            <h2 className="text-lg font-bold bg-gradient-to-r from-accent to-brand-purple bg-clip-text text-transparent">AI Studio</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-accent transition-transform hover:rotate-90">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {/* Music Concept Section */}
        <section className={`bg-bg-tertiary border rounded-xl overflow-hidden transition-all duration-300 ${activeGenerator === 'music' ? 'border-brand-purple shadow-[0_0_15px_rgba(185,103,255,0.2)]' : 'border-[#252540] hover:border-brand-purple'}`}>
            <div className="p-4 border-b border-[#252540]/50 bg-gradient-to-r from-brand-purple/10 to-transparent">
                <h3 className="text-brand-purple font-semibold flex items-center gap-2">
                    <i className="fas fa-music"></i> Music Generator
                </h3>
            </div>
            
            <div className="p-4 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Genre</label>
                        <select className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-2 text-sm text-white focus:border-brand-purple focus:outline-none" value={musicGenre} onChange={(e) => setMusicGenre(e.target.value)}>
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Mood</label>
                        <select className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-2 text-sm text-white focus:border-brand-purple focus:outline-none" value={musicMood} onChange={(e) => setMusicMood(e.target.value)}>
                            {moods.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-bg-secondary/50 rounded-xl border border-[#252540] space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Tempo Controls</label>
                      <span className="text-[11px] font-mono font-bold text-accent">{musicBpm} BPM</span>
                    </div>
                    <select className="w-full bg-bg-tertiary border border-[#252540] rounded-lg p-2 text-xs text-white focus:border-accent focus:outline-none" value={musicTempoCategory} onChange={(e) => setMusicTempoCategory(e.target.value)}>
                        {tempoCategories.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] text-gray-600 font-mono">40</span>
                        <input type="range" min="40" max="240" step="1" value={musicBpm} onChange={(e) => setMusicBpm(parseInt(e.target.value))} className="flex-1 h-1.5 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent shadow-[0_0_10px_rgba(0,231,255,0.1)]"/>
                        <span className="text-[9px] text-gray-600 font-mono">240</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Key Root</label>
                        <select className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-2 text-sm text-white focus:border-brand-purple focus:outline-none" value={musicKeyRoot} onChange={(e) => setMusicKeyRoot(e.target.value)}>
                            {keyRoots.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${musicKeyRoot === 'Auto' ? 'text-gray-700' : 'text-gray-500'}`}>Scale</label>
                        <select className={`w-full bg-bg-secondary border border-[#252540] rounded-lg p-2 text-sm text-white focus:border-brand-purple focus:outline-none transition-all ${musicKeyRoot === 'Auto' ? 'opacity-30 cursor-not-allowed bg-bg-tertiary' : 'opacity-100'}`} value={musicKeyScale} onChange={(e) => setMusicKeyScale(e.target.value)} disabled={musicKeyRoot === 'Auto'}>
                            {keyScales.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Instrumentation</label>
                    <select className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-2.5 text-sm text-white focus:border-brand-purple focus:outline-none" value={musicInstrPrimary} onChange={(e) => setMusicInstrPrimary(e.target.value)}>
                        {primaryInstruments.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <div className="relative group">
                        <i className="fas fa-plus absolute left-3 top-3.5 text-[10px] text-brand-purple opacity-50"></i>
                        <input type="text" className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-2.5 pl-8 text-xs text-white focus:border-brand-purple focus:outline-none placeholder-gray-600" placeholder="Add custom instruments..." value={musicInstrSecondary} onChange={(e) => setMusicInstrSecondary(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Time Sig</label>
                        <select className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-2 text-sm text-white focus:border-brand-purple focus:outline-none" value={musicTimeSig} onChange={(e) => setMusicTimeSig(e.target.value)}>
                            {timeSignatures.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Arrangement</label>
                        <select className="w-full bg-bg-secondary border border-[#252540] rounded-lg p-2 text-sm text-white focus:border-brand-purple focus:outline-none" value={musicArrangement} onChange={(e) => setMusicArrangement(e.target.value)}>
                            {arrangementOptions.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Additional Context</label>
                    <textarea className="w-full bg-bg-secondary border border-[#252540] rounded-xl p-3 text-sm text-gray-200 focus:border-brand-purple focus:outline-none resize-none h-20" placeholder="Describe song energy, transitions, or specific sounds..." value={musicDescription} onChange={(e) => setMusicDescription(e.target.value)} />
                </div>

                <Button variant="primary" className="w-full justify-center bg-brand-purple border-brand-purple text-bg-primary hover:shadow-[0_0_20px_rgba(185,103,255,0.4)] h-12" onClick={handleMusicGen} disabled={loading}>
                    {loading && activeGenerator === 'music' ? <i className="fas fa-compact-disc fa-spin text-lg"/> : <i className="fas fa-wand-magic-sparkles text-lg"/>}
                    {loading && activeGenerator === 'music' ? 'Composing...' : 'Generate Studio Concept'}
                </Button>
            </div>

            {loading && activeGenerator === 'music' && (
                <div className="p-10 bg-bg-secondary/50 border-t border-[#252540] flex flex-col items-center justify-center animate-fadeIn text-center">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-[#252540] rounded-full"></div>
                        <div className="absolute inset-0 border-t-4 border-brand-purple rounded-full animate-spin"></div>
                        <i className="fas fa-music absolute inset-0 flex items-center justify-center text-brand-purple animate-pulse"></i>
                    </div>
                    <div className="text-brand-purple font-mono text-sm font-black animate-pulse uppercase tracking-[0.2em]">{loadingMessages[loadingPhase]}</div>
                </div>
            )}

            {!loading && musicResult && (
                <div className="p-6 border-t border-[#252540] space-y-8 animate-slideUp bg-gradient-to-b from-bg-secondary/40 to-bg-primary/20">
                    <div className="relative p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <i className="fas fa-compact-disc text-8xl animate-spin-slow"></i>
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-mono text-accent tracking-[0.3em] uppercase font-black">Production Sheet</span>
                                <div className="px-2 py-0.5 rounded-md bg-brand-purple/20 text-brand-purple text-[8px] font-black uppercase border border-brand-purple/30">Concept v1.2</div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">{musicResult.conceptName}</h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/5 flex flex-col">
                                    <span className="text-[9px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1.5"><i className="fas fa-bolt text-accent"></i> Tempo / Sig</span>
                                    <span className="text-xs font-mono font-bold text-accent">{musicResult.bpm} • {musicResult.timeSignature}</span>
                                </div>
                                <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/5 flex flex-col">
                                    <span className="text-[9px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1.5"><i className="fas fa-key text-brand-pink"></i> Musical Key</span>
                                    <span className="text-xs font-mono font-bold text-brand-pink truncate">{musicResult.key}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <i className="fas fa-layer-group text-accent text-xs"></i> Arrangement Structure
                        </h4>
                        <div className="flex flex-col gap-2 p-4 bg-black/20 rounded-2xl border border-[#252540]">
                            {musicResult.structure?.map((section, i) => (
                                <div key={i} className={`px-4 py-3 rounded-xl border text-[11px] font-black flex items-center justify-between transition-all hover:scale-[1.02] ${getSectionColor(section)}`}>
                                    <div className="flex items-center gap-4">
                                      <span className="opacity-30 font-mono w-6 text-center border-r border-current/20 pr-4">{String(i + 1).padStart(2, '0')}</span>
                                      {section}
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <i className="fas fa-guitar text-brand-purple text-xs"></i> Instrumentation
                         </h4>
                         <div className="flex flex-wrap gap-2">
                            {musicResult.instrumentation?.map((inst, i) => (
                                <span key={i} className="text-[10px] font-black bg-[#141420] px-3.5 py-2 rounded-lg border border-[#252540] text-gray-300 hover:border-accent hover:text-white transition-all cursor-default shadow-sm">
                                    {inst}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <i className="fas fa-sliders text-brand-pink text-xs"></i> Production Tips
                         </h4>
                         <div className="bg-bg-tertiary/50 p-5 rounded-2xl border border-[#252540] space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            {musicResult.productionTips?.map((tip, i) => (
                                <div key={i} className="flex gap-4 text-[11px] text-gray-400 leading-relaxed border-b border-white/5 pb-3 last:border-0 last:pb-0 group">
                                    <span className="text-brand-pink font-black text-lg -mt-1 transition-transform group-hover:scale-125">•</span>
                                    <span className="group-hover:text-gray-200 transition-colors">{tip}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}
        </section>

        {/* Lyrics Section */}
        <section className={`bg-bg-tertiary border rounded-xl overflow-hidden transition-all duration-300 ${activeGenerator === 'lyrics' ? 'border-accent shadow-[0_0_15px_rgba(0,231,255,0.1)]' : 'border-[#252540] hover:border-accent'}`}>
            <div className="p-4 border-b border-[#252540]/50 bg-gradient-to-r from-accent/10 to-transparent">
                <h3 className="text-accent font-semibold flex items-center gap-2">
                    <i className="fas fa-pen-fancy"></i> Lyric Assistant
                </h3>
            </div>
            <div className="p-4">
                <textarea className="w-full bg-bg-secondary border border-[#252540] rounded-xl p-3 text-sm text-gray-200 focus:border-accent focus:outline-none resize-none h-20 mb-3" placeholder="Song theme or story..." value={lyricPrompt} onChange={(e) => setLyricPrompt(e.target.value)} />
                <Button variant="secondary" className="w-full justify-center h-10" onClick={handleLyricsGen} disabled={loading}>
                    {loading && activeGenerator === 'lyrics' ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-feather-pointed"/>}
                    Generate Lyrics
                </Button>
                {lyricResult && (
                    <div className="mt-4 p-4 bg-bg-secondary rounded-xl border-l-2 border-accent text-[11px] whitespace-pre-wrap font-mono max-h-[250px] overflow-y-auto animate-fadeIn leading-relaxed text-gray-400">
                        {lyricResult}
                    </div>
                )}
            </div>
        </section>

        {/* Voice Trainer Section */}
        <section className={`bg-bg-tertiary border rounded-xl overflow-hidden transition-all duration-300 ${activeGenerator === 'voice' ? 'border-brand-pink shadow-[0_0_15px_rgba(255,77,141,0.1)]' : 'border-[#252540] hover:border-brand-pink'}`}>
            <div className="p-4 border-b border-[#252540]/50 bg-gradient-to-r from-brand-pink/10 to-transparent">
                <h3 className="text-brand-pink font-semibold flex items-center gap-2">
                    <i className="fas fa-microphone-lines"></i> Voice Trainer
                </h3>
            </div>
            <div className="p-4">
                <textarea className="w-full bg-bg-secondary border border-[#252540] rounded-xl p-3 text-sm text-gray-200 focus:border-brand-pink focus:outline-none resize-none h-20 mb-3" placeholder="Describe the voice character..." value={voicePrompt} onChange={(e) => setVoicePrompt(e.target.value)} />
                <Button variant="secondary" className="w-full justify-center h-10" onClick={handleVoiceGen} disabled={loading}>
                    {loading && activeGenerator === 'voice' ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-fingerprint"/>}
                    Generate Profile
                </Button>
                {voiceResult && (
                    <div className="mt-4 p-4 bg-bg-secondary rounded-xl border-l-2 border-brand-pink text-[11px] text-gray-400 leading-relaxed animate-fadeIn">
                        {voiceResult}
                    </div>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};
