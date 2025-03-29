import React from 'react';
import { classNames } from '../../utils/classNames';

export type BadgeColor =
    'gray' | 'red' | 'yellow' | 'green' | 'blue' |
    'indigo' | 'purple' | 'pink' | 'primary';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps {
    /** The text content of the badge */
    children: React.ReactNode;
    /** The color of the badge */
    color?: BadgeColor;
    /** The size of the badge */
    size?: BadgeSize;
    /** Whether the badge has a pill shape */
    pill?: boolean;
    /** Whether to apply a dot indicator */
    dot?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Whether to add a subtle animation to draw attention */
    pulse?: boolean;
    /** Optional click handler */
    onClick?: () => void;
}

/**
 * Badge component for displaying labels, counts, or statuses.
 */
export const Badge: React.FC<BadgeProps> = ({
    children,
    color = 'primary',
    size = 'md',
    pill = false,
    dot = false,
    className = '',
    pulse = false,
    onClick
}) => {
    const colorClasses = {
        gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
        green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
        pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200',
        primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    };

    const sizeClasses = {
        xs: 'text-xs px-1',
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
    };

    const dotColors = {
        gray: 'bg-gray-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        indigo: 'bg-indigo-500',
        purple: 'bg-purple-500',
        pink: 'bg-pink-500',
        primary: 'bg-blue-500',
    };

    return (
        <span
            className={classNames(
                'inline-flex items-center font-medium',
                colorClasses[color],
                sizeClasses[size],
                pill ? 'rounded-full' : 'rounded',
                pulse ? 'animate-pulse' : '',
                onClick ? 'cursor-pointer hover:opacity-80' : '',
                className
            )}
            onClick={onClick}
        >
            {dot && (
                <span
                    className={classNames(
                        'mr-1.5 h-2 w-2 rounded-full',
                        dotColors[color]
                    )}
                />
            )}
            {children}
        </span>
    );
};
