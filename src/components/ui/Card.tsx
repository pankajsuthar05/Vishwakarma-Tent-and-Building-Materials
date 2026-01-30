import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outlined';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const variants = {
            default: "bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800",
            glass: "bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-white/20 dark:border-slate-700/30 shadow-xl",
            outlined: "bg-transparent border border-slate-200 dark:border-slate-800"
        };

        return (
            <div
                ref={ref}
                className={cn("rounded-2xl p-6", variants[variant], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export { Card };
