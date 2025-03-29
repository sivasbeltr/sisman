import React from 'react';
import { classNames } from '../../utils/classNames';

export type ProgressColor =
    | 'blue'
    | 'red'
    | 'green'
    | 'yellow'
    | 'indigo'
    | 'purple'
    | 'pink'
    | 'gray';

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressProps {
    /** The current value (0-100 or custom max) */
    value: number;
    /** The maximum value (default: 100) */
    max?: number;
    /** Color of the progress bar */
    color?: ProgressColor;
    /** Size of the progress bar */
    size?: ProgressSize;
    /** Whether to show the value as a label */
    showLabel?: boolean;
    /** Whether to show the value inside the bar */
    labelInside?: boolean;
    /** Format for the label */
    labelFormat?: (value: number, max: number) => string;
    /** Whether to add a subtle animation */
    animated?: boolean;
    /** Whether to show a striped pattern */
    striped?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Whether the progress is indeterminate */
    indeterminate?: boolean;
}

/**
 * Progress component for displaying a progress bar.
 */
export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    color = 'blue',
    size = 'md',
    showLabel = false,
    labelInside = false,
    labelFormat = (value, max) => `${Math.round((value / max) * 100)}%`,
    animated = false,
    striped = false,
    className = '',
    indeterminate = false,
}) => {
    // Ensure value is within bounds
    const normalizedValue = Math.max(0, Math.min(value, max));
    const percentage = (normalizedValue / max) * 100;

    // Color classes with better contrast
    const colorClasses = {
        blue: 'bg-blue-600',
        red: 'bg-red-600',
        green: 'bg-green-600',
        yellow: 'bg-yellow-500',
        indigo: 'bg-indigo-600',
        purple: 'bg-purple-600',
        pink: 'bg-pink-600',
        gray: 'bg-gray-600',
    };

    // Size classes with refined heights
    const sizeClasses = {
        xs: 'h-1.5',
        sm: 'h-2.5',
        md: 'h-4',
        lg: 'h-6',
    };

    // Get formatted label
    const formattedLabel = labelFormat(normalizedValue, max);

    // Stripe pattern
    const stripeStyle = striped && !indeterminate ? {
        backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)',
        backgroundSize: '1rem 1rem',
    } : {};

    return (
        <div className={classNames('w-full', className)}>
            {/* Label outside */}
            {showLabel && !labelInside && (
                <div className="mb-1.5 flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
                    <span>İlerleme</span>
                    <span>{formattedLabel}</span>
                </div>
            )}

            {/* Progress container */}
            <div
                className={classNames(
                    'relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
                    sizeClasses[size]
                )}
            >
                {/* Progress bar */}
                <div
                    className={classNames(
                        'h-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300 ease-in-out',
                        indeterminate ? 'animate-indeterminate' : colorClasses[color],
                        animated && !indeterminate && 'animate-pulse',
                        striped && !indeterminate && 'animate-stripes'
                    )}
                    style={{
                        width: indeterminate ? '100%' : `${percentage}%`,
                        ...stripeStyle,
                    }}
                    role="progressbar"
                    aria-valuenow={indeterminate ? undefined : normalizedValue}
                    aria-valuemin={0}
                    aria-valuemax={max}
                >
                    {/* Label inside */}
                    {labelInside && showLabel && !indeterminate && size !== 'xs' && size !== 'sm' && (
                        <span className="px-2 drop-shadow-sm">{formattedLabel}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Progress;