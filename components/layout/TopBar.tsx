import React from 'react';
import { Button } from '../ui/Button';

interface TopBarProps {
  toggleSidebar: () => void;
  toggleAiPanel: () => void;
  toggleKeyboard: () => void;
  isKeyboardOpen: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onLoad: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  toggleSidebar, 
  toggleAiPanel,
  toggleKeyboard,
  isKeyboardOpen,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onLoad
}) => {
  return (
    <header className="h-16 bg-bg-secondary border-b border-[#252540] px-5 flex justify-between items-center shrink-0 z-20 relative">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-dark rounded-lg flex items-center justify-center text-bg-primary font-bold shadow-[0_0_15px_rgba(0,231,255,0.5)] hover:scale-110 transition-transform cursor-pointer">
          D
        </div>
        <span className="text-lg font-semibold bg-gradient-to-r from-accent to-brand-pink bg-clip-text text-transparent">
          Untitled Project
        </span>
        
        <div className="h-6 w-px bg-[#252540] mx-2"></div>

        <div className="flex gap-1">
            <button 
                onClick={onUndo} 
                disabled={!canUndo}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-tertiary text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Undo (Ctrl+Z)"
            >
                <i className="fas fa-undo text-xs"></i>
            </button>
            <button 
                onClick={onRedo} 
                disabled={!canRedo}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-tertiary text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Y)"
            >
                <i className="fas fa-redo text-xs"></i>
            </button>
        </div>

        <div className="h-6 w-px bg-[#252540] mx-2"></div>

        <div className="flex gap-2">
            <button 
                onClick={onSave}
                className="px-3 h-8 flex items-center gap-2 rounded bg-bg-tertiary border border-[#252540] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-accent hover:border-accent transition-all"
                title="Save Project to Local Storage"
            >
                <i className="fas fa-save text-xs"></i>
                <span className="hidden sm:inline">Save</span>
            </button>
            <button 
                onClick={onLoad}
                className="px-3 h-8 flex items-center gap-2 rounded bg-bg-tertiary border border-[#252540] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-accent hover:border-accent transition-all"
                title="Load Project from Local Storage"
            >
                <i className="fas fa-folder-open text-xs"></i>
                <span className="hidden sm:inline">Load</span>
            </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button 
            onClick={toggleKeyboard} 
            variant={isKeyboardOpen ? 'primary' : 'secondary'}
            icon={<i className="fas fa-keyboard text-xs" />}
        >
          Keys
        </Button>
        <Button onClick={toggleSidebar} icon={<i className="fas fa-bars text-xs" />}>
          Tracks
        </Button>
        <Button onClick={toggleAiPanel} icon={<i className="fas fa-robot text-xs" />}>
          AI Studio
        </Button>
        <Button variant="primary" icon={<i className="fas fa-download text-xs" />}>
          Export
        </Button>
      </div>
    </header>
  );
};
