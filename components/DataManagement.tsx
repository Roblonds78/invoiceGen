import React from 'react';
import { ExportIcon, ImportIcon } from './icons';

interface DataManagementProps {
  onExport: () => void;
  onImportClick: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onExport, onImportClick }) => {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gestione Dati</h2>

      <div>
        <span className="font-semibold">Sorgente dati:</span>
        <span className="ml-2 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Locale (nel browser)
        </span>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Backup Manuale</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Puoi salvare un backup di tutte le fatture in un file di testo, o ripristinare i dati da un backup precedente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 text-white bg-slate-600 hover:bg-slate-700 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-800 transition-colors"
          >
            <ExportIcon className="w-5 h-5" />
            <span>Esporta Dati</span>
          </button>
          <button
            onClick={onImportClick}
            className="w-full flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 transition-colors"
          >
            <ImportIcon className="w-5 h-5" />
            <span>Importa Dati</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DataManagement;
