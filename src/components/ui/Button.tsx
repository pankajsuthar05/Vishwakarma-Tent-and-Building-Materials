import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";

        const variants = {
            primary: "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-950 dark:hover:bg-slate-700",
            ghost: "hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
            danger: "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:shadow-red-500/50 border-b-4 border-red-700 active:border-b-0 active:translate-y-1",
            outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-11 w-11"
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
