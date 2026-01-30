'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eye, Edit, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RunningPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [runningAccounts, setRunningAccounts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        // DEMO MODE: load from local storage
        const loadItems = () => {
            try {
                const data = JSON.parse(localStorage.getItem('tent_ledger_demo_data') || '{"users":{}}');
                // Load ALL customers and filter for RUNNING status
                const allCustomers = data.users?.[user.uid]?.customers || {};
                const running = Object.values(allCustomers).filter((c: any) => c.status === 'RUNNING');
                setRunningAccounts(running);
            } catch (e) {
                console.error(e);
            }
        };

        loadItems();
        // Poll for changes every 2 seconds to simulate realtime
        const interval = setInterval(loadItems, 2000);
        return () => clearInterval(interval);

        /* FIREBASE CODE
        // Listen to 'customers' collection where status == 'RUNNING'
        const q = query(collection(db, 'users', user.uid, 'customers'), where('status', '==', 'RUNNING'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const accounts = snapshot.docs.map(doc => ({ customerId: doc.id, ...doc.data() }));
          setRunningAccounts(accounts);
        });
    
        return () => unsubscribe();
        */
    }, [user]);

    const handleViewRecord = (customerId: string) => {
        if (!user?.uid) return;

        try {
            const data = JSON.parse(localStorage.getItem('tent_ledger_demo_data') || '{"users":{}}');
            const customerData = data.users?.[user.uid]?.customers?.[customerId];

            if (customerData) {
                // Store the record to be edited
                localStorage.setItem('tent_ledger_edit_record', JSON.stringify(customerData));
                // Navigate to dashboard
                router.push('/');
            }
        } catch (e) {
            console.error('Error loading record:', e);
        }
    };

    // Filter accounts based on search query
    const filteredAccounts = runningAccounts.filter(account =>
        account.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Running Accounts</h2>
                    <p className="text-slate-400">Manage active customer rentals.</p>
                </div>
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by customer name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <Card className="glass border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                            <th className="p-4">Customer Name</th>
                            <th className="p-4">Start Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Item Statuses</th>
                            <th className="p-4">Current Total</th>
                            <th className="p-4">Payment</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                        {filteredAccounts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                    {searchQuery ? 'No matching customers found.' : 'No running accounts found.'}
                                </td>
                            </tr>
                        ) : (
                            filteredAccounts.map((account) => (
                                <tr key={account.customerId} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 font-medium">{account.customerName}</td>
                                    <td className="p-4">{account.startDate}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                                            {account.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.from(new Set(account.ledgerRows?.map((r: any) => r.itemStatus || 'Pending'))).map((status: any) => (
                                                <span key={status} className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border
                                                    ${status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : ''}
                                                    ${status === 'Take' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                                                    ${status === 'Get' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : ''}
                                                    ${status === 'Clear' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}
                                                 `}>
                                                    {status}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono">₹{account.grandTotal?.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${account.paymentStatus === 'Paid'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {account.paymentStatus || 'UnPaid'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleViewRecord(account.customerId)}
                                            className="hover:bg-white/10 hover:text-white text-slate-400"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> View
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
