import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../common/Button';

/**
 * Props for the CountdownDialog component
 */
export interface CountdownDialogProps {
    /** Whether the dialog is visible */
    isOpen: boolean;
    /** Function to close the dialog */
    onClose: () => void;
    /** The title of the dialog */
    title: string;
    /** The message to display */
    message?: string;
    /** Total duration of countdown in seconds */
    durationSeconds: number;
    /** Callback function when countdown reaches zero */
    onTimeout?: () => void;
    /** Whether to show a cancel button */
    showCancelButton?: boolean;
    /** Text for the cancel button */
    cancelText?: string;
    /** Additional class names */
    className?: string;
}

/**
 * A countdown dialog component that displays a countdown timer with a decreasing progress bar.
 * 
 * @example
 * <CountdownDialog 
 *   isOpen={isCountdownActive}
 *   onClose={() => setCountdownActive(false)}
 *   title="Oturumunuz Sonlanıyor"
 *   message="Oturumunuz 30 saniye içinde sonlanacak. Devam etmek istiyor musunuz?"
 *   durationSeconds={30}
 *   onTimeout={handleSessionTimeout}
 *   showCancelButton={true}
 * />
 */
export const CountdownDialog: React.FC<CountdownDialogProps> = ({
    isOpen,
    onClose,
    title,
    message,
    durationSeconds,
    onTimeout,
    showCancelButton = true,
    cancelText = "İptal",
    className = '',
}) => {
    // State to track remaining seconds
    const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
    // State to control the animation of progress bar
    const [isAnimating, setIsAnimating] = useState(false);

    // Reference to track if component is mounted
    const isMounted = useRef(false);

    // Calculate progress percentage (decreasing from 100% to 0%)
    const progressPercentage = (remainingSeconds / durationSeconds) * 100;

    // Format remaining time as MM:SS
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSecs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    // Reset and start countdown when dialog opens
    useEffect(() => {
        if (isOpen) {
            // Reset and initialize
            setRemainingSeconds(durationSeconds);
            setIsAnimating(false);

            // Use a small delay to ensure the initial state is rendered before animation starts
            const animationDelay = setTimeout(() => {
                if (isMounted.current) {
                    setIsAnimating(true);
                }
            }, 50);

            const interval = setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        if (onTimeout) onTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                clearInterval(interval);
                clearTimeout(animationDelay);
            };
        }
    }, [isOpen, durationSeconds, onTimeout]);

    // Track if component is mounted
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true"></div>

                {/* Dialog */}
                <div
                    className={`bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-auto shadow-xl z-10 ${className}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="countdown-dialog-title"
                >
                    <div className="flex justify-between items-start">
                        <h3
                            id="countdown-dialog-title"
                            className="text-lg font-medium text-gray-900 dark:text-white"
                        >
                            {title}
                        </h3>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {formatTime(remainingSeconds)}
                        </div>
                    </div>

                    {message && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
                            {message}
                        </p>
                    )}

                    {/* Countdown Progress Bar (decreasing) */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                        <div
                            className={`h-2.5 rounded-full`}
                            style={{
                                width: `${progressPercentage}%`,
                                transition: isAnimating ? 'width 1s linear' : 'none',
                                backgroundColor: progressPercentage < 30 ? '#ef4444' : progressPercentage < 70 ? '#f59e0b' : '#3b82f6'
                            }}
                        ></div>
                    </div>

                    {/* Cancel Button (optional) */}
                    {showCancelButton && (
                        <div className="mt-4 flex justify-end">
                            <Button variant="primary" onClick={onClose}>
                                {cancelText}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
