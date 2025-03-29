import React, { createContext, useState, useContext, useCallback } from 'react';
import { ToastContainer } from '../components/common/ToastContainer';
import type { ToastProps, ToastType, ToastPosition } from '../components/common/Toast';

// Omit position and id from Toast options
export type ToastOptions = Omit<ToastProps, 'id' | 'position'>;

/**
 * Interface for the Toast context
 */
interface ToastContextType {
    /**
     * Add a success toast
     */
    showSuccess: (message: string, options?: Partial<ToastOptions>) => string;
    /**
     * Add an error toast
     */
    showError: (message: string, options?: Partial<ToastOptions>) => string;
    /**
     * Add a warning toast
     */
    showWarning: (message: string, options?: Partial<ToastOptions>) => string;
    /**
     * Add an info toast
     */
    showInfo: (message: string, options?: Partial<ToastOptions>) => string;
    /**
     * Add a toast with specified type
     */
    showToast: (message: string, type: ToastType, options?: Partial<ToastOptions>) => string;
    /**
     * Close a specific toast by ID
     */
    closeToast: (id: string) => void;
    /**
     * Close all toasts
     */
    closeAllToasts: () => void;
}

/**
 * Props for the Toast provider component
 */
interface ToastProviderProps {
    children: React.ReactNode;
    position?: ToastPosition;
    maxToasts?: number;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Provider component that enables toast functionality throughout the app
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
    children,
    position = 'top-right',
    maxToasts = 5
}) => {
    // State to store active toasts
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    // Generate a unique ID for each toast
    const generateId = useCallback(() => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []);

    // Add a new toast
    const showToast = useCallback((message: string, type: ToastType, options: Partial<ToastOptions> = {}) => {
        const id = generateId();

        const toast: ToastProps = {
            id,
            message,
            type,
            ...options
        };

        setToasts(prev => [...prev, toast]);
        return id;
    }, [generateId]);

    // Helper functions for each toast type
    const showSuccess = useCallback((message: string, options: Partial<ToastOptions> = {}) => {
        return showToast(message, 'success', options);
    }, [showToast]);

    const showError = useCallback((message: string, options: Partial<ToastOptions> = {}) => {
        return showToast(message, 'error', options);
    }, [showToast]);

    const showWarning = useCallback((message: string, options: Partial<ToastOptions> = {}) => {
        return showToast(message, 'warning', options);
    }, [showToast]);

    const showInfo = useCallback((message: string, options: Partial<ToastOptions> = {}) => {
        return showToast(message, 'info', options);
    }, [showToast]);

    // Close a specific toast
    const closeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Close all toasts
    const closeAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Context value
    const contextValue = {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showToast,
        closeToast,
        closeAllToasts
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer
                toasts={toasts}
                position={position}
                maxToasts={maxToasts}
                onClose={closeToast}
            />
        </ToastContext.Provider>
    );
};

/**
 * Hook to use toast functionality in components
 */
export const useToast = () => {
    const context = useContext(ToastContext);

    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
};
