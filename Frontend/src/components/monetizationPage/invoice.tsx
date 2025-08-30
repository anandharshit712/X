import React, { useState, useEffect } from 'react';
import { Calendar, Upload, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// --- DATA AND TYPES ---

interface InvoiceData {
  month: string; // e.g., "May 2025"
  offerwallPayout: number;
  deductions: number;
}

type InvoiceStatus = 'open' | 'validation' | 'rejected' | 'approved' | 'paid';

// --- DEMO DATA (edit freely) ---

/** Key is 'yyyy-MM' */
const DEMO_INVOICES: Record<
  string,
  { data: InvoiceData; status: InvoiceStatus; rejectionReason?: string } // Added optional rejectionReason
> = {
  '2025-01': {
    data: { month: 'January 2025', offerwallPayout: 82500, deductions: 2500 },
    status: 'open',
  },
  '2025-02': {
    data: { month: 'February 2025', offerwallPayout: 91000, deductions: 3000 },
    status: 'validation',
  },
  '2025-03': {
    data: { month: 'March 2025', offerwallPayout: 102500, deductions: 4500 },
    status: 'rejected',
    // Added a reason for rejection to simulate an admin message
    rejectionReason: 'Incorrect GST amount mentioned. Please revise and resubmit.',
  },
  '2025-04': {
    data: { month: 'April 2025', offerwallPayout: 98000, deductions: 5000 },
    status: 'paid',
  },
  '2025-05': {
    data: { month: 'May 2025', offerwallPayout: 150000, deductions: 12000 },
    status: 'approved',
  },
  '2025-06': {
    data: { month: 'June 2025', offerwallPayout: 0, deductions: 0 },
    status: 'open', // No data → will show "No Invoice Available"
  },
};

const DEMO_MONTH_KEYS = Object.keys(DEMO_INVOICES).sort(); // ['2025-01', '2025-02', ...]

// --- HELPER COMPONENTS ---

const LoggedInNavbar = ({ title }: { title: string }) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
        JA
      </div>
    </div>
  </div>
);

// --- UPDATED INVOICE STATUS TRACKER ---
const InvoiceStatusTracker = ({ currentStatus, rejectionReason }: { currentStatus: InvoiceStatus; rejectionReason?: string }) => {
  // Define the visual steps of the timeline.
  // The third step is now dynamic: it shows "Rejected" or "Approved" based on the current status.
  const statusSteps = [
    { id: 'open', label: 'Open', description: 'This invoice is ready for you to upload your document.' },
    { id: 'validation', label: 'Validation', description: 'Your submitted invoice is under review.' },
    // Conditionally add the 'rejected' or 'approved' step.
    ...(currentStatus === 'rejected'
      ? [{
          id: 'rejected',
          label: 'Rejected',
          description: rejectionReason || 'Your invoice was rejected. Please check notes and re-submit.',
        }]
      : [{
          id: 'approved',
          label: 'Approved',
          description: 'Invoice approved and is awaiting payment.',
        }]),
    { id: 'paid', label: 'Paid', description: 'Payment has been processed successfully.' },
  ];

  // To determine which step is 'current', we map 'rejected' to the same timeline position as 'approved'.
  // This ensures the timeline progresses visually in a linear fashion.
  const statusOrderForIndexing: (InvoiceStatus | 'approved')[] = ['open', 'validation', 'approved', 'paid'];
  const effectiveStatus = currentStatus === 'rejected' ? 'approved' : currentStatus;
  const currentStepIndex = statusOrderForIndexing.indexOf(effectiveStatus);

  return (
    <div className="space-y-0">
      {statusSteps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        // Determine styling based on the step's status (completed, current, pending, or rejected).
        let dotClass = 'border-gray-300 bg-white';
        let lineClass = 'bg-gray-300';
        let textClass = 'text-gray-500';

        if (step.id === 'rejected' && isCurrent) {
          // Special styling for the 'rejected' state to make it stand out.
          dotClass = 'bg-red-500 border-red-500 ring-4 ring-red-200';
          lineClass = 'bg-gray-300'; // Line to next step is not colored.
          textClass = 'text-red-600 font-semibold';
        } else if (isCompleted) {
          // Styling for completed steps.
          dotClass = 'bg-purple-600 border-purple-600';
          lineClass = 'bg-purple-600';
          textClass = 'text-gray-800';
        } else if (isCurrent) {
          // Styling for the current, non-rejected step.
          dotClass = 'bg-purple-600 border-purple-600 ring-4 ring-purple-200';
          lineClass = 'bg-gray-300';
          textClass = 'text-purple-700 font-semibold';
        }

        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              {/* The status dot */}
              <div className={`w-4 h-4 rounded-full border-2 ${dotClass} transition-all`}></div>
              {/* The connecting line */}
              {index < statusSteps.length - 1 && <div className={`w-0.5 h-10 ${lineClass} transition-all`}></div>}
            </div>
            <div className="pb-8">
              <p className={`text-sm ${textClass}`}>{step.label}</p>
              {/* Show description only for the current step */}
              {isCurrent && <p className="text-xs text-gray-500 mt-1">{step.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};


// --- MAIN COMPONENT ---

const InvoicesPage = () => {
  const [selectedMonthKey, setSelectedMonthKey] = useState('2025-05'); // default to May 2025
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('open');
  const [rejectionReason, setRejectionReason] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  // Modal state
  const [modalStep, setModalStep] = useState(0); // 0: closed, 1: requirements, 2: upload, 3: final details

  // Upload flow state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Derive a Date from selectedMonthKey for formatting
  const selectedMonthDate = new Date(`${selectedMonthKey}-02`); // day 2 to avoid TZ issues
  const monthLabel = format(selectedMonthDate, 'MMMM yyyy');

  // DEMO: Load from local dataset instead of calling API
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const payload = DEMO_INVOICES[selectedMonthKey];
      
      // Reset rejection reason on each month change
      setRejectionReason(undefined);

      // Treat zeroed data as "no invoice"
      if (!payload || (payload.data.offerwallPayout === 0 && payload.data.deductions === 0)) {
        setCurrentInvoice(null);
        setInvoiceStatus(payload?.status ?? 'open');
        setLoading(false);
        return;
      }

      setCurrentInvoice({
        ...payload.data,
        month: monthLabel,
      });
      setInvoiceStatus(payload.status);
      
      // If the invoice is rejected, set the reason to pass to the tracker component
      if (payload.status === 'rejected') {
        setRejectionReason(payload.rejectionReason);
      }
      
      setLoading(false);
    }, 300); // small delay for realism

    return () => clearTimeout(t);
  }, [selectedMonthKey, monthLabel]);

  // Calculations
  const billableAmount = currentInvoice ? currentInvoice.offerwallPayout - currentInvoice.deductions : 0;
  const gstAmount = billableAmount * 0.18;
  const totalPayout = billableAmount + gstAmount;

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are accepted.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size cannot exceed 10MB.');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile || !invoiceNumber || !dueDate) {
      alert('Please fill in all fields and upload the invoice.');
      return;
    }
    // DEMO: Pretend upload succeeded
    setInvoiceStatus('validation');
    setModalStep(0);
    // If you later wire the backend, call your uploadInvoice(formData) here.
  };

  if (loading) {
    return <div className="flex-1 p-8 bg-gray-50 min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1 p-8 bg-gray-50 min-h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <LoggedInNavbar title="Invoices" />

      {/* Month Selector */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <span>Showing invoice for</span>
        <select
          value={selectedMonthKey}
          onChange={e => setSelectedMonthKey(e.target.value)}
          className="bg-transparent font-semibold text-purple-600 focus:outline-none"
        >
          {DEMO_MONTH_KEYS.map(key => (
            <option key={key} value={key}>
              {format(new Date(`${key}-02`), 'MMMM yyyy')}
            </option>
          ))}
        </select>
        {currentInvoice ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <AlertCircle size={16} className="text-red-500" />
        )}
      </div>

      {currentInvoice ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Invoice Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invoice Breakup</h3>
              <button
                onClick={() => setModalStep(1)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700"
              >
                Upload Invoice
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Offerwall Payout</span>
                <span>₹{currentInvoice.offerwallPayout.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deductions</span>
                <span className="text-red-500">- ₹{currentInvoice.deductions.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <hr className="my-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Billable Amount</span>
                <span>₹{billableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST @ 18%</span>
                <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xl font-bold">Payout Amount</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Invoice Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Status</h3>
            <InvoiceStatusTracker currentStatus={invoiceStatus} rejectionReason={rejectionReason} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-xl font-semibold">No Invoice Available</h3>
          <p className="mt-2 text-sm text-gray-500">No invoice data was found for {monthLabel}.</p>
          <button
            onClick={() => setModalStep(1)}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700"
          >
            Upload Invoice
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold">Need help in creating invoices?</h3>
        <p className="text-sm text-gray-600 mt-1">
          Please download the template below, fill in your details, and then convert it to PDF to upload as your
          invoice.{' '}
          <a href="#" className="text-purple-600 hover:underline">
            Download an invoice template here.
          </a>
        </p>
      </div>

      {/* Modal Container */}
      {modalStep > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setModalStep(0)}
        >
          <div onClick={e => e.stopPropagation()}>{renderModalContent()}</div>
        </div>
      )}
    </div>
  );

  // --- Modal content (same as yours, uses derived monthLabel & totals) ---
  function renderModalContent() {
    switch (modalStep) {
      case 1:
        return (
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
            <h2 className="text-xl font-bold p-6 border-b">Upload an Invoice</h2>
            <div className="flex">
              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                <h3 className="font-semibold text-gray-700">Things to consider while invoice creation</h3>
                <ul className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                  <li>"Tax Invoice" needed to be mentioned in the Invoice to be created</li>
                  <li>Publisher Name, Address, Email, PAN Number and GST number (if applicable)</li>
                  <li>Invoice Date and Number</li>
                  <li>Mobtions's Details (Complete Name, Address, GST Number)</li>
                  <li>Description along with Month of invoice</li>
                  <li>Payout (after deducting invalid traffic)</li>
                  <li>HSN/SAC Code</li>
                  <li>GST Amount (if applicable)</li>
                  <li>Total Amount</li>
                  <li>Publisher bank account details</li>
                  <li>Place of Supply : Karnataka</li>
                  <li>Signatory Name and Signature</li>
                </ul>
              </div>
              <div className="w-80 bg-gray-50 p-6 border-l">
                <div className="border rounded-lg p-4 bg-white text-xs">
                  <p className="font-bold text-blue-600">TAX INVOICE</p>
                  <p>Invoice No: [Number]</p>
                  <p>Date: [Date]</p>
                  <hr className="my-2" />
                  <p className="font-semibold">From:</p>
                  <p>Publisher Details...</p>
                  <hr className="my-2" />
                  <p className="font-semibold">To:</p>
                  <p>Mobtions Details...</p>
                  <hr className="my-2" />
                  <p className="font-semibold">Description:</p>
                  <p>Mobile App Monetization Services for {monthLabel}</p>
                  <hr className="my-2" />
                  <p>Amount: ₹{billableAmount.toFixed(2)}</p>
                  <p>GST @ 18%: ₹{gstAmount.toFixed(2)}</p>
                  <p className="font-bold">Total: ₹{(billableAmount + gstAmount).toFixed(2)}</p>
                </div>
                <div className="text-center mt-4">
                  <a href="#" className="text-purple-600 text-sm hover:underline flex items-center justify-center gap-2">
                    <Download size={14} />
                    Download Invoice Template
                  </a>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 p-4 bg-gray-50 border-t">
              <button onClick={() => setModalStep(0)} className="px-6 py-2 bg-gray-200 rounded-md text-sm font-semibold">
                Cancel
              </button>
              <button
                onClick={() => setModalStep(2)}
                className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <h2 className="text-xl font-bold p-6 border-b">Upload Your Invoice</h2>
            <div className="p-6">
              <div className="text-center mb-4">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Please upload your invoice in PDF format for {monthLabel}</p>
              </div>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF files only, up to 10MB</p>
                </div>
                <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>
              {uploadedFile && <p className="text-center text-sm text-green-600 mt-2">Selected: {uploadedFile.name}</p>}
              <div className="mt-4 bg-gray-100 p-4 rounded-lg text-sm space-y-2">
                <h3 className="font-semibold mb-2">Invoice Summary</h3>
                <div className="flex justify-between">
                  <span>Month:</span>
                  <span>{monthLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>₹{(billableAmount + gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-purple-600">Ready to Submit</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between p-4 bg-gray-50 border-t">
              <button onClick={() => setModalStep(1)} className="px-6 py-2 bg-gray-200 rounded-md text-sm font-semibold">
                Back
              </button>
              <div>
                <button onClick={() => setModalStep(0)} className="px-6 py-2 bg-gray-200 rounded-md text-sm font-semibold mr-2">
                  Cancel
                </button>
                <button
                  onClick={() => setModalStep(3)}
                  disabled={!uploadedFile}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <form onSubmit={handleFinalSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold p-6 border-b">Final Details</h2>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="invoice-number" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due-date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between p-4 bg-gray-50 border-t">
              <button type="button" onClick={() => setModalStep(2)} className="px-6 py-2 bg-gray-200 rounded-md text-sm font-semibold">
                Back
              </button>
              <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold">
                Submit Invoice
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  }
};

export default InvoicesPage;
