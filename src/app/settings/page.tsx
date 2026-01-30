'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { User, Bell, Shield, Sliders } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and application preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                <nav className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <Button variant="ghost" className="justify-start bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2 font-medium">
                        <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                    <Button variant="ghost" className="justify-start px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Button>
                    <Button variant="ghost" className="justify-start px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Shield className="mr-2 h-4 w-4" /> Security
                    </Button>
                    <Button variant="ghost" className="justify-start px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Sliders className="mr-2 h-4 w-4" /> Appearance
                    </Button>
                </nav>

                <div className="grid gap-6">
                    <Card>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Profile Information</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Update your account's profile information and email address.</p>
                        </div>
                        <div className="grid gap-4 max-w-xl">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input defaultValue="John Doe" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input defaultValue="john.doe@example.com" />
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button>Save Changes</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
