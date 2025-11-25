export enum TrackType {
  AUDIO = 'audio',
  MIDI = 'midi',
  VOCAL = 'vocal',
  DRUM = 'drum',
  SYNTH = 'synth'
}

export interface Track {
  id: number;
  name: string;
  type: TrackType;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
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