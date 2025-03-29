import React from 'react';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepStatus = 'completed' | 'current' | 'pending' | 'error';

export interface StepperItemProps {
    label: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    status?: StepStatus;
    optional?: boolean;
    disabled?: boolean;
    className?: string;
    index?: number;
    orientation?: StepperOrientation;
    showStepNumbers?: boolean;
    variant?: 'default' | 'outlined' | 'contained';
    activeColor?: string;
    completedColor?: string;
    showLabels?: boolean;
    size?: 'sm' | 'md' | 'lg';
    clickable?: boolean;
    onStepClick?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    withConnectors?: boolean;
    children?: React.ReactNode;
    activeStep?: number;
}
export const StepperItem: React.FC<StepperItemProps> = ({
    label,
    description,
    icon,
    status = 'pending',
    optional = false,
    disabled = false,
    className = '',
    index = 0,
    orientation = 'horizontal',
    showStepNumbers = true,
    variant = 'default',
    activeColor = 'var(--color-primary, #3b82f6)',
    completedColor = 'var(--color-success, #10b981)',
    showLabels = true,
    size = 'md',
    clickable = false,
    onStepClick,
    isLast,
    withConnectors = true,
    children,
    activeStep = 0,
}) => {
    const sizeClasses = {
        sm: { container: 'w-6 h-6 text-xs', connector: 'h-1', label: 'text-xs' },
        md: { container: 'w-8 h-8 text-sm', connector: 'h-1.5', label: 'text-sm' },
        lg: { container: 'w-10 h-10 text-base', connector: 'h-2', label: 'text-base' },
    };

    const completedIcon = (
        <svg className="w-full h-full p-1" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );

    const errorIcon = (
        <svg className="w-full h-full p-1" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    let content: React.ReactNode = showStepNumbers ? index + 1 : null;
    if (icon) content = icon;
    else if (status === 'completed') content = completedIcon;
    else if (status === 'error') content = errorIcon;

    const getColor = () => {
        switch (status) {
            case 'completed': return completedColor;
            case 'current': return activeColor;
            case 'error': return 'var(--color-danger, #ef4444)';
            default: return 'var(--color-gray-300, #d1d5db)';
        }
    };

    const getVariantStyles = () => {
        const stepColor = getColor();
        switch (variant) {
            case 'contained':
                return {
                    backgroundColor: status === 'pending' ? 'transparent' : stepColor,
                    borderColor: stepColor,
                    color: status === 'pending' ? stepColor : '#ffffff',
                };
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    borderColor: stepColor,
                    color: stepColor,
                };
            default:
                return {
                    backgroundColor: status === 'pending' ? 'transparent' : stepColor,
                    borderColor: status === 'pending' ? stepColor : 'transparent',
                    color: status === 'pending' ? stepColor : '#ffffff',
                };
        }
    };

    const variantStyles = getVariantStyles();
    const cursorClass = clickable && !disabled ? 'cursor-pointer' : 'cursor-default';

    const connectorColor = index < activeStep ? completedColor : 'var(--color-gray-200, #e5e7eb)';

    if (orientation === 'horizontal') {
        return (
            <div className={`flex-1 flex items-center relative ${className}`}>
                <div className="flex flex-col items-center w-full">
                    <div
                        className={`
                            ${sizeClasses[size].container} rounded-full flex items-center justify-center
                            border-2 transition-colors font-medium z-10
                            ${cursorClass} ${disabled ? 'opacity-50' : ''}
                        `}
                        style={variantStyles}
                        onClick={clickable && !disabled && onStepClick ? onStepClick : undefined}
                        role={clickable ? 'button' : undefined}
                        aria-disabled={disabled}
                    >
                        {content}
                    </div>
                    {showLabels && (
                        <div className="mt-2 text-center">
                            <div className={`font-medium ${sizeClasses[size].label} ${status === 'current' ? 'text-blue-600 dark:text-blue-400' : status === 'completed' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                {label}
                            </div>
                            {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
                            {optional && <div className="text-xs text-gray-400 dark:text-gray-500">İsteğe bağlı</div>}
                            {children && <div className="mt-2">{children}</div>}
                        </div>
                    )}
                </div>
                {!isLast && withConnectors && (
                    <div
                        className={`${sizeClasses[size].connector} flex-1`}
                        style={{ backgroundColor: connectorColor }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className={`relative flex items-start ${className}`}>
            <div className="flex flex-col items-center">
                <div
                    className={`
                        ${sizeClasses[size].container} rounded-full flex items-center justify-center
                        border-2 transition-colors font-medium z-10
                        ${cursorClass} ${disabled ? 'opacity-50' : ''}
                    `}
                    style={variantStyles}
                    onClick={clickable && !disabled && onStepClick ? onStepClick : undefined}
                    role={clickable ? 'button' : undefined}
                    aria-disabled={disabled}
                >
                    {content}
                </div>
                {!isLast && withConnectors && (
                    <div
                        className={`w-0.5 ${sizeClasses[size].connector.replace('h-', 'min-h-')} flex-1`}
                        style={{ backgroundColor: connectorColor }}
                    />
                )}
            </div>
            <div className="ml-4 flex-1 pb-8">
                <div className={`font-medium ${sizeClasses[size].label} ${status === 'current' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {label}
                    {optional && <span className="text-xs ml-2 text-gray-400 dark:text-gray-500">(İsteğe bağlı)</span>}
                </div>
                {description && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</div>}
                {children && <div className="mt-2">{children}</div>}
            </div>
        </div>
    );
};