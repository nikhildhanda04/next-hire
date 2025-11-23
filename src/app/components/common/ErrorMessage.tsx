// Error message component
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorMessageProps {
    message: string;
    onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex items-start justify-between">
            <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-300 text-sm">{message}</p>
            </div>
            {onDismiss && (
                <button
                    onClick={handleDismiss}
                    className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                    aria-label="Dismiss error"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

