import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-bg-secondary border border-[#252540] rounded-xl w-full max-w-md mx-4 shadow-2xl animate-slideUp overflow-hidden">
        <div className="p-6 border-b border-[#252540] flex justify-between items-center bg-bg-tertiary">
          <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-brand-pink bg-clip-text text-transparent">
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-[#252540] flex justify-end gap-3 bg-bg-tertiary">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};