'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2, Save, Calculator } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface LedgerRow {
  id: string;
  startDate: string;
  endDate: string;
  itemName: string;
  itemType: 'Tent' | 'Catering' | 'House Building';
  itemStatus: 'Pending' | 'Take' | 'Get' | 'Clear';
  quantity: number;
  returnItems: number;
  perPieceRent: number;
  totalPerDayRent: number;
}

export default function LedgerPage() {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'UnPaid'>('UnPaid');
  const [rows, setRows] = useState<LedgerRow[]>([
    { id: uuidv4(), startDate: '', endDate: '', itemName: '', itemType: 'Tent', itemStatus: 'Pending', quantity: 0, returnItems: 0, perPieceRent: 0, totalPerDayRent: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  // Load record for editing if coming from History or Running page
  useEffect(() => {
    const editRecord = localStorage.getItem('tent_ledger_edit_record');
    if (editRecord) {
      try {
        const customerData = JSON.parse(editRecord);

        // Populate form fields
        setCustomerName(customerData.customerName || '');
        setAddress(customerData.address || '');
        setPhone(customerData.phone || '');
        setPaymentStatus(customerData.paymentStatus || 'UnPaid');

        // Populate ledger rows
        if (customerData.ledgerRows && customerData.ledgerRows.length > 0) {
          const loadedRows = customerData.ledgerRows.map((row: any) => ({
            ...row,
            itemStatus: row.itemStatus || 'Pending',
            returnItems: row.returnItems || 0
          }));
          setRows(loadedRows);
        }

        // Clear the edit record from localStorage
        localStorage.removeItem('tent_ledger_edit_record');
      } catch (e) {
        console.error('Error loading edit record:', e);
      }
    }
  }, []);

  const handleRowChange = (id: string, field: keyof LedgerRow, value: any) => {
    setRows(prev => prev.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        // Auto calculation
        if (field === 'quantity' || field === 'perPieceRent') {
          updated.totalPerDayRent = (Number(updated.quantity) || 0) * (Number(updated.perPieceRent) || 0);
        }
        return updated;
      }
      return row;
    }));
  };

  const addRow = () => {
    setRows([...rows, {
      id: uuidv4(),
      startDate: rows[rows.length - 1]?.startDate || '', // Copy previous date for convenience
      endDate: '',
      itemName: '',
      itemType: 'Tent',
      itemStatus: 'Pending',
      quantity: 0,
      returnItems: 0,
      perPieceRent: 0,
      totalPerDayRent: 0
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const calculateTotals = () => {
    let grandTotal = 0;
    const itemizedDetails = rows.map(row => {
      const start = new Date(row.startDate);
      const end = row.endDate ? new Date(row.endDate) : new Date(); // If running, calculate til today for view
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

      const total = diffDays * row.totalPerDayRent;
      if (!isNaN(total)) grandTotal += total;

      return { ...row, days: diffDays, rowTotal: total };
    });
    return { grandTotal, itemizedDetails };
  };

  const handleSave = async () => {
    if (!user || !customerName || !rows[0].startDate) {
      alert("Please fill in required fields (Customer Name, Start Date)");
      return;
    }
    setLoading(true);

    try {
      const customerId = uuidv4();

      // LOGIC: 
      // 1. If any row has no end date -> RUNNING
      // 2. If all rows have end dates:
      //    - If Paid -> COMPLETED
      //    - If UnPaid -> PENDING
      const hasOpenSession = rows.some(r => !r.endDate);
      let status = 'RUNNING';

      if (!hasOpenSession) {
        status = paymentStatus === 'Paid' ? 'COMPLETED' : 'PENDING';
      } else {
        status = 'RUNNING';
      }

      const { grandTotal } = calculateTotals();

      const customerData = {
        customerId,
        customerName,
        address,
        phone,
        paymentStatus,
        ledgerRows: rows,
        grandTotal,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const runningData = {
        id: customerId,
        customerName,
        startDate: rows[0].startDate,
        endDate: 'Running',
        grandTotal,
        status,
        paymentStatus
      };

      const historyData = {
        id: customerId,
        customerName,
        startDate: rows[0].startDate,
        endDate: rows[rows.length - 1].endDate || new Date().toISOString().split('T')[0],
        grandTotal,
        status,
        paymentStatus
      };

      // LOCAL STORAGE FALLBACK (Demo Mode)
      // Since Firebase might not be configured, we save to localStorage to verify functionality
      const currentData = JSON.parse(localStorage.getItem('tent_ledger_demo_data') || '{"users":{}}');
      const userData = currentData.users[user.uid] || { customers: {}, running: {}, history: {} };

      userData.customers[customerId] = customerData;

      if (status === 'RUNNING') {
        userData.running[customerId] = runningData;
      } else {
        userData.history[customerId] = historyData;
      }

      currentData.users[user.uid] = userData;
      localStorage.setItem('tent_ledger_demo_data', JSON.stringify(currentData));

      /* FIREBASE CODE (Commented out for unconfigured demo)
      // 1. Save to main customers collection
      const userRef = doc(db, 'users', user.uid);
      await setDoc(doc(collection(userRef, 'customers'), customerData.customerId), customerData);

      // 2. Save to running or history
      if (status === 'RUNNING') {
        await setDoc(doc(collection(userRef, 'running'), customerData.customerId), {
          customerName,
          startDate: rows[0].startDate,
          endDate: 'Running',
          grandTotal,
          status
        });
      } else {
        await setDoc(doc(collection(userRef, 'history'), customerData.customerId), {
          customerName,
          startDate: rows[0].startDate,
          endDate: rows[rows.length - 1].endDate,
          grandTotal,
          status
        });
      }
      */

      alert('Record saved successfully! (Stored locally in Demo Mode)');

      // Reset form
      setCustomerName('');
      setAddress('');
      setPhone('');
      setRows([{ id: uuidv4(), startDate: '', endDate: '', itemName: '', itemType: 'Tent', itemStatus: 'Pending', quantity: 0, returnItems: 0, perPieceRent: 0, totalPerDayRent: 0 }]);
      setPaymentStatus('UnPaid');

    } catch (error) {
      console.error(error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">New Ledger Entry</h2>
          <p className="text-slate-400">Create a new record for a customer.</p>
        </div>
        <Button onClick={handleSave} isLoading={loading} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0">
          <Save className="w-4 h-4 mr-2" /> Save Record
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 glass border-slate-800">
            <h3 className="text-lg font-medium text-white mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-semibold">Customer Name <span className="text-red-400">*</span></label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} className="bg-slate-900/50 border-slate-700 text-white" placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-semibold">Phone Number</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-slate-900/50 border-slate-700 text-white" placeholder="+91..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-slate-400 uppercase font-semibold">Address</label>
                <Input value={address} onChange={e => setAddress(e.target.value)} className="bg-slate-900/50 border-slate-700 text-white" placeholder="Full Address" />
              </div>
            </div>
          </Card>

          <Card className="p-6 glass border-slate-800 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Itemized Ledger</h3>
              <Button size="sm" onClick={addRow} variant="secondary" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 min-w-[180px]">Item</th>
                  <th className="p-4 min-w-[150px]">Type</th>
                  <th className="p-4 min-w-[150px]">Item Status</th>
                  <th className="p-4 min-w-[150px]">Start Date</th>
                  <th className="p-4 min-w-[150px]">End Date</th>
                  <th className="p-4 min-w-[100px]">Qty</th>
                  <th className="p-4 min-w-[120px]">Rent/Pc</th>
                  <th className="p-4 min-w-[120px]">Total/Day</th>
                  <th className="p-4 min-w-[120px]">Return Items</th>
                  <th className="p-4 min-w-[120px]">Pending Items</th>
                  <th className="p-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((row, index) => (
                  <tr key={row.id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <Input
                        value={row.itemName}
                        onChange={e => handleRowChange(row.id, 'itemName', e.target.value)}
                        className="h-10 bg-transparent border-slate-700 focus:bg-slate-900 text-white"
                        placeholder="Item Name"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={row.itemType}
                        onChange={e => handleRowChange(row.id, 'itemType', e.target.value)}
                        className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option>Tent</option>
                        <option>Catering</option>
                        <option>House Building</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={row.itemStatus}
                        onChange={e => handleRowChange(row.id, 'itemStatus', e.target.value)}
                        className={`h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600
                          ${row.itemStatus === 'Pending' ? 'text-yellow-400' : ''}
                          ${row.itemStatus === 'Take' ? 'text-blue-400' : ''}
                          ${row.itemStatus === 'Get' ? 'text-orange-400' : ''}
                          ${row.itemStatus === 'Clear' ? 'text-green-400' : ''}
                        `}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Take">Take</option>
                        <option value="Get">Get</option>
                        <option value="Clear">Clear</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <Input
                        type="date"
                        value={row.startDate}
                        onChange={e => handleRowChange(row.id, 'startDate', e.target.value)}
                        className="h-10 bg-transparent border-slate-700 focus:bg-slate-900 text-white"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="date"
                        value={row.endDate}
                        onChange={e => handleRowChange(row.id, 'endDate', e.target.value)}
                        className="h-10 bg-transparent border-slate-700 focus:bg-slate-900 text-white"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={row.quantity}
                        onChange={e => handleRowChange(row.id, 'quantity', e.target.value)}
                        className="h-10 bg-transparent border-slate-700 focus:bg-slate-900 text-white text-center"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={row.perPieceRent}
                        onChange={e => handleRowChange(row.id, 'perPieceRent', e.target.value)}
                        className="h-10 bg-transparent border-slate-700 focus:bg-slate-900 text-white text-center"
                      />
                    </td>
                    <td className="p-3">
                      <div className="h-10 flex items-center justify-center font-mono text-blue-400 font-bold bg-slate-900/50 rounded border border-slate-800">
                        {row.totalPerDayRent}
                      </div>
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={row.returnItems}
                        onChange={e => handleRowChange(row.id, 'returnItems', e.target.value)}
                        className="h-10 bg-transparent border-slate-700 focus:bg-slate-900 text-white text-center"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-3">
                      <div className={`h-10 flex items-center justify-center font-mono font-bold bg-slate-900/50 rounded border border-slate-800 ${(row.quantity - (row.returnItems || 0)) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {Math.max(0, row.quantity - (row.returnItems || 0))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => removeRow(row.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 glass border-slate-800 sticky top-6 bg-gradient-to-b from-slate-900/80 to-slate-950/80">
            <div className="flex items-center gap-2 mb-6 text-pink-400">
              <Calculator className="w-5 h-5" />
              <h3 className="text-lg font-bold uppercase tracking-wider">Summary</h3>
            </div>

            <div className="space-y-4">
              <div className="pt-2 pb-4 border-b border-slate-800">
                <label className="text-xs text-slate-400 uppercase font-semibold mb-2 block">Payment Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentStatus('Paid')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all ${paymentStatus === 'Paid'
                      ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setPaymentStatus('UnPaid')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all ${paymentStatus === 'UnPaid'
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    UnPaid
                  </button>
                </div>
              </div>

              {calculateTotals().itemizedDetails.map((detail, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-slate-300 font-medium">{detail.itemName || 'Item ' + (i + 1)}</p>
                    <p className="text-slate-500 text-xs">{detail.days ? `${detail.days} Days` : 'Running'} × {detail.totalPerDayRent}/day</p>
                  </div>
                  <span className="font-mono text-slate-200">
                    {detail.rowTotal ? detail.rowTotal.toLocaleString() : '--'}
                  </span>
                </div>
              ))}

              <div className="pt-4 mt-4 border-t-2 border-slate-700">
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-medium uppercase text-xs">Grand Total</span>
                  <span className="text-3xl font-bold text-white tracking-tight">
                    ₹{calculateTotals().grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
