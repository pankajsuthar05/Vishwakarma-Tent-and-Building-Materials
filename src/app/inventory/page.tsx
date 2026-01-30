'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Search, Plus, Filter, MoreVertical, Tent, Ruler, ShieldCheck } from 'lucide-react';

interface InventoryItem {
    id: number;
    name: string;
    size: string;
    stock: number;
    status: string;
    price: string;
    image: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        size: '',
        stock: '',
        price: '',
        image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2670&auto=format&fit=crop' // Default image
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/inventory');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newItem.name,
                    size: newItem.size,
                    stock: Number(newItem.stock),
                    price: `$${newItem.price}/day`,
                    image: newItem.image
                }),
            });

            if (res.ok) {
                const addedItem = await res.json();
                setItems([...items, addedItem]);
                setIsAddModalOpen(false);
                setNewItem({ name: '', size: '', stock: '', price: '', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2670&auto=format&fit=crop' });
            }
        } catch (error) {
            console.error('Failed to add item:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">Inventory</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your tents and equipment.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Add New Item
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search inventory..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Sort by
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {filteredItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 group">
                            <div className="relative h-48 w-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 right-3 z-20">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border border-white/30">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-3 left-3 z-20">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20 ${item.status === 'Available' ? 'bg-green-500/80 text-white' :
                                            item.status === 'Low Stock' ? 'bg-yellow-500/80 text-white shadow-lg shadow-yellow-500/20' :
                                                'bg-red-500/80 text-white shadow-lg shadow-red-500/20'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 line-clamp-1">{item.name}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1"><Ruler className="h-3 w-3" /> {item.size}</span>
                                            <span className="flex items-center gap-1"><Tent className="h-3 w-3" /> {item.stock} in stock</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600 dark:text-blue-400">{item.price}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                        <ShieldCheck className="h-3 w-3" /> Inspected
                                    </div>
                                    <Button size="sm" variant="secondary" className="h-8 text-xs">View Details</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Inventory Item"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddItem} isLoading={submitting}>Add Item</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Item Name</label>
                        <Input
                            placeholder="e.g. Wedding Marquee"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Size</label>
                            <Input
                                placeholder="e.g. 20x40m"
                                value={newItem.size}
                                onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stock</label>
                            <Input
                                type="number"
                                placeholder="e.g. 5"
                                value={newItem.stock}
                                onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price per Day ($)</label>
                        <Input
                            type="number"
                            placeholder="e.g. 1200"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
