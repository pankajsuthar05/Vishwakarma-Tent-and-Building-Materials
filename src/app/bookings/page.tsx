'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Search, Calendar, ChevronLeft, ChevronRight, User, Tent } from 'lucide-react';

interface Booking {
    id: number;
    customer: string;
    email: string;
    date: string;
    items: string;
    status: string;
    amount: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBooking, setNewBooking] = useState({
        customer: '',
        email: '',
        items: '',
        date: '',
        amount: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/bookings');
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBooking = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newBooking,
                    amount: `$${newBooking.amount}`
                }),
            });
            if (res.ok) {
                const added = await res.json();
                setBookings([...bookings, added]);
                setIsModalOpen(false);
                setNewBooking({ customer: '', email: '', items: '', date: '', amount: '' });
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
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">Bookings</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage upcoming rentals.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Calendar className="mr-2 h-4 w-4" /> New Booking
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <Card className="flex-1 p-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Upcoming Bookings</div>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent" /></div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                            {new Date(booking.date).getDate()}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{booking.customer}</h4>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1"><Tent className="h-3 w-3" /> {booking.items}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{booking.amount}</span>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="w-full lg:w-80 p-0 h-fit">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-semibold bg-slate-50/50 dark:bg-slate-900/50">
                        Calendar
                    </div>
                    <div className="p-6 flex items-center justify-center min-h-[300px] text-slate-400">
                        <div className="text-center">
                            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Calendar View Coming Soon</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Booking"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddBooking} isLoading={submitting}>Create Booking</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Customer Name</label>
                        <Input
                            value={newBooking.customer}
                            onChange={(e) => setNewBooking({ ...newBooking, customer: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            value={newBooking.email}
                            onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Items to Rent</label>
                        <Input
                            value={newBooking.items}
                            onChange={(e) => setNewBooking({ ...newBooking, items: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input
                                type="date"
                                value={newBooking.date}
                                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount ($)</label>
                            <Input
                                type="number"
                                value={newBooking.amount}
                                onChange={(e) => setNewBooking({ ...newBooking, amount: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
