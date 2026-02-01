'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eye, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomerData, DemoData } from '@/types';

export default function RunningPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [runningAccounts, setRunningAccounts] = useState<CustomerData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        const loadItems = () => {
            try {
                const storedData = localStorage.getItem('tent_ledger_demo_data');
                const data: DemoData = JSON.parse(storedData || '{"users":{}}');
                const allCustomers = data.users?.[user.uid]?.customers || {};
                const running = Object.values(allCustomers).filter((c: CustomerData) => c.status === 'RUNNING');
                setRunningAccounts(running);
            } catch (e) {
                console.error(e);
            }
        };

        loadItems();
        const interval = setInterval(loadItems, 2000);
        return () => clearInterval(interval);
    }, [user]);

    const handleViewRecord = (customerId: string) => {
        if (!user?.uid) return;

        try {
            const storedData = localStorage.getItem('tent_ledger_demo_data');
            const data: DemoData = JSON.parse(storedData || '{"users":{}}');
            const customerData = data.users?.[user.uid]?.customers?.[customerId];

            if (customerData) {
                localStorage.setItem('tent_ledger_edit_record', JSON.stringify(customerData));
                router.push('/');
            }
        } catch (e) {
            console.error('Error loading record:', e);
        }
    };

    const filteredAccounts = runningAccounts.filter(account =>
        account.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Running Accounts</h2>
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
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {account.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.from(new Set(account.ledgerRows?.map((r) => r.itemStatus || 'Pending'))).map((status) => (
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
