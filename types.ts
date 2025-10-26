export enum CompanyAcronym {
  CHN = 'CHN',
  AGO = 'AGO',
  FRS = 'FRS',
  NVI = 'NVI',
  SSM = 'SSM',
}

export interface Company {
  acronym: CompanyAcronym;
  name: string;
}

export interface ParsedInvoice {
  fullString: string;
  acronym: string;
  number: number;
  date: string; // DD-MM-YY
  period: string;
  companyName: string;
}
