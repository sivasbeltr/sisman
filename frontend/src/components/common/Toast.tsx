import React, { useState, useEffect } from 'react';

/**
 * Toast types that determine the visual style and icon
 */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/**
 * Position options for toast placement
 */
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/**
 * Props for the Toast component
 */
export interface ToastProps {
    /** Unique identifier for the toast */
    id: string;
    /** Message to display */
    message: string;
    /** Optional title */
    title?: string;
    /** Type of the toast */
    type?: ToastType;
    /** Duration in milliseconds before auto-dismiss */
    duration?: number;
    /** Whether the toast can be dismissed manually */
    dismissible?: boolean;
    /** Position on the screen */
    position?: ToastPosition;
    /** Function to call when the toast is dismissed or expires */
    onClose?: (id: string) => void;
    /** Function to call when the toast is clicked */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * A toast notification component for displaying temporary messages.
 * 
 * @example
 * <Toast
 *   id="success-1"
 *   title="Başarılı"
 *   message="İşlem başarıyla tamamlandı"
 *   type="success"
 *   duration={5000}
 *   onClose={(id) => removeToast(id)}
 * />
 */
export const Toast: React.FC<ToastProps> = ({
    id,
    message,
    title,
    type = 'info',
    duration = 5000,  // Default 5 seconds
    dismissible = true,
    onClose,
    onClick,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);

    // Handle automatic dismissal
    useEffect(() => {
        if (!isVisible) return;
        if (duration === 0) return; // Don't auto-dismiss if duration is 0
        if (isPaused) return; // Don't count down when paused

        const startTime = Date.now();
        const endTime = startTime + duration;

        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = endTime - now;
            const newProgress = (remaining / duration) * 100;

            if (remaining <= 0) {
                clearInterval(timer);
                setIsVisible(false);
                handleClose();
            } else {
                setProgress(newProgress);
            }
        }, 16); // ~60fps

        return () => clearInterval(timer);
    }, [isVisible, duration, isPaused]);

    // Call onClose when visibility changes
    useEffect(() => {
        if (!isVisible && onClose) {
            // Small delay to allow exit animation
            const timeout = setTimeout(() => onClose(id), 300);
            return () => clearTimeout(timeout);
        }
    }, [isVisible, onClose, id]);

    const handleClose = () => {
        setIsVisible(false);
    };

    // Configuration based on toast type
    const toastConfig = {
        info: {
            bgColor: 'bg-blue-50 dark:bg-blue-900/40',
            textColor: 'text-blue-800 dark:text-blue-200',
            progressColor: 'bg-blue-500',
            icon: (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        success: {
            bgColor: 'bg-green-50 dark:bg-green-900/40',
            textColor: 'text-green-800 dark:text-green-200',
            progressColor: 'bg-green-500',
            icon: (
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        warning: {
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/40',
            textColor: 'text-yellow-800 dark:text-yellow-200',
            progressColor: 'bg-yellow-500',
            icon: (
                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        error: {
            bgColor: 'bg-red-50 dark:bg-red-900/40',
            textColor: 'text-red-800 dark:text-red-200',
            progressColor: 'bg-red-500',
            icon: (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        }
    };

    const config = toastConfig[type];

    // Animation classes based on visibility
    const animationClasses = isVisible ? 'animate-enter' : 'animate-leave';

    return (
        <div
            className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden
                        ${config.bgColor} 
                        transition-all duration-300 ${animationClasses} ${className}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={onClick}
        >
            <div className="relative">
                {/* Progress bar */}
                {duration > 0 && (
                    <div
                        className={`h-1 ${config.progressColor} transition-all duration-75 ease-linear`}
                        style={{ width: `${progress}%` }}
                    ></div>
                )}

                <div className="p-4 flex">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        {config.icon}
                    </div>

                    {/* Content */}
                    <div className="ml-3 flex-1">
                        {title && (
                            <p className={`font-medium ${config.textColor}`}>
                                {title}
                            </p>
                        )}
                        <p className={`text-sm ${config.textColor}`}>
                            {message}
                        </p>
                    </div>

                    {/* Close button */}
                    {dismissible && (
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                type="button"
                                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClose();
                                }}
                            >
                                <span className="sr-only">Kapat</span>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
