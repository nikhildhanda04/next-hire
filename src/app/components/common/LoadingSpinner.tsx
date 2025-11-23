// Loading spinner component
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
            {message && <p className="text-stone-500 dark:text-stone-400 mt-4">{message}</p>}
        </div>
    );
}

