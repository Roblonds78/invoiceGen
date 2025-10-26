import React, { useState, useEffect } from 'react';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (acronym: string, period: string) => void;
  existingAcronyms: string[];
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onSave, existingAcronyms }) => {
  const [acronym, setAcronym] = useState('');
  const [period, setPeriod] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAcronym('');
      setPeriod('');
      setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    const upperAcronym = acronym.toUpperCase();
    if (!upperAcronym.match(/^[A-Z]{3}$/)) {
      setError("L'acronimo deve essere di 3 lettere.");
      return;
    }
    if (existingAcronyms.includes(upperAcronym)) {
        setError('Esiste già una società gestita con questo acronimo. Selezionala dalla lista principale.');
        return;
    }
    if (!period.trim()) {
      setError('Il periodo di riferimento non può essere vuoto.');
      return;
    }
    onSave(upperAcronym, period.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Crea Fattura per Nuova Società</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="company-acronym" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Acronimo Società (3 lettere)</label>
            <input
              type="text"
              id="company-acronym"
              value={acronym}
              onChange={(e) => setAcronym(e.target.value)}
              maxLength={3}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Es. ABC"
            />
          </div>
          <div>
            <label htmlFor="invoice-period" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Periodo di Riferimento</label>
            <input
              type="text"
              id="invoice-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Es. 1st_Q_24"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Annulla
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800">
            Crea Fattura
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyModal;
