import React, { forwardRef } from 'react';

/**
 * Props for the DatePicker component
 */
export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Input label */
    label?: string;
    /** Helper text displayed below the input */
    helperText?: string;
    /** Error message to display */
    error?: string;
    /** Whether the field is in loading state */
    isLoading?: boolean;
    /** Full width input */
    fullWidth?: boolean;
    /** Additional class name for the wrapper */
    wrapperClassName?: string;
}

/**
 * DatePicker component for date input with support for labels and validation.
 * 
 * @example
 * <DatePicker
 *   label="Doğum Tarihi"
 *   value={birthdate}
 *   onChange={(e) => setBirthdate(e.target.value)}
 *   error={errors.birthdate}
 * />
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({
        id,
        label,
        helperText,
        error,
        className = '',
        disabled = false,
        isLoading = false,
        fullWidth = false,
        wrapperClassName = '',
        required,
        ...rest
    }, ref) => {
        // Generate a unique ID if not provided
        const inputId = id || `date-${Math.random().toString(36).substring(2, 9)}`;
        const hasError = !!error;

        // Input style classes
        const inputBaseClasses =
            'block w-full rounded-md shadow-sm border focus:outline-none focus:ring-1 py-2 px-3 text-sm';

        const inputStateClasses = hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400';

        const inputAppearanceClasses = disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

        const inputClasses = `${inputBaseClasses} ${inputStateClasses} ${inputAppearanceClasses} ${className}`;

        // Width classes
        const widthClasses = fullWidth ? 'w-full' : '';

        return (
            <div className={`${widthClasses} ${wrapperClassName}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`block text-sm font-medium mb-1 ${hasError
                            ? 'text-red-700 dark:text-red-500'
                            : 'text-gray-700 dark:text-gray-300'}`}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    <input
                        id={inputId}
                        ref={ref}
                        type="date"
                        disabled={disabled || isLoading}
                        required={required}
                        className={inputClasses}
                        aria-invalid={hasError ? 'true' : 'false'}
                        aria-errormessage={hasError ? `${inputId}-error` : undefined}
                        {...rest}
                    />

                    {isLoading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </div>

                {(helperText || error) && (
                    <p
                        id={hasError ? `${inputId}-error` : undefined}
                        className={`mt-1 text-sm ${hasError
                            ? 'text-red-600 dark:text-red-500'
                            : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

DatePicker.displayName = 'DatePicker';
