import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { generateLyrics, generateMusicConcept, generateVoiceProfileDescription, MusicConceptParams, MusicConcept } from '../../services/geminiService';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string | null>('lyrics');
  const [loading, setLoading] = useState(false);
  
  // State for Lyrics
  const [lyricPrompt, setLyricPrompt] = useState('');
  const [lyricResult, setLyricResult] = useState('');

  // State for Music
  const [musicGenre, setMusicGenre] = useState('Electronic');
  const [musicMood, setMusicMood] = useState('Energetic');
  const [musicTempo, setMusicTempo] = useState('Medium (90-110 BPM)');
  const [musicKey, setMusicKey] = useState('Auto');
  const [musicInstruments, setMusicInstruments] = useState('');
  const [musicDescription, setMusicDescription] = useState('');
  const [musicResult, setMusicResult] = useState<MusicConcept | null>(null);

  const genres = ['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Ambient', 'Cinematic', 'Lo-Fi', 'R&B', 'Techno', 'House', 'Trap', 'Orchestral'];
  const moods = ['Energetic', 'Chill', 'Dark', 'Happy', 'Sad', 'Romantic', 'Aggressive', 'Dreamy', 'Focus', 'Uplifting', 'Melancholic', 'Euphoric'];
  const tempos = ['Slow (< 90 BPM)', 'Medium (90-110 BPM)', 'Upbeat (110-128 BPM)', 'Fast (128+ BPM)', 'Variable/Dynamic'];
  const keys = ['Auto', 'C Major', 'A Minor', 'G Major', 'E Minor', 'F Major', 'D Minor', 'D Major', 'B Minor', 'Eb Major', 'C Minor', 'Bb Major', 'G Minor'];

  const handleLyricsGen = async () => {
    if (!lyricPrompt) return;
    setLoading(true);
    const result = await generateLyrics(lyricPrompt);
    setLyricResult(result);
    setLoading(false);
  };

  const handleMusicGen = async () => {
    setLoading(true);
    const params: MusicConceptParams = {
        genre: musicGenre,
        mood: musicMood,
        tempo: musicTempo,
        key: musicKey,
        instrumentation: musicInstruments,
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
                {loading ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-wand-magic-sparkles"/>}
                {loading ? 'Generating...' : 'Generate Lyrics'}
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
                    <label className="text-xs text-gray-400 mb-1 block">Tempo</label>
                    <select 
                        className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                        value={musicTempo}
                        onChange={(e) => setMusicTempo(e.target.value)}
                    >
                        {tempos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Musical Key</label>
                    <select 
                        className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                        value={musicKey}
                        onChange={(e) => setMusicKey(e.target.value)}
                    >
                        {keys.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <label className="text-xs text-gray-400 mb-1 block">Key Instrumentation</label>
                <input 
                    type="text"
                    className="w-full bg-bg-secondary border border-[#252540] rounded p-2 text-sm text-white focus:border-brand-purple focus:outline-none"
                    placeholder="e.g. Analog Synths, 808s, Electric Guitar"
                    value={musicInstruments}
                    onChange={(e) => setMusicInstruments(e.target.value)}
                />
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
                className="w-full mt-1 justify-center bg-brand-purple border-brand-purple hover:bg-purple-600"
                onClick={handleMusicGen}
                disabled={loading}
            >
                {loading ? <i className="fas fa-spinner fa-spin"/> : <i className="fas fa-lightbulb"/>}
                {loading ? 'Thinking...' : 'Generate Concept'}
            </Button>

            {musicResult && (
                <div className="mt-4 space-y-4 animate-fadeIn border-t border-[#252540] pt-4">
                    <div className="p-3 bg-bg-primary rounded-lg border border-[#252540] shadow-sm">
                        <div className="text-accent font-bold text-lg mb-2">{musicResult.conceptName}</div>
                        <div className="flex gap-2">
                             <div className="bg-bg-tertiary px-3 py-1 rounded text-xs font-mono text-brand-pink border border-[#252540] flex items-center gap-2">
                                <i className="fas fa-clock"></i> {musicResult.bpm}
                             </div>
                             <div className="bg-bg-tertiary px-3 py-1 rounded text-xs font-mono text-brand-purple border border-[#252540] flex items-center gap-2">
                                <i className="fas fa-music"></i> {musicResult.key}
                             </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <i className="fas fa-guitar text-xs"></i> Instrumentation
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {musicResult.instrumentation?.map((inst, i) => (
                                <span key={i} className="text-xs bg-bg-secondary px-2 py-1 rounded text-gray-300 border border-[#252540] hover:border-accent transition-colors">
                                    {inst}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                             <i className="fas fa-list-ol text-xs"></i> Structure
                        </h4>
                        <div className="space-y-1 bg-bg-secondary p-2 rounded border border-[#252540]">
                            {musicResult.structure?.map((section, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-300 border-l-2 border-[#252540] pl-2 hover:border-brand-purple transition-colors">
                                    <span className="text-xs text-gray-500 font-mono w-4">{i+1}.</span>
                                    {section}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                         <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                             <i className="fas fa-sliders-h text-xs"></i> Production Tips
                         </h4>
                         <ul className="text-xs text-gray-400 space-y-1 bg-bg-secondary p-2 rounded border border-[#252540]">
                            {musicResult.productionTips?.map((tip, i) => (
                                <li key={i} className="flex gap-2 items-start py-1 border-b border-[#252540] last:border-0">
                                    <i className="fas fa-info-circle text-accent mt-0.5"></i>
                                    <span>{tip}</span>
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