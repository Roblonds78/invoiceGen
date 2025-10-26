import React from 'react';
import { XIcon, PencilIcon } from './icons';

interface InvoiceListProps {
  invoices: string[];
  isLoading: boolean;
  error: string | null;
  onDelete: (invoice: string) => void;
  onEdit: (invoice: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, isLoading, error, onDelete, onEdit }) => {

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-slate-500 dark:text-slate-400">Caricamento fatture...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-full text-center text-red-500">
          <p>{error}</p>
        </div>
      );
    }
    
    if (invoices.length === 0) {
      return <p className="text-center text-slate-500 dark:text-slate-400">Nessuna fattura trovata. Inizia creandone una nuova!</p>;
    }

    return (
      <ul className="space-y-2">
        {invoices.map((invoice) => (
          <li 
            key={invoice} 
            className="flex items-center justify-between font-mono text-xs p-2 bg-white dark:bg-gray-700/50 rounded shadow-sm animate-fade-in"
          >
            <span className="break-all pr-2">{invoice}</span>
            <div className="flex items-center flex-shrink-0">
                <button
                onClick={() => onEdit(invoice)}
                className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-all"
                aria-label={`Modifica fattura ${invoice}`}
                >
                <PencilIcon className="w-4 h-4" />
                </button>
                <button
                onClick={() => onDelete(invoice)}
                className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-all"
                aria-label={`Cancella fattura ${invoice}`}
                >
                <XIcon className="w-4 h-4" />
                </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Elenco Fatture Archiviate</h2>
      <div className="h-[600px] overflow-y-auto pr-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
        {renderContent()}
      </div>
    </section>
  );
};

export default InvoiceList;