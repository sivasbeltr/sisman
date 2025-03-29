import React from 'react';

/**
 * Props for the Switch component
 */
export interface SwitchProps {
    /** Whether the switch is checked */
    checked: boolean;
    /** Function called when the switch is toggled */
    onChange: (checked: boolean) => void;
    /** Switch label */
    label?: string;
    /** Whether the switch is disabled */
    disabled?: boolean;
    /** Helper text displayed below the switch */
    helperText?: string;
    /** Error message to display */
    error?: string;
    /** Size of the switch */
    size?: 'sm' | 'md' | 'lg';
    /** Additional class name */
    className?: string;
    /** Screen reader text for the switch */
    srText?: string;
}

/**
 * A toggle switch component with support for labels and validation.
 * 
 * @example
 * <Switch
 *   label="Bildirimleri aktifleştir"
 *   checked={notifications}
 *   onChange={(checked) => setNotifications(checked)}
 * />
 */
export const Switch: React.FC<SwitchProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
    helperText,
    error,
    size = 'md',
    className = '',
    srText,
}) => {
    // Generate a unique ID for the switch
    const switchId = `switch-${Math.random().toString(36).substring(2, 9)}`;
    const hasError = !!error;

    // Handle the switch toggle
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) {
            // Prevent default to avoid any unwanted browser behaviors
            e.preventDefault();
            // Call the onChange prop with the negated current value
            onChange(!checked);
        }
    };

    // Size configurations
    const sizeClasses = {
        sm: {
            switch: 'h-4 w-8',
            dot: 'h-3 w-3',
            translate: checked ? 'translate-x-4' : 'translate-x-0.5',
        },
        md: {
            switch: 'h-5 w-10',
            dot: 'h-4 w-4',
            translate: checked ? 'translate-x-5' : 'translate-x-0.5',
        },
        lg: {
            switch: 'h-6 w-12',
            dot: 'h-5 w-5',
            translate: checked ? 'translate-x-6' : 'translate-x-0.5',
        },
    };

    const currentSize = sizeClasses[size];

    return (
        <div className={`${className}`}>
            <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        id={switchId}
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled}
                        aria-invalid={hasError ? 'true' : 'false'}
                        aria-describedby={hasError ? `${switchId}-error` : undefined}
                    />
                    <div
                        className={`${currentSize.switch} relative inline-flex flex-shrink-0 rounded-full 
                            ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                            cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                            ${hasError ? 'border border-red-500' : ''}
                            transition-colors duration-200 ease-in-out`}
                        onClick={(e) => {
                            if (!disabled) {
                                e.preventDefault();
                                onChange(!checked);
                            }
                        }}
                    >
                        <span
                            className={`${currentSize.dot} ${currentSize.translate} 
                                absolute top-0.5 left-0 rounded-full bg-white dark:bg-gray-300 
                                shadow transform transition-transform duration-200 ease-in-out`}
                        />
                    </div>

                    {srText && <span className="sr-only">{srText}</span>}

                    {label && (
                        <span
                            className={`ml-3 text-sm font-medium ${disabled
                                ? 'text-gray-400 dark:text-gray-500'
                                : hasError
                                    ? 'text-red-700 dark:text-red-500'
                                    : 'text-gray-900 dark:text-gray-300'
                                }`}
                        >
                            {label}
                        </span>
                    )}
                </label>
            </div>

            {(helperText || error) && (
                <p
                    id={hasError ? `${switchId}-error` : undefined}
                    className={`mt-1 text-sm ${hasError
                        ? 'text-red-600 dark:text-red-500'
                        : 'text-gray-500 dark:text-gray-400'
                        }`}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
};
