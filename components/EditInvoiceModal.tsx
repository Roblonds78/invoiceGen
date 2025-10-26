import React, { useState, useEffect } from 'react';

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newInvoiceName: string) => void;
  currentInvoiceName: string | null;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ isOpen, onClose, onSave, currentInvoiceName }) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen && currentInvoiceName) {
      setNewName(currentInvoiceName);
    }
  }, [isOpen, currentInvoiceName]);

  const handleSave = () => {
    if (newName.trim() && newName.trim() !== currentInvoiceName) {
      onSave(newName.trim());
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Modifica Nome Fattura</h2>
        <div>
            <label htmlFor="invoice-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome Fattura</label>
            <input
              type="text"
              id="invoice-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Annulla
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800">
            Salva Modifiche
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceModal;
