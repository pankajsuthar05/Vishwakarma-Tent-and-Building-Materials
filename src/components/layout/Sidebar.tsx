'use client';
import { Home, History, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Activity, label: 'Running', href: '/running' },
    { icon: History, label: 'History', href: '/history' },
    { icon: FileText, label: 'Invoice', href: '/invoice' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-950/90 backdrop-blur-xl border-r border-slate-800 text-slate-100 flex flex-col z-50">
            <div className="flex items-center gap-3 p-6 border-b border-slate-800/50">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    Vishawakarma
                    <div className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-70">Tent & Materials</div>
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-white/10 text-white shadow-lg shadow-white/5 border border-white/10"
                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "text-blue-400")} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800/50">
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
