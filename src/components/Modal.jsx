import React, { useEffect } from 'react';
import { X } from 'lucide-react';
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-premium transition-all animate-fade-in z-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};
export default Modal;