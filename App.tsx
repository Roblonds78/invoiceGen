import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Company, CompanyAcronym, ParsedInvoice } from './types';
import { generateNextInvoice, parseInvoiceString } from './services/invoiceService';
import * as localInvoiceService from './services/localInvoiceService';
import InvoiceGenerator from './components/InvoiceGenerator';
import InvoiceList from './components/InvoiceList';
import AddCompanyModal from './components/AddCompanyModal';
import EditInvoiceModal from './components/EditInvoiceModal';
import DataManagement from './components/DataManagement';
import ConfirmationModal from './components/ConfirmationModal';

const sortInvoicesDescending = (a: string, b: string): number => {
  const parsedA = parseInvoiceString(a);
  const parsedB = parseInvoiceString(b);

  if (!parsedA) return 1;
  if (!parsedB) return -1;
  
  const [dayA, monthA, yearA] = parsedA.date.split('-').map(Number);
  const [dayB, monthB, yearB] = parsedB.date.split('-').map(Number);

  const dateA = new Date(yearA + 2000, monthA - 1, dayA);
  const dateB = new Date(yearB + 2000, monthB - 1, dayB);
  
  if (dateB.getTime() === dateA.getTime()) {
      return parsedB.number - parsedA.number;
  }

  return dateB.getTime() - dateA.getTime();
};

/**
 * Formats a user-provided period string into a standardized format.
 * @param input The raw user input string for the period.
 * @returns A formatted period string.
 */
function formatPeriod(input: string): string {
    if (!input) return '';
    const text = input.trim().toLowerCase();

    // Try to find a year (e.g., 2025 -> 25, '25 -> 25)
    const yearMatch = text.match(/(?:20)?(\d{2})$/);
    const year = yearMatch ? yearMatch[1] : null;
    
    if (!year) {
        // Fallback if no year is found: just replace spaces with underscores
        return input.trim().replace(/\s+/g, '_');
    }
    
    let coreText = text.replace(/(?:20)?\d{2}$/, '').trim();
    coreText = coreText.replace(/['.]/g, ''); // remove special chars

    // Check for Quarters (q, qtr, quarter)
    if (coreText.includes('q') || coreText.includes('quarter')) {
        if (coreText.includes('1') || coreText.includes('first')) return `1st_Q_${year}`;
        if (coreText.includes('2') || coreText.includes('sec')) return `2nd_Q_${year}`;
        if (coreText.includes('3') || coreText.includes('third')) return `3rd_Q_${year}`;
        if (coreText.includes('4') || coreText.includes('fourth')) return `4th_Q_${year}`;
    }

    // Check for Halves (h, half)
    if (coreText.includes('h') || coreText.includes('half')) {
        if (coreText.includes('1') || coreText.includes('first')) return `1st_H_${year}`;
        if (coreText.includes('2') || coreText.includes('sec')) return `2nd_H_${year}`;
    }

    // Fallback for more complex or unmatched patterns
    return input.trim().replace(/\s+/g, '_');
}

function App() {
  const [invoices, setInvoices] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<CompanyAcronym | ''>('');
  const [generatedInvoice, setGeneratedInvoice] = useState<ParsedInvoice | null>(null);
  
  // State to manage file import flow
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [importConfirmationData, setImportConfirmationData] = useState<string[] | null>(null);


  // Modal states
  const [isAdHocModalOpen, setAdHocModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load initial data from local storage
  useEffect(() => {
    setIsLoading(true);
    try {
        const loadedInvoices = localInvoiceService.getInvoices();
        setInvoices(loadedInvoices.sort(sortInvoicesDescending));
        const loadedCompanies = localInvoiceService.getCompanies();
        setCompanies(loadedCompanies);
    } catch (e: any) {
        setError(e.message || "Errore during caricamento dei dati locali.");
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  // Auto-hide success message
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localInvoiceService.saveCompanies(companies);
      } catch (e) {
        setError("Errore during salvataggio delle società. Le modifiche potrebbero non persistere.");
      }
    }
  }, [companies, isLoading]);
  
  // Process imported file content by triggering the confirmation modal
  useEffect(() => {
    if (fileContent === null) return;
    
    try {
        if (!fileContent) throw new Error("Il file è vuoto o illeggibile.");

        const importedInvoices = fileContent.split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('INVOICE_FAB_SAMPERI_'));

        if (importedInvoices.length === 0) {
            throw new Error("Nessuna fattura valida trovata nel file.");
        }
        
        // Set data for confirmation modal instead of blocking with window.confirm
        setImportConfirmationData(importedInvoices);

    } catch (err: any) {
        setError(err.message || "Importazione fallita.");
    } finally {
        // Clean up file input, but not the content state yet
        setFileContent(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  }, [fileContent]);

  const confirmImport = () => {
    if (!importConfirmationData) return;
    
    try {
      const newInvoices = [...importConfirmationData].sort(sortInvoicesDescending);
      localInvoiceService.replaceInvoices(newInvoices);
      setInvoices(newInvoices);
      setSuccessMsg("Dati importati con successo!");
    } catch (err: any) {
      setError(err.message || "Importazione fallita.");
    } finally {
      setImportConfirmationData(null); // Close modal
    }
  };

  const cancelImport = () => {
    setImportConfirmationData(null);
  };

  const handleCreate = useCallback(() => {
    if (!selectedCompany) {
      alert('Per favore, seleziona una società.');
      return;
    }
    const company = companies.find(c => c.acronym === selectedCompany);
    if (company) {
      const newInvoice = generateNextInvoice(company, invoices);
      setGeneratedInvoice(newInvoice);
    }
  }, [selectedCompany, invoices, companies]);

  const handleSave = useCallback(() => {
    if (generatedInvoice) {
      setIsProcessing(true);
      setError(null);
      try {
        const updatedInvoices = [generatedInvoice.fullString, ...invoices];
        localInvoiceService.saveInvoices(updatedInvoices);
        setInvoices(updatedInvoices.sort(sortInvoicesDescending));
        setGeneratedInvoice(null);
        setSuccessMsg("Fattura salvata con successo!");
      } catch (e: any) {
        setError(e.message || `Impossibile salvare la fattura.`);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [generatedInvoice, invoices]);
  
  const openDeleteModal = useCallback((invoice: string) => {
    setDeleteTarget(invoice);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    setIsProcessing(true);
    setError(null);
    try {
      const updated = invoices.filter(inv => inv.trim() !== deleteTarget.trim());
      localInvoiceService.saveInvoices(updated);
      setInvoices(updated);
      setSuccessMsg('Fattura eliminata!');
    } catch (e: any) {
      setError(e.message || "Impossibile cancellare la fattura.");
    } finally {
      setIsProcessing(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, invoices]);

  const handleEdit = useCallback((invoiceToEdit: string) => {
    setEditingInvoice(invoiceToEdit);
    setEditModalOpen(true);
  }, []);
  
  const handleUpdateInvoice = useCallback((newInvoiceName: string) => {
    if (editingInvoice) {
        setIsProcessing(true);
        setError(null);
        try {
            const updatedInvoices = invoices.map(inv => (inv.trim() === editingInvoice.trim() ? newInvoiceName.trim() : inv));
            localInvoiceService.saveInvoices(updatedInvoices);
            setInvoices(updatedInvoices.sort(sortInvoicesDescending));
            setSuccessMsg("Fattura modificata con successo!");
        } catch(e: any) {
            setError(e.message || "Impossibile modificare la fattura.");
        } finally {
            setIsProcessing(false);
        }
    }
    setEditingInvoice(null);
    setEditModalOpen(false);
  }, [editingInvoice, invoices]);
  
  const handleGenerateAdHocInvoice = useCallback((acronym: string, period: string) => {
    const formattedPeriod = formatPeriod(period);

    const parsedInvoices = invoices
      .map(parseInvoiceString)
      .filter((p): p is ParsedInvoice => p != null && 'number' in p);

    const lastGlobalNumber = parsedInvoices.length > 0
      ? Math.max(...parsedInvoices.map(p => p.number))
      : 0;
    const nextNumber = lastGlobalNumber + 1;
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const nextDate = `${day}-${month}-${year}`;

    const paddedNextNumber = String(nextNumber).padStart(3, '0');
    
    const newInvoiceString = `INVOICE_FAB_SAMPERI_${acronym}${paddedNextNumber}_${nextDate}_(${formattedPeriod})`;

    const newGeneratedInvoice: ParsedInvoice = {
      fullString: newInvoiceString,
      acronym: acronym,
      number: nextNumber,
      date: nextDate,
      period: formattedPeriod,
      companyName: `Società Ad-Hoc (${acronym})`,
    };

    setGeneratedInvoice(newGeneratedInvoice);
    setAdHocModalOpen(false);
    setSelectedCompany(''); // Reset company selection
  }, [invoices]);

  const handleExport = useCallback(() => {
    try {
        const data = localInvoiceService.getInvoices().join('\n');
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `fatture_backup_${date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e: any) {
        setError(e.message || "Esportazione fallita.");
    }
  }, []);
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        // Trigger the processing effect by setting the file content
        setFileContent(content);
    };
    reader.onerror = () => {
        setError("Impossibile leggere il file.");
    };
    reader.readAsText(file);
  };

  const renderApp = () => (
     <div className="w-full max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
          Generatore Nomi Fatture
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Crea, gestisci e archivia i nomi delle tue fatture.
        </p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
           <InvoiceGenerator
              companies={companies}
              selectedCompany={selectedCompany}
              onCompanyChange={setSelectedCompany}
              onCreate={handleCreate}
              onSave={handleSave}
              generatedInvoice={generatedInvoice}
              onAddNewCompany={() => setAdHocModalOpen(true)}
              isProcessing={isProcessing}
           />
        </div>
        <div className="lg:col-span-2 flex flex-col space-y-8">
            <DataManagement 
                onExport={handleExport}
                onImportClick={handleImportClick}
            />
            <InvoiceList invoices={invoices} isLoading={isLoading} error={error} onDelete={openDeleteModal} onEdit={handleEdit} />
        </div>
      </main>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".txt"
        className="hidden"
      />
     </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {isProcessing && (
            <div className="fixed top-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg z-[100] flex items-center animate-fade-in" aria-live="assertive">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Elaborazione...
            </div>
        )}
        {successMsg && (
            <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-lg z-[100] flex items-center animate-fade-in" role="alert">
                <p className="font-bold">{successMsg}</p>
            </div>
        )}
        {error && (
            <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg z-[100] animate-fade-in w-full max-w-md" role="alert">
              <p className="font-bold">Si è verificato un errore</p>
              <p>{error}</p>
            </div>
        )}

        {renderApp()}

        <AddCompanyModal
            isOpen={isAdHocModalOpen}
            onClose={() => setAdHocModalOpen(false)}
            onSave={handleGenerateAdHocInvoice}
            existingAcronyms={companies.map(c => c.acronym)}
        />
        <EditInvoiceModal
            isOpen={isEditModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleUpdateInvoice}
            currentInvoiceName={editingInvoice}
        />
        <ConfirmationModal
          isOpen={deleteTarget !== null}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Conferma Eliminazione"
          message={`Sei sicuro di voler eliminare la fattura "${deleteTarget}"? L'azione è irreversibile.`}
        />
        <ConfirmationModal
          isOpen={importConfirmationData !== null}
          onClose={cancelImport}
          onConfirm={confirmImport}
          title="Conferma Importazione Dati"
          message={`Trovate ${importConfirmationData?.length || 0} fatture. Vuoi SOSTITUIRE l'elenco attuale con il contenuto di questo file? L'azione non è reversibile.`}
        />
    </div>
  );
}

export default App;