'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, UserPlus, Mail, Phone, MapPin } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    orders: number;
    spent: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        location: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer),
            });
            if (res.ok) {
                const added = await res.json();
                setCustomers([...customers, added]);
                setIsModalOpen(false);
                setNewCustomer({ name: '', email: '', phone: '', location: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">Customers</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage customer relationships.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search customers..." className="pl-10 h-9 bg-white dark:bg-slate-800" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Export</Button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent" /></div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800 border-slate-200 dark:border-slate-800">
                                    <th className="h-12 px-4 align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 dark:text-slate-400">Name</th>
                                    <th className="h-12 px-4 align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 dark:text-slate-400">Contact</th>
                                    <th className="h-12 px-4 align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 dark:text-slate-400">Location</th>
                                    <th className="h-12 px-4 align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 dark:text-slate-400">History</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0 text-slate-600 dark:text-slate-300">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800 border-slate-100 dark:border-slate-800 cursor-pointer">
                                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {customer.email}</div>
                                                <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {customer.phone}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                            <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {customer.location}</div>
                                        </td>
                                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{customer.orders} orders</span>
                                            <span className="text-xs text-slate-500 block">Total: {customer.spent}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Customer"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCustomer} isLoading={submitting}>Add Customer</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                            placeholder="City, Country"
                            value={newCustomer.location}
                            onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
