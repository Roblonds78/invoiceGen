import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" 
      aria-modal="true" 
      role="dialog"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in text-center">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onClose} 
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            aria-label="Annulla"
          >
            Annulla
          </button>
          <button 
            onClick={onConfirm} 
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
            aria-label="Conferma eliminazione"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;