import React from 'react';
import { classNames } from '../../utils/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** The button variant */
    variant?: ButtonVariant;
    /** The button size */
    size?: ButtonSize;
    /** Whether the button takes the full width */
    fullWidth?: boolean;
    /** Whether the button is rounded */
    rounded?: boolean;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Icon to display at the start of the button */
    leftIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    /** Icon to display at the end of the button */
    rightIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    /** Button children (typically text) */
    children: React.ReactNode;
    /** Loading state */
    loading?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Button component for triggering actions or navigation.
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    rounded = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    loading = false,
    children,
    className = '',
    type = 'button',
    ...props
}) => {
    // Variant based classes
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700',
        success: 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800',
        danger: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700',
        info: 'bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700',
        light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300',
        dark: 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-900 dark:hover:bg-gray-800',
        outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
        link: 'bg-transparent text-blue-600 hover:underline hover:bg-transparent dark:text-blue-400',
    };

    // Size based classes
    const sizeClasses = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-2.5 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
        xl: 'px-6 py-3 text-base',
    };

    const iconSizeClasses = {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
        xl: 'h-5 w-5',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={classNames(
                'inline-flex items-center justify-center font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                variantClasses[variant],
                sizeClasses[size],
                fullWidth ? 'w-full' : '',
                rounded ? 'rounded-full' : 'rounded-md',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                variant === 'link' ? 'shadow-none' : '',
                variant === 'outline' ? 'shadow-none' : '',
                className
            )}
            {...props}
        >
            {loading && (
                <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {LeftIcon && !loading && (
                <LeftIcon className={classNames(`${iconSizeClasses[size]} mr-2`)} aria-hidden="true" />
            )}
            {children}
            {RightIcon && (
                <RightIcon className={classNames(`${iconSizeClasses[size]} ml-2`)} aria-hidden="true" />
            )}
        </button>
    );
};
