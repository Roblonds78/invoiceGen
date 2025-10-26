import React, { useState, useEffect } from 'react';
import { Company, CompanyAcronym, ParsedInvoice } from '../types';
import { CopyIcon, CheckIcon } from './icons';

interface InvoiceGeneratorProps {
  companies: Company[];
  selectedCompany: CompanyAcronym | '';
  onCompanyChange: (acronym: CompanyAcronym | '') => void;
  onCreate: () => void;
  onSave: () => void;
  generatedInvoice: ParsedInvoice | null;
  onAddNewCompany: () => void;
  isProcessing: boolean;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  companies,
  selectedCompany,
  onCompanyChange,
  onCreate,
  onSave,
  generatedInvoice,
  onAddNewCompany,
  isProcessing,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    if (generatedInvoice) {
      navigator.clipboard.writeText(generatedInvoice.fullString);
      setIsCopied(true);
    }
  };
  
  const handleCompanyChange = (value: string) => {
    if (value === 'add_new') {
        onAddNewCompany();
    } else {
        onCompanyChange(value as CompanyAcronym | '');
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Crea Nuova Fattura</h2>
      
      <div>
        <label htmlFor="company-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          1. Seleziona Società
        </label>
        <select
          id="company-select"
          value={selectedCompany}
          onChange={(e) => handleCompanyChange(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          disabled={isProcessing}
        >
          <option value="">-- Scegli una società --</option>
          {companies.map((company) => (
            <option key={company.acronym} value={company.acronym}>
              {company.name}
            </option>
          ))}
          <option value="add_new" className="font-bold text-blue-600 dark:text-blue-400">
            + Crea fattura per nuova società...
          </option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onCreate}
          disabled={!selectedCompany || isProcessing}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 dark:disabled:bg-gray-600"
        >
          {isProcessing ? 'Elaborazione...' : 'Crea'}
        </button>
        <button
          onClick={onSave}
          disabled={!generatedInvoice || isProcessing}
          className="w-full flex items-center justify-center text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 dark:disabled:bg-gray-600"
        >
          {isProcessing ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>

      {generatedInvoice && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold">Nuovo Nome Fattura Generato:</h3>
          <div>
            <pre className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg font-mono text-sm break-all">
              {generatedInvoice.fullString}
            </pre>
            <button
              onClick={handleCopy}
              className="mt-4 flex items-center justify-center gap-2 w-full text-white bg-slate-600 hover:bg-slate-700 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-lg px-5 py-3 text-center dark:bg-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-800 transition-colors duration-200"
              aria-live="polite"
              aria-label="Copia nome fattura"
            >
              {isCopied ? (
                <>
                  <CheckIcon className="w-6 h-6" />
                  <span>Copiato!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-6 h-6" />
                  <span>Copia Nome Fattura</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2 text-sm">
             <h4 className="font-semibold text-blue-800 dark:text-blue-300">Riepilogo Dettagli:</h4>
             <ul className="list-disc list-inside text-slate-700 dark:text-slate-300">
                <li><span className="font-semibold">Numero:</span> {String(generatedInvoice.number).padStart(3, '0')}</li>
                <li><span className="font-semibold">Azienda:</span> {generatedInvoice.companyName} ({generatedInvoice.acronym})</li>
                <li><span className="font-semibold">Data:</span> {generatedInvoice.date}</li>
                <li><span className="font-semibold">Periodo:</span> {generatedInvoice.period}</li>
             </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export default InvoiceGenerator;
