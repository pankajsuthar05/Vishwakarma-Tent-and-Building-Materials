'use client';
import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function Header() {
    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
            <div className="flex h-20 items-center justify-between px-8">
                <div className="flex items-center flex-1 max-w-md">
                    <div className="relative w-full max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search inventory, bookings..."
                            className="pl-10 h-10 bg-slate-100/50 border-transparent focus:bg-white dark:bg-slate-800/50 dark:focus:bg-slate-900 transition-all rounded-full"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button size="icon" variant="ghost" className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </Button>

                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

                    <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 pr-4 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                        <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                            JD
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">John Doe</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
