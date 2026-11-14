// Types for Industrial Delivery Challan & Service Billing ERP

export type UserRole = 'Admin' | 'Accounts' | 'Engineer' | 'Manager' | 'Viewer';

export interface CompanyProfile {
  name: string;
  logoUrl: string;
  address: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  website: string;
  state: string;
  stateCode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  authorizedSignatory: string;
  signatoryDesignation: string;
}

export interface NumberingConfig {
  fy: string;
  challanPrefix: string;
  challanNextNum: number;
  invoicePrefix: string;
  invoiceNextNum: number;
  reportPrefix: string;
  reportNextNum: number;
  receiptPrefix: string;
  receiptNextNum: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  gstin: string;
  billingAddress: string;
  siteAddress: string;
  state: string;
  stateCode: string;
  contactPerson: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  customerId: string;
  customerName: string;
  poNumber: string;
  poDate: string;
  poValue: number;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'In Progress' | 'Commissioned' | 'Completed' | 'On Hold';
  siteLocation: string;
  notes?: string;
}

export type ChallanType =
  | 'Supply / Delivery'
  | 'Returnable Material'
  | 'Non-Returnable Material'
  | 'Material Sent for Service'
  | 'Material Sent for Repair'
  | 'Material Sent for Testing'
  | 'Project Site Material'
  | 'Replacement Material';

export type ChallanStatus =
  | 'Draft'
  | 'Approved'
  | 'Dispatched'
  | 'Delivered'
  | 'Partially Delivered'
  | 'Returned'
  | 'Cancelled';

export interface ChallanItem {
  id: string;
  sNo: number;
  description: string;
  partNo: string;
  hsnSac: string;
  qty: number;
  unit: string;
  serialNo: string;
  remarks: string;
}

export interface DeliveryChallan {
  id: string;
  challanNo: string;
  challanDate: string;
  challanType: ChallanType;
  status: ChallanStatus;
  
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerGstin: string;
  customerState: string;
  customerStateCode: string;
  contactPerson: string;
  contactNumber: string;

  projectId?: string;
  projectName?: string;
  projectCode?: string;
  poNumber?: string;
  poDate?: string;

  engineerName: string;
  vehicleNumber: string;
  transporterName: string;
  ewayBillNo?: string;
  deliveryLocation: string;
  purposeOfDelivery: string;

  items: ChallanItem[];
  totalQty: number;

  specialInstructions?: string;
  termsAndConditions?: string;
  receiverName?: string;
  receiverSignatureDate?: string;

  linkedServiceReportId?: string;
  linkedInvoiceId?: string;

  auditHistory: AuditEntry[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ServiceReport {
  id: string;
  reportNo: string;
  date: string;
  
  customerId: string;
  customerName: string;
  projectId?: string;
  projectName?: string;
  siteLocation: string;
  engineerName: string;

  problemDescription: string;
  workPerformed: string;
  materialsUsed: string;
  equipmentDetails: string; // PLC/HMI/VFD details
  startTime: string;
  endTime: string;
  customerRemarks: string;
  customerSignatoryName: string;

  linkedChallanId?: string;
  linkedChallanNo?: string;
  linkedInvoiceId?: string;
  linkedInvoiceNo?: string;

  status: 'Open' | 'In Progress' | 'Completed' | 'Billed';
  createdAt: string;
  auditHistory: AuditEntry[];
}

export interface InvoiceItem {
  id: string;
  sNo: number;
  serviceDescription: string;
  sacCode: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export interface ServiceInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  status: PaymentStatus;
  approvalStatus: 'Draft' | 'Approved' | 'Cancelled';

  customerId: string;
  customerName: string;
  billingAddress: string;
  siteAddress: string;
  customerGstin: string;
  customerState: string;
  customerStateCode: string;
  contactPerson: string;
  email: string;
  phone: string;

  projectId?: string;
  projectName?: string;
  projectCode?: string;
  poNumber?: string;
  poDate?: string;
  workOrderNumber?: string;
  servicePeriod?: string;
  engineerName?: string;
  siteLocation?: string;

  linkedChallanId?: string;
  linkedChallanNo?: string;
  linkedServiceReportId?: string;
  linkedServiceReportNo?: string;

  items: InvoiceItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxableValue: number;

  gstRate: number; // 0, 5, 12, 18, 28
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

  amountPaid: number;
  balanceAmount: number;

  paymentMode?: string;
  transactionRef?: string;
  paymentDate?: string;

  notes?: string;
  termsAndConditions?: string;

  auditHistory: AuditEntry[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  receiptDate: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNo: string;
  amount: number;
  paymentMode: 'NEFT/RTGS' | 'Cheque' | 'UPI' | 'Net Banking' | 'Cash';
  transactionRef: string;
  bankName?: string;
  chequeDate?: string;
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  docType: 'Invoice' | 'Payment' | 'Debit Note' | 'Credit Note';
  docNo: string;
  reference?: string;
  debit: number;   // Customer owes money (Invoice)
  credit: number;  // Customer paid money (Receipt)
  balance: number; // Running balance
  remarks: string;
  createdAt: string;
}

export interface AuditEntry {
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details?: string;
}
