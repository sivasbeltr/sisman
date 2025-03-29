import React, { useState, useEffect } from 'react';
import { ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { classNames } from '../../utils/classNames';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
    /** The type of alert which determines the color scheme */
    type?: AlertType;
    /** The title of the alert */
    title?: string;
    /** The main message of the alert */
    message: string;
    /** Whether the alert can be dismissed */
    dismissible?: boolean;
    /** Whether to show an icon */
    withIcon?: boolean;
    /** Callback function when the alert is dismissed */
    onDismiss?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Auto close after milliseconds (0 for no auto-close) */
    autoCloseMs?: number;
}

/**
 * Alert component for displaying informational, success, warning, or error messages.
 */
export const Alert: React.FC<AlertProps> = ({
    type = 'info',
    title,
    message,
    dismissible = true,
    withIcon = true,
    onDismiss,
    className = '',
    autoCloseMs = 0
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (autoCloseMs > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, autoCloseMs);
            return () => clearTimeout(timer);
        }
    }, [autoCloseMs]);

    const handleDismiss = () => {
        setVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    if (!visible) return null;

    // Configuration based on alert type
    const configs = {
        success: {
            icon: CheckCircleIcon,
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-400 dark:border-green-700',
            textColor: 'text-green-800 dark:text-green-200',
            headingColor: 'text-green-800 dark:text-green-100',
            iconColor: 'text-green-500 dark:text-green-400',
        },
        error: {
            icon: XCircleIcon,
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-400 dark:border-red-700',
            textColor: 'text-red-800 dark:text-red-200',
            headingColor: 'text-red-800 dark:text-red-100',
            iconColor: 'text-red-500 dark:text-red-400',
        },
        warning: {
            icon: ExclamationCircleIcon,
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            borderColor: 'border-yellow-400 dark:border-yellow-700',
            textColor: 'text-yellow-800 dark:text-yellow-200',
            headingColor: 'text-yellow-800 dark:text-yellow-100',
            iconColor: 'text-yellow-500 dark:text-yellow-400',
        },
        info: {
            icon: InformationCircleIcon,
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-400 dark:border-blue-700',
            textColor: 'text-blue-800 dark:text-blue-200',
            headingColor: 'text-blue-800 dark:text-blue-100',
            iconColor: 'text-blue-500 dark:text-blue-400',
        }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <div
            className={classNames(
                'rounded-lg border-l-4 p-4 shadow-sm',
                config.bgColor,
                config.borderColor,
                className
            )}
            role="alert"
        >
            <div className="flex items-start">
                {withIcon && (
                    <div className="mr-3 flex-shrink-0">
                        <Icon className={classNames('h-5 w-5', config.iconColor)} aria-hidden="true" />
                    </div>
                )}
                <div className="flex-1">
                    {title && (
                        <h3 className={classNames('text-sm font-medium', config.headingColor)}>
                            {title}
                        </h3>
                    )}
                    <div className={classNames('mt-1 text-sm', config.textColor)}>
                        {message}
                    </div>
                </div>
                {dismissible && (
                    <div className="ml-auto pl-3">
                        <button
                            type="button"
                            className={classNames(
                                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                                config.textColor,
                                `focus:ring-${type === 'info' ? 'blue' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'red'}-500`
                            )}
                            onClick={handleDismiss}
                        >
                            <span className="sr-only">Kapat</span>
                            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
