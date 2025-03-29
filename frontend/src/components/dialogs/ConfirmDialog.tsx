import React from 'react';
import { Button } from '../common/Button';

/**
 * Props for the ConfirmDialog component
 */
export interface ConfirmDialogProps {
    /** Whether the dialog is visible */
    isOpen: boolean;
    /** Function to close the dialog */
    onClose: () => void;
    /** The title of the dialog */
    title: string;
    /** The message to display */
    message: string;
    /** Function called when user confirms */
    onConfirm: () => void;
    /** Text for the confirm button */
    confirmText?: string;
    /** Text for the cancel button */
    cancelText?: string;
    /** Variant for the confirm button */
    confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
    /** Whether the confirm button should show loading state */
    isConfirmLoading?: boolean;
    /** Whether the confirm button should be disabled */
    isConfirmDisabled?: boolean;
    /** Additional class names */
    className?: string;
}

/**
 * A confirmation dialog component with confirm and cancel options.
 * 
 * @example
 * <ConfirmDialog 
 *   isOpen={isDialogOpen}
 *   onClose={() => setDialogOpen(false)}
 *   title="Silme İşlemi"
 *   message="Bu öğeyi silmek istediğinizden emin misiniz?"
 *   onConfirm={handleDelete}
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    confirmVariant = 'primary',
    isConfirmLoading = false,
    isConfirmDisabled = false,
    className = '',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Center dialog */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${className}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-dialog-title"
                >
                    <div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3
                                id="confirm-dialog-title"
                                className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                            >
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Button
                            variant={confirmVariant}
                            onClick={onConfirm}
                            loading={isConfirmLoading}
                            disabled={isConfirmDisabled}
                            className="w-full sm:w-auto sm:ml-3"
                        >
                            {confirmText}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="mt-3 sm:mt-0 w-full sm:w-auto"
                        >
                            {cancelText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
