import React, { forwardRef } from 'react';

/**
 * Props for the TextField component
 */
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Input label */
    label?: string;
    /** Helper text displayed below the input */
    helperText?: string;
    /** Error message to display */
    error?: string;
    /** Whether the field is in loading state */
    isLoading?: boolean;
    /** Optional start icon/element */
    startAdornment?: React.ReactNode;
    /** Optional end icon/element */
    endAdornment?: React.ReactNode;
    /** Full width input */
    fullWidth?: boolean;
    /** Additional class name for the wrapper */
    wrapperClassName?: string;
    /** Custom size of the input field */
    customSize?: 'sm' | 'md' | 'lg';
}

/**
 * TextField component for text input with support for labels, validation, and adornments.
 * 
 * @example
 * <TextField
 *   label="Ad"
 *   placeholder="Adınızı giriniz"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   error={errors.name}
 * />
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
    ({
        id,
        label,
        helperText,
        error,
        className = '',
        disabled = false,
        isLoading = false,
        startAdornment,
        endAdornment,
        fullWidth = false,
        wrapperClassName = '',
        required,
        customSize = 'md',
        ...rest
    }, ref) => {
        // Generate a unique ID if not provided
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
        const hasError = !!error;

        // Input size classes
        const sizeClasses = {
            sm: 'py-1 px-2 text-xs',
            md: 'py-2 px-3 text-sm',
            lg: 'py-3 px-4 text-base',
        };

        // Input style classes
        const inputBaseClasses =
            'block w-full rounded-md shadow-sm border focus:outline-none focus:ring-1';

        const inputStateClasses = hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400';

        const inputAppearanceClasses = disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

        const inputClasses = `${inputBaseClasses} ${sizeClasses[customSize]} ${inputStateClasses} ${inputAppearanceClasses} ${className}`;

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
                    {startAdornment && (
                        <div className={`absolute inset-y-0 left-0 ${customSize === 'sm' ? 'pl-2' : customSize === 'lg' ? 'pl-4' : 'pl-3'} flex items-center pointer-events-none`}>
                            <span className="text-gray-500 dark:text-gray-400">{startAdornment}</span>
                        </div>
                    )}

                    <input
                        id={inputId}
                        ref={ref}
                        disabled={disabled || isLoading}
                        required={required}
                        className={`
                            ${inputClasses}
                            ${startAdornment ? (customSize === 'sm' ? 'pl-7' : customSize === 'lg' ? 'pl-12' : 'pl-10') : ''}
                            ${endAdornment || isLoading ? (customSize === 'sm' ? 'pr-7' : customSize === 'lg' ? 'pr-12' : 'pr-10') : ''}
                        `}
                        aria-invalid={hasError ? 'true' : 'false'}
                        aria-errormessage={hasError ? `${inputId}-error` : undefined}
                        {...rest}
                    />

                    {isLoading && (
                        <div className={`absolute inset-y-0 right-0 ${customSize === 'sm' ? 'pr-2' : customSize === 'lg' ? 'pr-4' : 'pr-3'} flex items-center`}>
                            <svg className={`animate-spin ${customSize === 'sm' ? 'h-4 w-4' : customSize === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} text-gray-400`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}

                    {endAdornment && !isLoading && (
                        <div className={`absolute inset-y-0 right-0 ${customSize === 'sm' ? 'pr-2' : customSize === 'lg' ? 'pr-4' : 'pr-3'} flex items-center`}>
                            <span className="text-gray-500 dark:text-gray-400">{endAdornment}</span>
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

TextField.displayName = 'TextField';
