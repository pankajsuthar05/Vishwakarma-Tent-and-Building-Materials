'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Printer, Search, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function InvoicePage() {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Send Feature State
    const [sendMethod, setSendMethod] = useState('');
    const [sendInput, setSendInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const generatePDF = async () => {
        // Find the invoice content div
        const element = document.getElementById('printable-invoice');
        if (!element) {
            console.error("Invoice element not found");
            alert("Error: Invoice content not found. Please select a customer first.");
            return false;
        }

        if (!invoiceData || !invoiceData.customerName) {
            console.error("Invoice data not available");
            alert("Error: Invoice data not available. Please select a customer first.");
            return false;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    // Fix lab() color issues by forcing standard colors
                    const clonedInvoice = clonedDoc.getElementById('printable-invoice');
                    if (clonedInvoice) {
                        // Override any problematic color styles
                        const allElements = clonedInvoice.getElementsByTagName('*');
                        for (let i = 0; i < allElements.length; i++) {
                            const el = allElements[i] as HTMLElement;
                            const computedStyle = window.getComputedStyle(el);

                            // Replace lab() colors with standard colors
                            if (computedStyle.color && computedStyle.color.includes('lab')) {
                                el.style.color = '#000000';
                            }
                            if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('lab')) {
                                el.style.backgroundColor = '#ffffff';
                            }
                        }
                    }
                }
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const fileName = `Invoice_${invoiceData.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            return true;
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    };

    const handleSend = async () => {
        if (!invoiceData) return;
        setIsSending(true);




        // 2. Prepare Detailed Invoice Message
        const invoiceNumber = invoiceData.customerId?.slice(0, 8).toUpperCase();
        const invoiceDate = new Date().toLocaleDateString('en-IN');

        // Build itemized list
        let itemsList = '';
        if (invoiceData.ledgerRows && invoiceData.ledgerRows.length > 0) {
            invoiceData.ledgerRows.forEach((row: any, index: number) => {
                const end = row.endDate ? new Date(row.endDate) : new Date();
                const start = new Date(row.startDate);
                const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const total = diffDays * row.totalPerDayRent;

                itemsList += `${row.itemName} (${row.itemType})\n`;
                itemsList += `   Qty: ${row.quantity} pcs | Days: ${diffDays} | Rate: ₹${row.totalPerDayRent}/day\n`;
                itemsList += `   Amount: ₹${total.toLocaleString()}\n\n`;
            });
        } else {
            itemsList = 'No items in this invoice.\n\n';
        }

        const messageBody = `Hello ${invoiceData.customerName}, here is your invoice details.

Invoice #: ${invoiceNumber}
Date: ${invoiceDate}

Total Amount: ₹${invoiceData.grandTotal?.toLocaleString()}

*ITEMS & CHARGES:*
${itemsList}
Thank you from Shri Vishwakarma Building Material Company
Rawatsar Road, Jakharawali
Phone: +91 9414876514, 7742881605, 9784883908

Don't forget to visit again, Your believe Our Strength.`;

        // 3. Open App
        setTimeout(() => {
            if (sendMethod === 'Message') {
                window.open(`sms:${sendInput}?body=${encodeURIComponent(messageBody)}`, '_blank');
            } else if (sendMethod === 'Email') {
                window.open(`mailto:${sendInput}?subject=Invoice #${invoiceNumber} - ${invoiceData?.customerName}&body=${encodeURIComponent(messageBody)}`, '_blank');
            } else if (sendMethod === 'Whatsapp') {
                const cleanNumber = sendInput.replace(/\D/g, '');
                window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageBody)}`, '_blank');
            }


            alert(`Invoice sent successfully!\n\nA detailed invoice message has been prepared in ${sendMethod}.`);
            setIsSending(false);
            setSendMethod('');
            setSendInput('');
        }, 500);
    };

    // Kept for alignment
    const noOp = () => { };

    useEffect(() => {
        if (!user) return;
        const fetchCustomers = async () => {
            // LOCAL FALLBACK
            try {
                const data = JSON.parse(localStorage.getItem('tent_ledger_demo_data') || '{"users":{}}');
                const customersData = data.users?.[user.uid]?.customers || {};
                const customersArray = Object.values(customersData).map((c: any) => ({
                    ...c,
                    id: c.customerId,
                    // Fix date parsing for demo data (strings) vs firestore timestamps
                    createdAt: { toDate: () => new Date(c.createdAt) }
                }));
                setCustomers(customersArray);
            } catch (e) { console.error(e); }

            /* FIREBASE CODE
            const q = query(collection(db, 'users', user.uid, 'customers'));
            const snapshot = await getDocs(q);
            setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            */
        };
        fetchCustomers();
    }, [user]);

    useEffect(() => {
        if (selectedCustomerId) {
            const customer = customers.find(c => c.id === selectedCustomerId);
            setInvoiceData(customer);
        } else {
            setInvoiceData(null);
        }
    }, [selectedCustomerId, customers]);

    // Filter customers based on search query
    const filteredCustomers = customers.filter(c =>
        c.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between no-print gap-4">
                <h2 className="text-3xl font-bold text-white">Generate Invoice</h2>

                <div className="flex items-center gap-3 ml-auto">
                    {/* Send Options */}
                    <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700">
                        <select
                            value={sendMethod}
                            aria-label="Select Send Method"
                            onChange={(e) => {
                                setSendMethod(e.target.value);
                                // Pre-fill based on customer data if available
                                if (invoiceData) {
                                    if (e.target.value === 'Email') setSendInput(invoiceData.email || '');
                                    else if (e.target.value === 'Message' || e.target.value === 'Whatsapp') setSendInput(invoiceData.phone || '');
                                    else setSendInput('');
                                }
                            }}
                            className="bg-transparent text-sm text-white px-2 py-1.5 outline-none cursor-pointer [&>option]:bg-slate-900"
                        >
                            <option value="">Send via...</option>
                            <option value="Message">Message</option>
                            <option value="Email">Email</option>
                            <option value="Whatsapp">Whatsapp</option>
                        </select>

                        {sendMethod && (
                            <>
                                <div className="w-px h-6 bg-slate-700 mx-1"></div>
                                <input
                                    type={sendMethod === 'Email' ? 'email' : 'text'}
                                    placeholder={
                                        sendMethod === 'Email' ? 'Enter Email...' :
                                            sendMethod === 'Whatsapp' ? 'Enter WhatsApp No...' : 'Enter Phone No...'
                                    }
                                    value={sendInput}
                                    onChange={(e) => setSendInput(e.target.value)}
                                    className="bg-slate-800/50 border border-slate-600 rounded px-3 py-1 text-sm text-white w-48 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSend}
                                    disabled={!sendInput || isSending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-8 px-3"
                                >
                                    {isSending ? 'Sending...' : <Send className="w-3 h-3" />}
                                </Button>
                            </>
                        )}
                    </div>

                    <Button onClick={() => window.print()} disabled={!invoiceData} variant="outline" className="border-slate-700 text-slate-200">
                        <Printer className="w-4 h-4 mr-2" /> Print Invoice
                    </Button>
                </div>
            </div>

            <Card className="p-6 glass border-slate-800 no-print">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Search Customer</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Type to filter..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Select Customer</label>
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- {filteredCustomers.length === 0 ? 'No customers found' : 'Choose a Customer'} --</option>
                            {filteredCustomers.map(c => (
                                <option key={c.id} value={c.id}>{c.customerName} ({c.createdAt?.toDate().toLocaleDateString()})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {invoiceData && (
                <div id="printable-invoice" className="bg-white text-black p-12 rounded-lg shadow-xl print:shadow-none print:w-full">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
                            <p className="text-slate-500">#{invoiceData.customerId?.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-xl mb-1">Shri Vishwakarma Building Material Company</h3>
                            <p className="text-sm text-slate-600">Rawatsar Road, Jakharawali</p>
                            <p className="text-sm text-slate-600">Phone: +91 9414876514, 7742881605, 9784883908</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div>
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Bill To:</h4>
                            <p className="font-bold text-lg">{invoiceData.customerName}</p>
                            <p className="text-slate-700">{invoiceData.address || 'No Address Provided'}</p>
                            <p className="text-slate-700">{invoiceData.phone}</p>
                        </div>
                        <div className="text-right">
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Date:</h4>
                            <p className="font-bold">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <table className="w-full mb-12 table-fixed">
                        <thead>
                            <tr className="border-b-2 border-slate-900 text-left">
                                <th className="py-3 px-4 font-bold uppercase text-xs w-1/2">Description</th>
                                <th className="py-3 px-4 font-bold uppercase text-xs w-[15%]">Days</th>
                                <th className="py-3 px-4 font-bold uppercase text-xs text-right w-[17.5%]">Rate</th>
                                <th className="py-3 px-4 font-bold uppercase text-xs text-right w-[17.5%]">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {invoiceData.ledgerRows?.map((row: any, i: number) => {
                                // Recalculate for invoice view consistency
                                const end = row.endDate ? new Date(row.endDate) : new Date();
                                const start = new Date(row.startDate);
                                const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                const total = diffDays * row.totalPerDayRent;

                                return (
                                    <tr key={i}>
                                        <td className="py-4 px-4">
                                            <p className="font-bold text-sm">{row.itemName}</p>
                                            <p className="text-xs text-slate-500">{row.itemType} • {row.quantity} pcs</p>
                                        </td>
                                        <td className="py-4 px-4 text-sm">{diffDays}</td>
                                        <td className="py-4 px-4 text-sm text-right">₹{row.totalPerDayRent.toLocaleString()}</td>
                                        <td className="py-4 px-4 text-sm font-bold text-right">₹{total.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex justify-end border-t-2 border-slate-900 pt-4">
                        <div className="text-right">
                            <span className="text-sm font-bold uppercase text-slate-500 mr-8">Total</span>
                            <span className="text-3xl font-bold">₹{invoiceData.grandTotal?.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-16 text-center text-sm text-slate-500 border-t border-slate-200 pt-8 print:hidden">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
