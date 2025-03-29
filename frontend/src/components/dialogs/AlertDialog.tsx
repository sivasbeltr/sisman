import React from 'react';

/**
 * Alert dialog types that determine the visual style and icon
 */
export type AlertType = 'info' | 'warning' | 'success' | 'error';

/**
 * Props for the AlertDialog component
 */
export interface AlertDialogProps {
    /** Whether the dialog is visible */
    isOpen: boolean;
    /** Function to close the dialog */
    onClose: () => void;
    /** The title of the dialog */
    title: string;
    /** The message to display */
    message: string;
    /** The type of alert */
    type: AlertType;
    /** Optional actions to display at the bottom */
    actions?: React.ReactNode;
    /** Auto close timer in milliseconds (if provided) */
    autoCloseMs?: number;
}

/**
 * An alert dialog component that displays various types of alerts.
 * 
 * @example
 * <AlertDialog 
 *   isOpen={isAlertOpen}
 *   onClose={() => setIsAlertOpen(false)}
 *   title="İşlem Başarılı"
 *   message="Kayıt başarıyla oluşturuldu."
 *   type="success"
 * />
 */
export const AlertDialog: React.FC<AlertDialogProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    actions,
    autoCloseMs,
}) => {
    // Auto close functionality
    React.useEffect(() => {
        if (isOpen && autoCloseMs) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseMs);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoCloseMs, onClose]);

    // If not open, don't render anything
    if (!isOpen) return null;

    // Configuration based on alert type
    const alertConfig = {
        info: {
            bgColor: 'bg-blue-50 dark:bg-blue-900/30',
            textColor: 'text-blue-800 dark:text-blue-200',
            borderColor: 'border-blue-500',
            icon: (
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        warning: {
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
            textColor: 'text-yellow-800 dark:text-yellow-200',
            borderColor: 'border-yellow-500',
            icon: (
                <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        success: {
            bgColor: 'bg-green-50 dark:bg-green-900/30',
            textColor: 'text-green-800 dark:text-green-200',
            borderColor: 'border-green-500',
            icon: (
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        error: {
            bgColor: 'bg-red-50 dark:bg-red-900/30',
            textColor: 'text-red-800 dark:text-red-200',
            borderColor: 'border-red-500',
            icon: (
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    const config = alertConfig[type];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} aria-hidden="true"></div>

                {/* Center dialog */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg border-l-4 ${config.borderColor} sm:my-8 sm:align-middle`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="alert-dialog-title"
                >
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {config.icon}
                        </div>
                        <div className="ml-4 w-0 flex-1">
                            <h3 id="alert-dialog-title" className={`text-lg font-medium ${config.textColor}`}>
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {message}
                                </p>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                type="button"
                                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={onClose}
                            >
                                <span className="sr-only">Kapat</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {actions && (
                        <div className="mt-4 flex justify-end space-x-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
