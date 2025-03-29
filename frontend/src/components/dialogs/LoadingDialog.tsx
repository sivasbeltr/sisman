import React from 'react';

/**
 * Props for the LoadingDialog component
 */
export interface LoadingDialogProps {
    /** Whether the dialog is visible */
    isOpen: boolean;
    /** The message to display */
    message?: string;
    /** Additional class names */
    className?: string;
}

/**
 * A loading dialog component that displays a spinner with optional message.
 * 
 * @example
 * <LoadingDialog 
 *   isOpen={isLoading}
 *   message="Yükleniyor..."
 * />
 */
export const LoadingDialog: React.FC<LoadingDialogProps> = ({
    isOpen,
    message = 'Yükleniyor...',
    className = '',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

                {/* Dialog */}
                <div
                    className={`bg-white dark:bg-gray-800 rounded-lg px-8 py-6 max-w-sm mx-auto shadow-xl z-10 ${className}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="loading-dialog-title"
                >
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        {message && (
                            <p
                                id="loading-dialog-title"
                                className="text-center text-gray-700 dark:text-gray-300"
                            >
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
