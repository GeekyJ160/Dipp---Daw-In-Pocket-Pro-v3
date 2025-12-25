import React from 'react';
import { Button } from '../ui/Button';

interface TopBarProps {
  toggleSidebar: () => void;
  toggleAiPanel: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  toggleSidebar, 
  toggleAiPanel,
  onUndo,
  onRedo,
  canUndo,
  canRedo
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
                <i className="fas fa-undo"></i>
            </button>
            <button 
                onClick={onRedo} 
                disabled={!canRedo}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-tertiary text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Redo (Ctrl+Y)"
            >
                <i className="fas fa-redo"></i>
            </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={toggleSidebar} icon={<i className="fas fa-bars" />}>
          Tracks
        </Button>
        <Button onClick={toggleAiPanel} icon={<i className="fas fa-robot" />}>
          AI Studio
        </Button>
        <Button variant="primary" icon={<i className="fas fa-download" />}>
          Export
        </Button>
      </div>
    </header>
  );
};