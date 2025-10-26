import { Company, ParsedInvoice } from '../types';
import { COMPANIES } from '../constants';

/**
 * Parses an invoice string into a structured ParsedInvoice object.
 * @param invoice The raw invoice string.
 * @returns A ParsedInvoice object, or null if the string is not in the correct format.
 */
export function parseInvoiceString(invoice: string): ParsedInvoice | null {
    const regex = /^INVOICE_FAB_SAMPERI_([A-Z]{3})(\d{3})_(\d{2}-\d{2}-\d{2})_\((.+)\)$/;
    const match = invoice.trim().match(regex);

    if (!match) {
        return null;
    }

    const [, acronym, numberStr, date, period] = match;
    const number = parseInt(numberStr, 10);
    
    const company = COMPANIES.find(c => c.acronym === acronym);
    // Fallback for ad-hoc companies not in the main list.
    const companyName = company ? company.name : `Società Ad-Hoc (${acronym})`;

    return {
        fullString: invoice.trim(),
        acronym,
        number,
        date,
        period,
        companyName,
    };
}

/**
 * Calculates the next billing period based on the last one.
 * Handles quarterly, half-yearly, and other patterns.
 * @param lastPeriod The string of the last known period.
 * @returns The calculated next period string.
 */
function calculateNextPeriod(lastPeriod: string): string {
    const currentYearSuffix = new Date().getFullYear().toString().slice(-2);

    // Try to find a year suffix (e.g., _24)
    const yearMatch = lastPeriod.match(/(\d{2})$/);
    let year = yearMatch ? parseInt(yearMatch[1], 10) : null;
    let nextYear = year !== null ? String(year + 1).padStart(2, '0') : currentYearSuffix;

    // Pattern: 1st_and_2nd_Q_YY -> 3rd_and_4th_Q_YY
    if (/1st_and_2nd_Q/.test(lastPeriod) && year !== null) {
        return `3rd_and_4th_Q_${year}`;
    }
    // Pattern: 3rd_and_4th_Q_YY -> 1st_and_2nd_Q_YY+1
    if (/3rd_and_4th_Q/.test(lastPeriod)) {
        return `1st_and_2nd_Q_${nextYear}`;
    }

    // Pattern: 1st_H_YY -> 2nd_H_YY
    if (/1st_H/.test(lastPeriod) && year !== null) {
        return `2nd_H_${year}`;
    }
    // Pattern: 2nd_H_YY -> 1st_H_YY+1
    if (/2nd_H/.test(lastPeriod)) {
        return `1st_H_${nextYear}`;
    }

    // Pattern: Quarterly Q1 -> Q2 -> Q3 -> Q4 -> Q1 of next year
    const quarterMatch = lastPeriod.match(/(\d)(?:st|nd|rd|th)_Q/);
    if (quarterMatch && year !== null) {
        const quarter = parseInt(quarterMatch[1], 10);
        if (quarter < 4) {
            const nextQuarter = quarter + 1;
            const suffixes: { [key: number]: string } = { 1: 'st', 2: 'nd', 3: 'rd', 4: 'th' };
            return `${nextQuarter}${suffixes[nextQuarter]}_Q_${year}`;
        } else {
            return `1st_Q_${nextYear}`;
        }
    }

    // Pattern for unstructured text with a 4-digit year (e.g., til_May_2024)
    const fourDigitYearMatch = lastPeriod.match(/(\d{4})/);
    if (fourDigitYearMatch) {
        const yearValue = parseInt(fourDigitYearMatch[1], 10);
        return lastPeriod.replace(String(yearValue), String(yearValue + 1));
    }
    
    // Fallback for completely unstructured text like "Nuovo_IMAIE"
    // Just append the current year suffix.
    if (!yearMatch && !fourDigitYearMatch) {
        return `${lastPeriod}_${currentYearSuffix}`;
    }
    
    // Final fallback if a pattern with a year was found but not matched above.
    return `NEXT_FOR_${lastPeriod}`;
}


/**
 * Generates the next invoice based on the existing list of invoices for a given company.
 * It uses a global sequential number and calculates the next period.
 * @param company The company for which to generate the invoice.
 * @param invoices The list of all existing invoices.
 * @returns A new ParsedInvoice object.
 */
export function generateNextInvoice(company: Company, invoices: string[]): ParsedInvoice {
    const parsedInvoices = invoices
        .map(parseInvoiceString)
        .filter((p): p is ParsedInvoice => p !== null);

    // Find the last invoice for the SPECIFIC company by sorting them
    const companyInvoices = parsedInvoices
        .filter(p => p.acronym === company.acronym)
        .sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('-').map(Number);
            const [dayB, monthB, yearB] = b.date.split('-').map(Number);
            
            const dateA = new Date(yearA + 2000, monthA - 1, dayA);
            const dateB = new Date(yearB + 2000, monthB - 1, dayB);
          
            // FIX: Corrected variable names from `a` and `b` to `dateA` and `dateB`
            // to call `getTime()` on the Date objects, not the ParsedInvoice objects.
            if (dateB.getTime() === dateA.getTime()) {
              return b.number - a.number;
            }
        
            return dateB.getTime() - dateA.getTime();
        });
        
    const lastCompanyInvoice = companyInvoices.length > 0 ? companyInvoices[0] : null;

    let nextPeriod: string;
    const currentYear = new Date().getFullYear().toString().slice(-2);

    if (lastCompanyInvoice) {
        nextPeriod = calculateNextPeriod(lastCompanyInvoice.period);
    } else {
        // Default period for a new company
        nextPeriod = `1st_H_${currentYear}`;
    }
    
    // Global numbering continues from the absolute last invoice
    const lastNumber = parsedInvoices.length > 0
        ? Math.max(...parsedInvoices.map(p => p.number))
        : 0;
        
    const nextNumber = lastNumber + 1;
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = String(now.getFullYear()).slice(-2);
    const nextDate = `${day}-${month}-${year}`;

    const paddedNextNumber = String(nextNumber).padStart(3, '0');
    const newInvoiceString = `INVOICE_FAB_SAMPERI_${company.acronym}${paddedNextNumber}_${nextDate}_(${nextPeriod})`;

    return {
        fullString: newInvoiceString,
        acronym: company.acronym,
        number: nextNumber,
        date: nextDate,
        period: nextPeriod,
        companyName: company.name,
    };
}
