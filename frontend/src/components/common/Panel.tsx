import React from 'react';
import { classNames } from '../../utils/classNames';

export interface PanelProps {
    /** The title of the panel */
    title?: string;
    /** The variant/style of the panel */
    variant?: 'default' | 'outlined' | 'filled' | 'elevated';
    /** The children to render inside the panel */
    children: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Whether the panel has a footer */
    footer?: React.ReactNode;
    /** Additional header content */
    headerContent?: React.ReactNode;
    /** Whether to add padding */
    noPadding?: boolean;
}

/**
 * A content panel component with various style options
 */
export const Panel: React.FC<PanelProps> = ({
    title,
    variant = 'default',
    children,
    className = '',
    footer,
    headerContent,
    noPadding = false
}) => {
    // Panel variant styling
    const variantClasses = {
        default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        outlined: 'bg-transparent border border-gray-200 dark:border-gray-700',
        filled: 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800',
        elevated: 'bg-white dark:bg-gray-800 shadow-md border-none'
    };

    return (
        <div
            className={classNames(
                'rounded-lg overflow-hidden',
                variantClasses[variant],
                className
            )}
        >
            {/* Panel Header */}
            {(title || headerContent) && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    {title && (
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {title}
                        </h3>
                    )}
                    {headerContent && (
                        <div>{headerContent}</div>
                    )}
                </div>
            )}

            {/* Panel Body */}
            <div className={noPadding ? '' : 'p-4'}>
                <div className="text-gray-800 dark:text-gray-200">
                    {children}
                </div>
            </div>

            {/* Panel Footer */}
            {footer && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                    {footer}
                </div>
            )}
        </div>
    );
};
