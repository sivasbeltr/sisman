import React, { forwardRef } from 'react';

/**
 * Props for the Checkbox component
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /** Checkbox label */
    label: string;
    /** Helper text displayed below the checkbox */
    helperText?: string;
    /** Error message to display */
    error?: string;
    /** Whether the field is in loading state */
    isLoading?: boolean;
    /** Additional class name for the wrapper */
    wrapperClassName?: string;
}

/**
 * Checkbox component with support for labels and validation.
 * 
 * @example
 * <Checkbox
 *   label="Kullanım şartlarını kabul ediyorum"
 *   checked={accepted}
 *   onChange={(e) => setAccepted(e.target.checked)}
 *   error={errors.accepted}
 * />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({
        id,
        label,
        helperText,
        error,
        className = '',
        disabled = false,
        isLoading = false,
        wrapperClassName = '',
        checked,
        onChange,
        ...rest
    }, ref) => {
        // Generate a unique ID if not provided
        const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
        const hasError = !!error;

        // Handle checkbox change to ensure the onChange event is properly handled
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onChange && !disabled && !isLoading) {
                onChange(e);
            }
        };

        // Direct state update when clicking on the custom checkbox element
        const handleCustomCheckboxClick = () => {
            if (onChange && !disabled && !isLoading) {
                // Create a synthetic event that mimics a checkbox change
                const syntheticEvent = {
                    target: {
                        checked: !checked,
                        name: rest.name,
                        value: rest.value
                    },
                    preventDefault: () => { },
                    stopPropagation: () => { }
                } as React.ChangeEvent<HTMLInputElement>;

                onChange(syntheticEvent);
            }
        };

        return (
            <div className={`flex items-start ${wrapperClassName}`}>
                <div className="flex items-center h-5">
                    {/* Hidden actual checkbox for accessibility */}
                    <input
                        type="checkbox"
                        id={checkboxId}
                        ref={ref}
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled || isLoading}
                        className="sr-only"
                        aria-invalid={hasError ? 'true' : 'false'}
                        aria-errormessage={hasError ? `${checkboxId}-error` : undefined}
                        {...rest}
                    />

                    {/* Custom styled checkbox */}
                    <div
                        onClick={handleCustomCheckboxClick}
                        className={`
                            w-5 h-5 flex items-center justify-center rounded
                            border-2 cursor-pointer
                            ${checked
                                ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                                : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'}
                            ${disabled || isLoading
                                ? 'opacity-60 cursor-not-allowed'
                                : 'hover:border-blue-400 dark:hover:border-blue-500'}
                            ${hasError
                                ? '!border-red-500 dark:!border-red-400'
                                : ''}
                            transition-colors duration-200
                        `}
                        role="checkbox"
                        aria-checked={checked}
                        tabIndex={disabled ? -1 : 0}
                    >
                        {checked && (
                            <svg
                                className="w-3.5 h-3.5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </div>

                    {isLoading && (
                        <svg className="animate-spin ml-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                </div>

                <div className="ml-3 text-sm">
                    <label
                        htmlFor={checkboxId}
                        className={`font-medium ${disabled || isLoading
                                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : hasError
                                    ? 'text-red-700 dark:text-red-500 cursor-pointer'
                                    : 'text-gray-700 dark:text-gray-300 cursor-pointer'
                            }`}
                        onClick={disabled || isLoading ? undefined : handleCustomCheckboxClick}
                    >
                        {label}
                    </label>

                    {(helperText || error) && (
                        <p
                            id={hasError ? `${checkboxId}-error` : undefined}
                            className={`mt-1 ${hasError
                                ? 'text-red-600 dark:text-red-500'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            {error || helperText}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
