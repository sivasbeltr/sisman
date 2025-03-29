import React from 'react';

/**
 * Props for the ProgressDialog component
 */
export interface ProgressDialogProps {
    /** Whether the dialog is visible */
    isOpen: boolean;
    /** The title of the dialog */
    title: string;
    /** The message to display */
    message?: string;
    /** Current progress percentage (0-100) */
    progress: number;
    /** Whether the progress is indeterminate */
    indeterminate?: boolean;
    /** Additional class names */
    className?: string;
}

/**
 * A progress dialog component that displays a progress bar.
 * 
 * @example
 * <ProgressDialog 
 *   isOpen={isUploading}
 *   title="Dosya Yükleniyor"
 *   message="Lütfen bekleyin..."
 *   progress={uploadProgress}
 * />
 */
export const ProgressDialog: React.FC<ProgressDialogProps> = ({
    isOpen,
    title,
    message,
    progress,
    indeterminate = false,
    className = '',
}) => {
    // Ensure progress is between 0 and 100
    const normalizedProgress = Math.min(100, Math.max(0, progress));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

                {/* Dialog */}
                <div
                    className={`bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto shadow-xl z-10 ${className}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="progress-dialog-title"
                >
                    <h3
                        id="progress-dialog-title"
                        className="text-lg font-medium text-gray-900 dark:text-white mb-4"
                    >
                        {title}
                    </h3>

                    {message && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {message}
                        </p>
                    )}

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full ${indeterminate ? 'animate-pulse bg-blue-500' : 'bg-blue-600'}`}
                            style={{
                                width: indeterminate ? '100%' : `${normalizedProgress}%`,
                                transition: 'width 0.3s ease-in-out'
                            }}
                        ></div>
                    </div>

                    {!indeterminate && (
                        <div className="text-right mt-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {normalizedProgress.toFixed(0)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
