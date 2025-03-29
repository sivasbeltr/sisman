import React, { forwardRef } from 'react';

/**
 * Option interface for Select component
 */
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

/**
 * Props for the Select component
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    /** Options to display in the select dropdown */
    options: SelectOption[];
    /** Optional placeholder text (renders as disabled first option) */
    placeholder?: string;
    /** Select label */
    label?: string;
    /** Helper text displayed below the select */
    helperText?: string;
    /** Error message to display */
    error?: string;
    /** Whether the field is in loading state */
    isLoading?: boolean;
    /** Full width select */
    fullWidth?: boolean;
    /** Additional class name for the wrapper */
    wrapperClassName?: string;
    /** Custom size of the select field */
    customSize?: 'sm' | 'md' | 'lg';
}

/**
 * Select component for dropdown selection with support for labels and validation.
 * 
 * @example
 * <Select
 *   label="Departman"
 *   placeholder="Departman seçiniz"
 *   options={[
 *     { value: '1', label: 'IT' },
 *     { value: '2', label: 'İnsan Kaynakları' }
 *   ]}
 *   value={departmentId}
 *   onChange={(e) => setDepartmentId(e.target.value)}
 *   error={errors.departmentId}
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({
        id,
        label,
        options,
        placeholder,
        helperText,
        error,
        className = '',
        disabled = false,
        isLoading = false,
        fullWidth = false,
        wrapperClassName = '',
        required,
        customSize = 'md',
        ...rest
    }, ref) => {
        // Generate a unique ID if not provided
        const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
        const hasError = !!error;

        // Size classes
        const sizeClasses = {
            sm: 'py-1 pl-2 pr-7 text-xs',
            md: 'py-2 pl-3 pr-10 text-sm',
            lg: 'py-3 pl-4 pr-12 text-base',
        };

        // Select style classes
        const selectBaseClasses =
            'block w-full rounded-md shadow-sm border focus:outline-none focus:ring-1';

        const selectStateClasses = hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400';

        const selectAppearanceClasses = disabled || isLoading
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

        const selectClasses = `${selectBaseClasses} ${sizeClasses[customSize]} ${selectStateClasses} ${selectAppearanceClasses} ${className}`;

        // Width classes
        const widthClasses = fullWidth ? 'w-full' : '';

        return (
            <div className={`${widthClasses} ${wrapperClassName}`}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className={`block text-sm font-medium mb-1 ${hasError
                            ? 'text-red-700 dark:text-red-500'
                            : 'text-gray-700 dark:text-gray-300'}`}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        disabled={disabled || isLoading}
                        required={required}
                        className={selectClasses}
                        aria-invalid={hasError ? 'true' : 'false'}
                        aria-errormessage={hasError ? `${selectId}-error` : undefined}
                        {...rest}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}

                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Custom dropdown arrow */}
                    <div className={`pointer-events-none absolute inset-y-0 right-0 ${customSize === 'sm' ? 'px-1.5' : customSize === 'lg' ? 'px-3' : 'px-2'} flex items-center text-gray-700 dark:text-gray-300`}>
                        <svg className={`${customSize === 'sm' ? 'h-4 w-4' : customSize === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {isLoading && (
                        <div className={`absolute inset-y-0 right-0 ${customSize === 'sm' ? 'mr-6' : customSize === 'lg' ? 'mr-10' : 'mr-8'} flex items-center`}>
                            <svg className={`animate-spin ${customSize === 'sm' ? 'h-3 w-3' : customSize === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} text-gray-400`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </div>

                {(helperText || error) && (
                    <p
                        id={hasError ? `${selectId}-error` : undefined}
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

Select.displayName = 'Select';
