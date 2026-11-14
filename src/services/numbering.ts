import { storageService } from './storage';

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getNextDocNumber = (
  docType: 'challan' | 'invoice' | 'report' | 'receipt'
): { docNo: string; newSequence: number } => {
  const numbering = storageService.getNumbering();
  let prefix = '';
  let nextSeq = 1;

  if (docType === 'challan') {
    prefix = numbering.challanPrefix;
    nextSeq = numbering.challanNextNum;
  } else if (docType === 'invoice') {
    prefix = numbering.invoicePrefix;
    nextSeq = numbering.invoiceNextNum;
  } else if (docType === 'report') {
    prefix = numbering.reportPrefix;
    nextSeq = numbering.reportNextNum;
  } else if (docType === 'receipt') {
    prefix = numbering.receiptPrefix;
    nextSeq = numbering.receiptNextNum;
  }

  // Look for collisions in existing items
  let attempts = 0;
  let candidate = '';

  while (attempts < 500) {
    const seqStr = String(nextSeq).padStart(4, '0');
    candidate = `${prefix}/${numbering.fy}/${seqStr}`;

    let isDuplicate = false;
    if (docType === 'challan') {
      const challans = storageService.getChallans();
      isDuplicate = challans.some((c) => c.challanNo === candidate);
    } else if (docType === 'invoice') {
      const invoices = storageService.getInvoices();
      isDuplicate = invoices.some((i) => i.invoiceNo === candidate);
    } else if (docType === 'report') {
      const reports = storageService.getReports();
      isDuplicate = reports.some((r) => r.reportNo === candidate);
    } else if (docType === 'receipt') {
      const payments = storageService.getPayments();
      isDuplicate = payments.some((p) => p.receiptNo === candidate);
    }

    if (!isDuplicate) {
      break;
    }
    nextSeq++;
    attempts++;
  }

  return { docNo: candidate, newSequence: nextSeq + 1 };
};

export const commitNextDocSequence = (
  docType: 'challan' | 'invoice' | 'report' | 'receipt',
  newSequence: number
) => {
  const numbering = storageService.getNumbering();
  if (docType === 'challan') numbering.challanNextNum = newSequence;
  if (docType === 'invoice') numbering.invoiceNextNum = newSequence;
  if (docType === 'report') numbering.reportNextNum = newSequence;
  if (docType === 'receipt') numbering.receiptNextNum = newSequence;
  storageService.saveNumbering(numbering);
};

export interface TaxCalculationResult {
  taxableValue: number;
  discountAmount: number;
  isInterState: boolean;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
}

export const calculateGST = (
  subtotal: number,
  discountPercentage: number,
  gstRate: number,
  companyStateCode: string,
  customerStateCode: string
): TaxCalculationResult => {
  const safeSubtotal = Math.max(0, subtotal || 0);
  const discountAmount = Math.round((safeSubtotal * (discountPercentage || 0)) / 100 * 100) / 100;
  const taxableValue = Math.max(0, safeSubtotal - discountAmount);

  // If customer and company are in the same state: CGST + SGST
  // If customer is in another state: IGST
  const isInterState =
    Boolean(companyStateCode && customerStateCode) &&
    companyStateCode.trim() !== customerStateCode.trim();

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstRate = gstRate;
    igstAmount = Math.round((taxableValue * igstRate) / 100 * 100) / 100;
  } else {
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstAmount = Math.round((taxableValue * cgstRate) / 100 * 100) / 100;
    sgstAmount = Math.round((taxableValue * sgstRate) / 100 * 100) / 100;
  }

  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const rawTotal = taxableValue + totalTax;
  const roundedGrandTotal = Math.round(rawTotal);
  const roundOff = Math.round((roundedGrandTotal - rawTotal) * 100) / 100;

  return {
    taxableValue,
    discountAmount,
    isInterState,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTax,
    roundOff,
    grandTotal: roundedGrandTotal,
  };
};

// Convert number to Indian words
export const numberToWordsIndian = (num: number): string => {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const inWords = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ';
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        ' Hundred ' +
        inWords(n % 100)
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        'Thousand ' +
        inWords(n % 1000)
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        'Lakh ' +
        inWords(n % 100000)
      );
    return (
      inWords(Math.floor(n / 10000000)) +
      'Crore ' +
      inWords(n % 10000000)
    );
  };

  const integerPart = Math.floor(Math.abs(num));
  if (integerPart === 0) return 'Zero Rupees Only';

  const result = inWords(integerPart).trim();
  return result + ' Rupees Only';
};
