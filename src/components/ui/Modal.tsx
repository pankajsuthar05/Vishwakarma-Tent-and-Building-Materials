'use client';
import { Fragment, useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 border border-slate-200 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-6">
                    {children}
                </div>
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-6 pt-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
