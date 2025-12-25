
export enum TrackType {
  AUDIO = 'audio',
  MIDI = 'midi',
  VOCAL = 'vocal',
  DRUM = 'drum',
  SYNTH = 'synth',
  SAMPLER = 'sampler',
  LOOP = 'loop'
}

export interface Region {
  id: string;
  start: number; // in seconds
  duration: number; // in seconds
  name: string;
  waveformSeed: number; // seed for procedural waveform generation
}

export interface Track {
  id: number;
  name: string;
  type: TrackType;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number; // -1 to 1 (left to right)
  fxEnabled: boolean;
  regions: Region[];
}

export interface ProjectStats {
  trackCount: number;
  duration: string;
  bpm: number;
}

export enum AIPanelTab {
  VOICE = 'voice',
  LYRICS = 'lyrics',
  STEMS = 'stems',
  MUSIC = 'music'
}

export enum SidebarTab {
  TRACKS = 'tracks',
  LIBRARY = 'library',
  MIXER = 'mixer'
}
