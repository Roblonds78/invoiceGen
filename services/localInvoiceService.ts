import { Company } from '../types';
import { COMPANIES, INITIAL_INVOICES } from '../constants';

const INVOICES_KEY = 'invoice_app_invoices';
const COMPANIES_KEY = 'invoice_app_companies';

/**
 * Retrieves invoices from local storage, or initializes with default data.
 * @returns An array of invoice strings.
 */
export function getInvoices(): string[] {
    try {
        const stored = localStorage.getItem(INVOICES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to parse invoices from localStorage', e);
        // Fallback to initial data
    }
    // On first run or if storage is corrupted, use initial data and save it.
    saveInvoices(INITIAL_INVOICES);
    return INITIAL_INVOICES;
}

/**
 * Saves an array of invoice strings to local storage.
 * @param invoices The array of invoices to save.
 */
export function saveInvoices(invoices: string[]): void {
    try {
        localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    } catch (e) {
        console.error('Failed to save invoices to localStorage', e);
        throw new Error("Impossibile salvare le fatture. Il local storage potrebbe essere pieno o non disponibile.");
    }
}

/**
 * Replaces all existing invoices in local storage with a new set.
 * @param invoices The new array of invoices.
 */
export function replaceInvoices(invoices: string[]): void {
    saveInvoices(invoices);
}

/**
 * Retrieves companies from local storage, or initializes with default data.
 * @returns An array of Company objects.
 */
export function getCompanies(): Company[] {
    try {
        const stored = localStorage.getItem(COMPANIES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to parse companies from localStorage', e);
    }
    // On first run, use constants and save them.
    saveCompanies(COMPANIES);
    return COMPANIES;
}

/**
 * Saves an array of Company objects to local storage.
 * @param companies The array of companies to save.
 */
export function saveCompanies(companies: Company[]): void {
    try {
        localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
    } catch (e) {
        console.error('Failed to save companies to localStorage', e);
        // Don't throw an error as this is less critical than saving invoices.
    }
}
