import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Upload, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { format } from 'date-fns';

// --- MOCK DATA AND TYPES ---

// Defines the structure for invoice data fetched from the backend
interface InvoiceData {
  month: string; // e.g., "May 2025"
  offerwallPayout: number;
  deductions: number;
}

// Defines the structure for the status of an invoice
type InvoiceStatus = 'open' | 'validation' | 'rejected' | 'approved' | 'paid';

// Mock data for available invoices
const invoicesFromDatabase: InvoiceData[] = [
  { month: "May 2025", offerwallPayout: 13131.69, deductions: 1298.18 },
  { month: "April 2025", offerwallPayout: 12131.59, deductions: 2298.18 },
];

// --- HELPER COMPONENTS ---

// Navbar placeholder
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

// Invoice Status Timeline Component
const InvoiceStatusTracker = ({ currentStatus }: { currentStatus: InvoiceStatus }) => {
    const statusSteps: { id: InvoiceStatus; label: string; description: string }[] = [
        { id: "open", label: "Open", description: "This invoice is ready for you to upload your document." },
        { id: "validation", label: "Validation", description: "Your submitted invoice is under review." },
        { id: "rejected", label: "Rejected", description: "Your invoice was rejected. Please check notes and re-submit." },
        { id: "approved", label: "Approved", description: "Invoice approved and is awaiting payment." },
        { id: "paid", label: "Paid", description: "Payment has been processed successfully." }
    ];

    const currentStepIndex = statusSteps.findIndex(step => step.id === currentStatus);

    return (
        <div className="space-y-0">
            {statusSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                let dotClass = "border-gray-300 bg-white";
                let lineClass = "bg-gray-300";
                let textClass = "text-gray-500";

                if (isCompleted) {
                    dotClass = "bg-purple-600 border-purple-600";
                    lineClass = "bg-purple-600";
                    textClass = "text-gray-800";
                } else if (isCurrent) {
                    dotClass = "bg-purple-600 border-purple-600 ring-4 ring-purple-200";
                    lineClass = "bg-gray-300";
                    textClass = "text-purple-700 font-semibold";
                }

                return (
                    <div key={step.id} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                            <div className={`w-4 h-4 rounded-full border-2 ${dotClass} transition-all`}></div>
                            {index < statusSteps.length - 1 && <div className={`w-0.5 h-10 ${lineClass} transition-all`}></div>}
                        </div>
                        <div className="pb-8">
                            <p className={`text-sm ${textClass}`}>{step.label}</p>
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
    // State for data and UI control
    const [selectedMonth, setSelectedMonth] = useState(new Date(2025, 4)); // Default to May 2025
    const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);
    const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('open');
    
    // State for modals
    const [modalStep, setModalStep] = useState(0); // 0: closed, 1: requirements, 2: upload, 3: final details

    // State for invoice upload process
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [dueDate, setDueDate] = useState('');

    // Effect to find and set the current invoice data when the month changes
    useEffect(() => {
        const monthStr = format(selectedMonth, "MMMM yyyy");
        const foundInvoice = invoicesFromDatabase.find(inv => inv.month === monthStr) || null;
        setCurrentInvoice(foundInvoice);
        // Reset status when changing months for demo purposes
        setInvoiceStatus('open'); 
    }, [selectedMonth]);

    // Calculations for invoice breakdown
    const billableAmount = currentInvoice ? currentInvoice.offerwallPayout - currentInvoice.deductions : 0;
    const gstAmount = billableAmount * 0.18;
    const totalPayout = billableAmount + gstAmount;

    // File upload handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Only PDF files are accepted.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('File size cannot exceed 10MB.');
                return;
            }
            setUploadedFile(file);
        }
    };

    // Final submission handler
    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoiceNumber || !dueDate) {
            alert('Please fill in both Invoice Number and Due Date.');
            return;
        }
        console.log({
            month: currentInvoice?.month,
            invoiceNumber,
            dueDate,
            file: uploadedFile?.name
        });
        setInvoiceStatus('validation');
        setModalStep(0); // Close modal
    };
    
    const renderModalContent = () => {
        switch (modalStep) {
            case 1: // Requirements
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
                                    <hr className="my-2"/>
                                    <p className="font-semibold">From:</p>
                                    <p>Publisher Details...</p>
                                    <hr className="my-2"/>
                                    <p className="font-semibold">To:</p>
                                    <p>Mobtions Details...</p>
                                    <hr className="my-2"/>
                                    <p className="font-semibold">Description:</p>
                                    <p>Mobile App Monetization Services for {format(selectedMonth, "MMMM yyyy")}</p>
                                    <hr className="my-2"/>
                                    <p>Amount: ₹{billableAmount.toFixed(2)}</p>
                                    <p>GST @ 18%: ₹{gstAmount.toFixed(2)}</p>
                                    <p className="font-bold">Total: ₹{totalPayout.toFixed(2)}</p>
                                </div>
                                <div className="text-center mt-4">
                                    <a href="#" className="text-purple-600 text-sm hover:underline flex items-center justify-center gap-2"><Download size={14}/>Download Invoice Template</a>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 p-4 bg-gray-50 border-t">
                            <button onClick={() => setModalStep(0)} className="px-6 py-2 bg-gray-200 rounded-md text-sm font-semibold">Cancel</button>
                            <button onClick={() => setModalStep(2)} className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold">Next</button>
                        </div>
                    </div>
                );
            case 2: // File Upload
                return (
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <h2 className="text-xl font-bold p-6 border-b">Upload Your Invoice</h2>
                        <div className="p-6">
                            <div className="text-center mb-4">
                                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">Please upload your invoice in PDF format for {format(selectedMonth, "MMMM yyyy")}</p>
                            </div>
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileText className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-purple-600">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF files only, up to 10MB</p>
                                </div>
                                <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                            </label>
                            {uploadedFile && <p className="text-center text-sm text-green-600 mt-2">Selected: {uploadedFile.name}</p>}
                            <div className="mt-4 bg-gray-100 p-4 rounded-lg text-sm space-y-2">
                                <h3 className="font-semibold mb-2">Invoice Summary</h3>
                                <div className="flex justify-between"><span>Month:</span><span>{format(selectedMonth, "MMMM yyyy")}</span></div>
                                <div className="flex justify-between"><span>Amount:</span><span>₹{totalPayout.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                                <div className="flex justify-between"><span>Status:</span><span className="font-semibold text-purple-600">Ready to Submit</span></div>
                            </div>
                        </div>
                        <div className="flex justify-between p-4 bg-gray-50 border-t">
                            <button onClick={() => setModalStep(1)} className="px-6 py-2 bg-gray-200 rounded-md text-sm font-semibold">Back</button>
                            <div>
                                <button onClick={() => setModalStep(0)} className="px-6 py-2 bg-gray-200 rounded-md text-sm font-semibold mr-2">Cancel</button>
                                <button onClick={() => setModalStep(3)} disabled={!uploadedFile} className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold disabled:bg-gray-300">Next</button>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Final Details
                return (
                    <form onSubmit={handleFinalSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold p-6 border-b">Final Details</h2>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="invoice-number" className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                <input type="text" id="invoice-number" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input type="date" id="due-date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div className="flex justify-between p-4 bg-gray-50 border-t">
                            <button type="button" onClick={() => setModalStep(2)} className="px-6 py-2 bg-gray-200 rounded-md text-sm font-semibold">Back</button>
                            <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold">Submit Invoice</button>
                        </div>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
            <LoggedInNavbar title="Invoices" />

            {/* Month Selector */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                <span>Showing invoice for</span>
                <select 
                    value={format(selectedMonth, 'yyyy-MM')}
                    onChange={e => setSelectedMonth(new Date(e.target.value + '-02'))} // Use day 2 to avoid timezone issues
                    className="bg-transparent font-semibold text-purple-600 focus:outline-none"
                >
                    {invoicesFromDatabase.map(inv => (
                        <option key={inv.month} value={format(new Date(inv.month), 'yyyy-MM')}>{inv.month}</option>
                    ))}
                    <option value="2025-06">June 2025</option> {/* Example of month with no data */}
                </select>
                {currentInvoice ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />}
            </div>

            {currentInvoice ? (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Invoice Breakdown */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Invoice Breakup</h3>
                            <button onClick={() => setModalStep(1)} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700">Upload Invoice</button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Offerwall Payout</span><span>₹{currentInvoice.offerwallPayout.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Deductions</span><span className="text-red-500">- ₹{currentInvoice.deductions.toLocaleString('en-IN')}</span></div>
                        </div>
                        <hr className="my-3"/>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Billable Amount</span><span>₹{billableAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">GST @ 18%</span><span>₹{gstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                        </div>
                        <hr className="my-3"/>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xl font-bold">Payout Amount</span>
                            <span className="text-2xl font-bold text-green-600">₹{totalPayout.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>

                    {/* Invoice Status */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Invoice Status</h3>
                        <InvoiceStatusTracker currentStatus={invoiceStatus} />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-4 text-xl font-semibold">No Invoice Available</h3>
                    <p className="mt-2 text-sm text-gray-500">No invoice data was found for {format(selectedMonth, "MMMM yyyy")}.</p>
                </div>
            )}
            
            {/* Help Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold">Need help in creating invoices?</h3>
                <p className="text-sm text-gray-600 mt-1">Please download the template below, fill in your details, and then convert it to PDF to upload as your invoice. <a href="#" className="text-purple-600 hover:underline">Download an invoice template here.</a></p>
            </div>

            {/* Modal Container */}
            {modalStep > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setModalStep(0)}>
                    <div onClick={e => e.stopPropagation()}>
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesPage;

/*
* =================================================================
* == COMPONENT, STATE, AND INTEGRATION DOCUMENTATION
* =================================================================
*
* === COMPONENT: InvoicesPage ===
* - Purpose: This component allows users to view their monthly invoice breakdowns,
* track the status of their invoice, and upload their own invoice document through
* a guided, multi-step process.
*
* === STATE VARIABLES ===
*
* - `selectedMonth` (Date):
* - Stores the currently selected month and year for which to display an invoice.
* - For backend integration: When this date changes, you should query your
* `/api/invoices` endpoint with the selected month and year to get the relevant data.
*
* - `currentInvoice` (InvoiceData | null):
* - Holds the fetched invoice data for the `selectedMonth`. It's null if no data exists.
*
* - `invoiceStatus` (InvoiceStatus):
* - Tracks the current stage of the invoice process ('open', 'validation', etc.).
* - For backend integration: This status should be fetched along with the invoice data.
* After an invoice is submitted, its status should be updated to 'validation' on the backend.
*
* - `modalStep` (number):
* - Controls the multi-step modal flow. 0 is closed, 1 is the requirements view,
* 2 is the file upload screen, and 3 is the final details form.
*
* - `uploadedFile` (File | null):
* - Stores the user-selected PDF file object before it's submitted.
* - For backend integration: This file object should be sent to your API,
* likely using multipart/form-data, to be stored on your server or a cloud storage service.
*
* - `invoiceNumber` (string):
* - Stores the invoice number entered by the user in the final step.
* - For backend integration: This should be sent along with the uploaded file data.
*
* - `dueDate` (string):
* - Stores the due date entered by the user in the final step.
* - For backend integration: This should also be sent with the final submission.
*
* === BACKEND INTEGRATION NOTES ===
*
* 1.  **Fetch Invoice Data**: Create an endpoint like `/api/invoices?month=YYYY-MM`.
* - On component load and when `selectedMonth` changes, call this endpoint.
* - The response should contain the `InvoiceData` and the current `invoiceStatus`.
* - If no invoice exists for that month, the API should return a 404 or an empty response,
* which will set `currentInvoice` to `null` and show the "No Invoice" UI.
*
* 2.  **Submit Invoice**: Create an endpoint like `POST /api/invoices/upload`.
* - This endpoint should accept multipart/form-data.
* - The request body should include the `uploadedFile`, `invoiceNumber`, `dueDate`,
* and the relevant `month`.
* - The backend should handle storing the file, saving the metadata to the database,
* and updating the invoice status to 'validation'.
*
* 3.  **Invoice Template**: The "Download an invoice template" link should point to a static
* file (e.g., a .docx or .pdf template) hosted on your server or CDN.
*/
