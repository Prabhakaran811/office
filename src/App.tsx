import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CompanyProfile,
  NumberingConfig,
  Customer,
  Project,
  DeliveryChallan,
  ServiceReport,
  ServiceInvoice,
  PaymentReceipt,
  LedgerEntry,
  UserRole,
  ChallanStatus,
} from './types';
import { storageService } from './services/storage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ChallanListView } from './components/challan/ChallanListView';
import { ChallanFormModal } from './components/challan/ChallanFormModal';
import { ChallanDetailModal } from './components/challan/ChallanDetailModal';

import { ServiceReportListView } from './components/serviceReport/ServiceReportListView';
import { ServiceReportFormModal } from './components/serviceReport/ServiceReportFormModal';
import { ServiceReportDetailModal } from './components/serviceReport/ServiceReportDetailModal';

import { InvoiceListView } from './components/serviceBill/InvoiceListView';
import { InvoiceFormModal } from './components/serviceBill/InvoiceFormModal';
import { InvoiceDetailModal } from './components/serviceBill/InvoiceDetailModal';

import { PaymentListView } from './components/payment/PaymentListView';
import { PaymentFormModal } from './components/payment/PaymentFormModal';
import { PaymentReceiptModal } from './components/payment/PaymentReceiptModal';

import { CustomerListView } from './components/customer/CustomerListView';
import { ProjectListView } from './components/project/ProjectListView';
import { OutstandingView } from './components/outstanding/OutstandingView';
import { ReportsView } from './components/reports/ReportsView';
import { GstView } from './components/gst/GstView';
import { SettingsView } from './components/settings/SettingsView';

export const App: React.FC = () => {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(
    (storageService.getCurrentRole() as UserRole) || 'Admin'
  );

  // Core ERP Entity Data
  const [company, setCompany] = useState<CompanyProfile>(storageService.getCompany());
  const [numbering, setNumbering] = useState<NumberingConfig>(storageService.getNumbering());
  const [customers, setCustomers] = useState<Customer[]>(storageService.getCustomers());
  const [projects, setProjects] = useState<Project[]>(storageService.getProjects());
  const [challans, setChallans] = useState<DeliveryChallan[]>(storageService.getChallans());
  const [reports, setReports] = useState<ServiceReport[]>(storageService.getReports());
  const [invoices, setInvoices] = useState<ServiceInvoice[]>(storageService.getInvoices());
  const [payments, setPayments] = useState<PaymentReceipt[]>(storageService.getPayments());
  const [ledger, setLedger] = useState<LedgerEntry[]>(storageService.getLedger());

  // Modal Controllers & Selected Items
  // Challans
  const [challanFormOpen, setChallanFormOpen] = useState(false);
  const [challanToEdit, setChallanToEdit] = useState<DeliveryChallan | null>(null);
  const [challanDetailOpen, setChallanDetailOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);

  // Service Reports
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<ServiceReport | null>(null);
  const [reportDetailOpen, setReportDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ServiceReport | null>(null);
  const [prefilledChallanForReport, setPrefilledChallanForReport] = useState<DeliveryChallan | null>(null);

  // Invoices
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<ServiceInvoice | null>(null);
  const [invoiceDetailOpen, setInvoiceDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceInvoice | null>(null);
  const [prefilledChallanForInvoice, setPrefilledChallanForInvoice] = useState<DeliveryChallan | null>(null);
  const [prefilledReportForInvoice, setPrefilledReportForInvoice] = useState<ServiceReport | null>(null);

  // Payments
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [targetInvoiceForPayment, setTargetInvoiceForPayment] = useState<ServiceInvoice | null>(null);
  const [paymentReceiptOpen, setPaymentReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  // Reports view helper
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState<string>('all');

  // Sync role to localStorage
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    storageService.saveCurrentRole(role);
  };

  // 1. Challan Handlers
  const handleSaveChallan = (savedChallan: DeliveryChallan) => {
    let updated: DeliveryChallan[];
    const exists = challans.some((c) => c.id === savedChallan.id);
    if (exists) {
      updated = challans.map((c) => (c.id === savedChallan.id ? savedChallan : c));
    } else {
      updated = [savedChallan, ...challans];
    }
    setChallans(updated);
    storageService.saveChallans(updated);
  };

  const handleUpdateChallanStatus = (
    challanId: string,
    newStatus: ChallanStatus,
    comment?: string
  ) => {
    const timestamp = new Date().toISOString();
    const updated = challans.map((c) => {
      if (c.id === challanId) {
        return {
          ...c,
          status: newStatus,
          updatedAt: timestamp,
          auditHistory: [
            ...(c.auditHistory || []),
            {
              timestamp,
              user: currentRole,
              role: currentRole,
              action: `Status changed to ${newStatus}`,
              details: comment,
            },
          ],
        };
      }
      return c;
    });
    setChallans(updated);
    storageService.saveChallans(updated);
    const refreshed = updated.find((c) => c.id === challanId);
    if (refreshed) setSelectedChallan(refreshed);
  };

  // 2. Service Report Handlers
  const handleSaveReport = (savedReport: ServiceReport) => {
    let updated: ServiceReport[];
    const exists = reports.some((r) => r.id === savedReport.id);
    if (exists) {
      updated = reports.map((r) => (r.id === savedReport.id ? savedReport : r));
    } else {
      updated = [savedReport, ...reports];
    }
    setReports(updated);
    storageService.saveReports(updated);
  };

  // 3. Invoice Handlers
  const handleSaveInvoice = (savedInvoice: ServiceInvoice) => {
    let updated: ServiceInvoice[];
    const exists = invoices.some((i) => i.id === savedInvoice.id);
    if (exists) {
      updated = invoices.map((i) => (i.id === savedInvoice.id ? savedInvoice : i));
    } else {
      updated = [savedInvoice, ...invoices];
    }
    setInvoices(updated);
    storageService.saveInvoices(updated);

    // Rule 9: Service Invoice creates the billing/accounting entry in Customer Ledger!
    if (savedInvoice.approvalStatus === 'Approved') {
      const existingLedger = ledger.find((l) => l.docNo === savedInvoice.invoiceNo);
      if (!existingLedger) {
        const lastEntry = ledger[ledger.length - 1];
        const newEntry: LedgerEntry = {
          id: 'ledg-' + Date.now(),
          date: savedInvoice.invoiceDate,
          customerId: savedInvoice.customerId,
          customerName: savedInvoice.customerName,
          docType: 'Invoice',
          docNo: savedInvoice.invoiceNo,
          reference: savedInvoice.poNumber || 'Service Billing',
          debit: savedInvoice.grandTotal,
          credit: 0,
          balance: (lastEntry ? lastEntry.balance : 0) + savedInvoice.grandTotal,
          remarks: `Service Invoice for ${savedInvoice.projectName || savedInvoice.customerName}`,
          createdAt: new Date().toISOString(),
        };
        const updatedLedger = [...ledger, newEntry];
        setLedger(updatedLedger);
        storageService.saveLedger(updatedLedger);
      }
    }

    // If linked to report, mark report as Billed
    if (savedInvoice.linkedServiceReportId) {
      const updatedReports = reports.map((r) =>
        r.id === savedInvoice.linkedServiceReportId
          ? { ...r, status: 'Billed' as const, linkedInvoiceId: savedInvoice.id, linkedInvoiceNo: savedInvoice.invoiceNo }
          : r
      );
      setReports(updatedReports);
      storageService.saveReports(updatedReports);
    }
  };

  const handleCancelInvoice = (invoiceId: string, reason: string) => {
    const timestamp = new Date().toISOString();
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;

    const updated = invoices.map((i) => {
      if (i.id === invoiceId) {
        return {
          ...i,
          status: 'Cancelled' as const,
          approvalStatus: 'Cancelled' as const,
          balanceAmount: 0,
          updatedAt: timestamp,
          auditHistory: [
            ...(i.auditHistory || []),
            {
              timestamp,
              user: currentRole,
              role: currentRole,
              action: 'Cancelled Invoice',
              details: reason,
            },
          ],
        };
      }
      return i;
    });

    setInvoices(updated);
    storageService.saveInvoices(updated);

    // Create reversing ledger credit entry
    const newEntry: LedgerEntry = {
      id: 'ledg-' + Date.now(),
      date: timestamp.split('T')[0],
      customerId: target.customerId,
      customerName: target.customerName,
      docType: 'Credit Note',
      docNo: 'REV-' + target.invoiceNo,
      reference: 'Cancellation Reversal',
      debit: 0,
      credit: target.grandTotal,
      balance: Math.max(0, (ledger[ledger.length - 1]?.balance || 0) - target.grandTotal),
      remarks: `Cancelled Invoice ${target.invoiceNo}: ${reason}`,
      createdAt: timestamp,
    };
    const updatedLedger = [...ledger, newEntry];
    setLedger(updatedLedger);
    storageService.saveLedger(updatedLedger);

    const refreshed = updated.find((i) => i.id === invoiceId);
    if (refreshed) setSelectedInvoice(refreshed);
  };

  // 4. Payment Handlers
  const handleSavePayment = (payment: PaymentReceipt, updatedInvoice: ServiceInvoice) => {
    const newPayments = [payment, ...payments];
    setPayments(newPayments);
    storageService.savePayments(newPayments);

    // Update invoices
    const newInvoices = invoices.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i));
    setInvoices(newInvoices);
    storageService.saveInvoices(newInvoices);

    // Rule 10: Payment automatically reduces customer outstanding and creates ledger credit entry
    const lastEntry = ledger[ledger.length - 1];
    const newEntry: LedgerEntry = {
      id: 'ledg-' + Date.now(),
      date: payment.receiptDate,
      customerId: payment.customerId,
      customerName: payment.customerName,
      docType: 'Payment',
      docNo: payment.receiptNo,
      reference: payment.transactionRef || payment.paymentMode,
      debit: 0,
      credit: payment.amount,
      balance: Math.max(0, (lastEntry ? lastEntry.balance : 0) - payment.amount),
      remarks: `Payment received against ${payment.invoiceNo} via ${payment.paymentMode}`,
      createdAt: new Date().toISOString(),
    };
    const updatedLedger = [...ledger, newEntry];
    setLedger(updatedLedger);
    storageService.saveLedger(updatedLedger);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    // Immediately preview payment receipt
    setSelectedReceipt(payment);
    setPaymentReceiptOpen(true);
  };

  // 5. Customer & Project Handlers
  const handleSaveCustomer = (customer: Customer) => {
    let updated: Customer[];
    const exists = customers.some((c) => c.id === customer.id);
    if (exists) {
      updated = customers.map((c) => (c.id === customer.id ? customer : c));
    } else {
      updated = [customer, ...customers];
    }
    setCustomers(updated);
    storageService.saveCustomers(updated);
  };

  const handleSaveProject = (project: Project) => {
    let updated: Project[];
    const exists = projects.some((p) => p.id === project.id);
    if (exists) {
      updated = projects.map((p) => (p.id === project.id ? project : p));
    } else {
      updated = [project, ...projects];
    }
    setProjects(updated);
    storageService.saveProjects(updated);
  };

  // 6. Cross-Module Workflows
  // Convert Delivery Challan -> Service Bill (Module D)
  const handleConvertChallanToInvoice = (challan: DeliveryChallan) => {
    setPrefilledChallanForInvoice(challan);
    setPrefilledReportForInvoice(null);
    setInvoiceToEdit(null);
    setInvoiceFormOpen(true);
  };

  // Convert Delivery Challan -> Service Report
  const handleConvertChallanToReport = (challan: DeliveryChallan) => {
    setPrefilledChallanForReport(challan);
    setReportToEdit(null);
    setReportFormOpen(true);
  };

  // Convert Service Report -> Service Bill (Module C)
  const handleConvertReportToInvoice = (report: ServiceReport) => {
    setPrefilledReportForInvoice(report);
    setPrefilledChallanForInvoice(null);
    setInvoiceToEdit(null);
    setInvoiceFormOpen(true);
  };

  // Reset to factory sample data
  const handleResetData = () => {
    storageService.resetAllData();
    setCompany(storageService.getCompany());
    setNumbering(storageService.getNumbering());
    setCustomers(storageService.getCustomers());
    setProjects(storageService.getProjects());
    setChallans(storageService.getChallans());
    setReports(storageService.getReports());
    setInvoices(storageService.getInvoices());
    setPayments(storageService.getPayments());
    setLedger(storageService.getLedger());
    setCurrentRole('Admin');
    alert('System reset to industrial automation sample dataset.');
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Veyon_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    const success = storageService.importBackup(jsonStr);
    if (success) {
      setCompany(storageService.getCompany());
      setNumbering(storageService.getNumbering());
      setCustomers(storageService.getCustomers());
      setProjects(storageService.getProjects());
      setChallans(storageService.getChallans());
      setReports(storageService.getReports());
      setInvoices(storageService.getInvoices());
      setPayments(storageService.getPayments());
      setLedger(storageService.getLedger());
      alert('Backup imported successfully!');
    } else {
      alert('Failed to parse backup JSON file.');
    }
  };

  // Badge counts for sidebar
  const sidebarCounts = {
    challans: challans.length,
    reports: reports.filter((r) => r.status === 'Open' || r.status === 'In Progress').length,
    invoices: invoices.length,
    unpaidInvoices: invoices.filter((i) => i.balanceAmount > 0 && i.status !== 'Cancelled').length,
    pendingDelivery: challans.filter((c) => c.status === 'Approved' || c.status === 'Dispatched').length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Navbar */}
      <Navbar
        company={company}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onNewChallan={() => {
          setChallanToEdit(null);
          setChallanFormOpen(true);
        }}
        onNewReport={() => {
          setReportToEdit(null);
          setPrefilledChallanForReport(null);
          setReportFormOpen(true);
        }}
        onNewInvoice={() => {
          setInvoiceToEdit(null);
          setPrefilledChallanForInvoice(null);
          setPrefilledReportForInvoice(null);
          setInvoiceFormOpen(true);
        }}
        onNewPayment={() => {
          setTargetInvoiceForPayment(null);
          setPaymentFormOpen(true);
        }}
        onResetData={handleResetData}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentRole={currentRole}
          counts={sidebarCounts}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              challans={challans}
              invoices={invoices}
              reports={reports}
              payments={payments}
              customers={customers}
              projects={projects}
              currentRole={currentRole}
              onNavigate={setActiveTab}
              onNewChallan={() => {
                setChallanToEdit(null);
                setChallanFormOpen(true);
              }}
              onNewReport={() => {
                setReportToEdit(null);
                setPrefilledChallanForReport(null);
                setReportFormOpen(true);
              }}
              onNewInvoice={() => {
                setInvoiceToEdit(null);
                setPrefilledChallanForInvoice(null);
                setPrefilledReportForInvoice(null);
                setInvoiceFormOpen(true);
              }}
              onNewPayment={() => {
                setTargetInvoiceForPayment(null);
                setPaymentFormOpen(true);
              }}
              onViewChallan={(c) => {
                setSelectedChallan(c);
                setChallanDetailOpen(true);
              }}
              onViewInvoice={(inv) => {
                setSelectedInvoice(inv);
                setInvoiceDetailOpen(true);
              }}
            />
          )}

          {/* TAB 2: CUSTOMERS */}
          {activeTab === 'customers' && (
            <CustomerListView
              customers={customers}
              invoices={invoices}
              projects={projects}
              currentRole={currentRole}
              onSaveCustomer={handleSaveCustomer}
              onDeleteCustomer={(id) => {
                const updated = customers.filter((c) => c.id !== id);
                setCustomers(updated);
                storageService.saveCustomers(updated);
              }}
              onViewLedgerForCustomer={(cid) => {
                setSelectedCustomerForLedger(cid);
                setActiveTab('analytics');
              }}
            />
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <ProjectListView
              projects={projects}
              customers={customers}
              challans={challans}
              reports={reports}
              invoices={invoices}
              payments={payments}
              currentRole={currentRole}
              onSaveProject={handleSaveProject}
              onViewChallansForProject={(pid) => setActiveTab('challans')}
              onViewInvoicesForProject={(pid) => setActiveTab('invoices')}
            />
          )}

          {/* TAB 4: DELIVERY CHALLANS (MODULE A) */}
          {activeTab === 'challans' && (
            <ChallanListView
              challans={challans}
              currentRole={currentRole}
              onNewChallan={() => {
                setChallanToEdit(null);
                setChallanFormOpen(true);
              }}
              onViewChallan={(c) => {
                setSelectedChallan(c);
                setChallanDetailOpen(true);
              }}
              onEditChallan={(c) => {
                setChallanToEdit(c);
                setChallanFormOpen(true);
              }}
              onCreateServiceBillFromChallan={handleConvertChallanToInvoice}
            />
          )}

          {/* TAB 5: SERVICE REPORTS (MODULE C) */}
          {activeTab === 'reports' && (
            <ServiceReportListView
              reports={reports}
              currentRole={currentRole}
              onNewReport={() => {
                setReportToEdit(null);
                setPrefilledChallanForReport(null);
                setReportFormOpen(true);
              }}
              onViewReport={(r) => {
                setSelectedReport(r);
                setReportDetailOpen(true);
              }}
              onEditReport={(r) => {
                setReportToEdit(r);
                setReportFormOpen(true);
              }}
              onCreateInvoiceFromReport={handleConvertReportToInvoice}
            />
          )}

          {/* TAB 6: SERVICE BILLS (MODULE B) */}
          {activeTab === 'invoices' && (
            <InvoiceListView
              invoices={invoices}
              currentRole={currentRole}
              onNewInvoice={() => {
                setInvoiceToEdit(null);
                setPrefilledChallanForInvoice(null);
                setPrefilledReportForInvoice(null);
                setInvoiceFormOpen(true);
              }}
              onViewInvoice={(inv) => {
                setSelectedInvoice(inv);
                setInvoiceDetailOpen(true);
              }}
              onEditInvoice={(inv) => {
                setInvoiceToEdit(inv);
                setInvoiceFormOpen(true);
              }}
              onRecordPayment={(inv) => {
                setTargetInvoiceForPayment(inv);
                setPaymentFormOpen(true);
              }}
            />
          )}

          {/* TAB 7: PAYMENTS */}
          {activeTab === 'payments' && (
            <PaymentListView
              payments={payments}
              currentRole={currentRole}
              onNewPayment={() => {
                setTargetInvoiceForPayment(null);
                setPaymentFormOpen(true);
              }}
              onViewReceipt={(receipt) => {
                setSelectedReceipt(receipt);
                setPaymentReceiptOpen(true);
              }}
            />
          )}

          {/* TAB 8: OUTSTANDING */}
          {activeTab === 'outstanding' && (
            <OutstandingView
              invoices={invoices}
              customers={customers}
              currentRole={currentRole}
              onRecordPayment={(inv) => {
                setTargetInvoiceForPayment(inv);
                setPaymentFormOpen(true);
              }}
              onViewInvoice={(inv) => {
                setSelectedInvoice(inv);
                setInvoiceDetailOpen(true);
              }}
            />
          )}

          {/* TAB 9: REPORTS & LEDGERS (MODULE I) */}
          {activeTab === 'analytics' && (
            <ReportsView
              ledger={ledger}
              customers={customers}
              invoices={invoices}
              challans={challans}
              reports={reports}
              payments={payments}
              projects={projects}
              currentRole={currentRole}
              selectedCustomerForLedger={selectedCustomerForLedger}
            />
          )}

          {/* TAB 10: GST SUMMARY */}
          {activeTab === 'gst' && (
            <GstView invoices={invoices} company={company} />
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView
              company={company}
              numbering={numbering}
              currentRole={currentRole}
              onSaveCompany={(comp) => {
                setCompany(comp);
                storageService.saveCompany(comp);
              }}
              onSaveNumbering={(num) => {
                setNumbering(num);
                storageService.saveNumbering(num);
              }}
              onResetAllData={handleResetData}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />
          )}
        </main>
      </div>

      {/* ALL SYSTEM MODALS */}

      {/* Challan Form Modal */}
      <ChallanFormModal
        isOpen={challanFormOpen}
        onClose={() => setChallanFormOpen(false)}
        challanToEdit={challanToEdit}
        customers={customers}
        projects={projects}
        currentRole={currentRole}
        onSave={handleSaveChallan}
      />

      {/* Challan Detail / A4 Preview Modal */}
      <ChallanDetailModal
        isOpen={challanDetailOpen}
        onClose={() => setChallanDetailOpen(false)}
        challan={selectedChallan}
        company={company}
        currentRole={currentRole}
        onUpdateStatus={handleUpdateChallanStatus}
        onCreateServiceBill={handleConvertChallanToInvoice}
        onCreateServiceReport={handleConvertChallanToReport}
      />

      {/* Service Report Form Modal */}
      <ServiceReportFormModal
        isOpen={reportFormOpen}
        onClose={() => {
          setReportFormOpen(false);
          setPrefilledChallanForReport(null);
        }}
        reportToEdit={reportToEdit}
        customers={customers}
        projects={projects}
        challans={challans}
        prefilledChallan={prefilledChallanForReport}
        currentRole={currentRole}
        onSave={handleSaveReport}
      />

      {/* Service Report Detail Modal */}
      <ServiceReportDetailModal
        isOpen={reportDetailOpen}
        onClose={() => setReportDetailOpen(false)}
        report={selectedReport}
        company={company}
        currentRole={currentRole}
        onCreateServiceBill={handleConvertReportToInvoice}
      />

      {/* Service Invoice Form Modal */}
      <InvoiceFormModal
        isOpen={invoiceFormOpen}
        onClose={() => {
          setInvoiceFormOpen(false);
          setPrefilledChallanForInvoice(null);
          setPrefilledReportForInvoice(null);
        }}
        invoiceToEdit={invoiceToEdit}
        prefilledChallan={prefilledChallanForInvoice}
        prefilledReport={prefilledReportForInvoice}
        company={company}
        customers={customers}
        projects={projects}
        challans={challans}
        reports={reports}
        currentRole={currentRole}
        onSave={handleSaveInvoice}
      />

      {/* Service Invoice Detail / A4 Preview Modal */}
      <InvoiceDetailModal
        isOpen={invoiceDetailOpen}
        onClose={() => setInvoiceDetailOpen(false)}
        invoice={selectedInvoice}
        company={company}
        currentRole={currentRole}
        onRecordPayment={(inv) => {
          setTargetInvoiceForPayment(inv);
          setPaymentFormOpen(true);
        }}
        onCancelInvoice={handleCancelInvoice}
      />

      {/* Payment Recording Form Modal */}
      <PaymentFormModal
        isOpen={paymentFormOpen}
        onClose={() => setPaymentFormOpen(false)}
        targetInvoice={targetInvoiceForPayment}
        invoices={invoices}
        customers={customers}
        currentRole={currentRole}
        onSavePayment={handleSavePayment}
      />

      {/* Payment Receipt Voucher Modal */}
      <PaymentReceiptModal
        isOpen={paymentReceiptOpen}
        onClose={() => setPaymentReceiptOpen(false)}
        receipt={selectedReceipt}
        company={company}
      />
    </div>
  );
};

export default App;
