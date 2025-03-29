import React from 'react';
import { Toast, ToastProps, ToastPosition } from './Toast';

/**
 * Props for the ToastContainer component
 */
export interface ToastContainerProps {
    /** Array of toast configurations */
    toasts: Omit<ToastProps, 'position'>[];
    /** Position for all toasts within the container */
    position?: ToastPosition;
    /** Max number of toasts to show at once */
    maxToasts?: number;
    /** Function to call when a toast is dismissed */
    onClose?: (id: string) => void;
}

/**
 * Position-specific classes
 */
const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
};

/**
 * A container component for managing multiple toast notifications.
 * 
 * @example
 * <ToastContainer
 *   toasts={toastList}
 *   position="top-right"
 *   onClose={handleCloseToast}
 * />
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts = [],
    position = 'top-right',
    maxToasts = 5,
    onClose
}) => {
    // Take only the most recent toasts up to maxToasts
    const visibleToasts = toasts.slice(-maxToasts);

    // Determine if we should stack from bottom or top
    const reversedPositions: ToastPosition[] = ['bottom-left', 'bottom-right', 'bottom-center'];
    const shouldReverse = reversedPositions.includes(position);
    const toastsToRender = shouldReverse ? [...visibleToasts].reverse() : visibleToasts;

    return (
        <div
            className={`fixed z-50 flex flex-col ${positionClasses[position]} ${shouldReverse ? 'space-y-reverse space-y-3' : 'space-y-3'}`}
            style={{
                pointerEvents: 'none', // Allow clicking through the container
                maxWidth: '100%'
            }}
        >
            {toastsToRender.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    position={position}
                    onClose={onClose}
                />
            ))}
        </div>
    );
};
