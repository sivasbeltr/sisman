import React, { forwardRef } from 'react';

/**
 * Props for the TextArea component
 */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** TextArea label */
    label?: string;
    /** Helper text displayed below the textarea */
    helperText?: string;
    /** Error message to display */
    error?: string;
    /** Whether the field is in loading state */
    isLoading?: boolean;
    /** Full width textarea */
    fullWidth?: boolean;
    /** Additional class name for the wrapper */
    wrapperClassName?: string;
    /** Size of the textarea */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * TextArea component for multi-line text input with support for labels and validation.
 * 
 * @example
 * <TextArea
 *   label="Açıklama"
 *   placeholder="Açıklamanızı giriniz"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   error={errors.description}
 * />
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
        rows = 3,
        size = 'md',
        ...rest
    }, ref) => {
        // Generate a unique ID if not provided
        const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
        const hasError = !!error;

        // Size classes
        const sizeClasses = {
            sm: 'py-1 px-2 text-xs',
            md: 'py-2 px-3 text-sm',
            lg: 'py-3 px-4 text-base',
        };

        // TextArea style classes
        const textareaBaseClasses =
            'block w-full rounded-md shadow-sm border focus:outline-none focus:ring-1 resize-y';

        const textareaStateClasses = hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400';

        const textareaAppearanceClasses = disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';

        const textareaClasses = `${textareaBaseClasses} ${sizeClasses[size]} ${textareaStateClasses} ${textareaAppearanceClasses} ${className}`;

        // Width classes
        const widthClasses = fullWidth ? 'w-full' : '';

        return (
            <div className={`${widthClasses} ${wrapperClassName}`}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className={`block text-sm font-medium mb-1 ${hasError
                            ? 'text-red-700 dark:text-red-500'
                            : 'text-gray-700 dark:text-gray-300'}`}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    <textarea
                        id={textareaId}
                        ref={ref}
                        rows={rows}
                        disabled={disabled || isLoading}
                        required={required}
                        className={textareaClasses}
                        aria-invalid={hasError ? 'true' : 'false'}
                        aria-errormessage={hasError ? `${textareaId}-error` : undefined}
                        {...rest}
                    />

                    {isLoading && (
                        <div className={`absolute top-2 right-2 ${size === 'sm' ? 'top-1 right-1' : size === 'lg' ? 'top-3 right-3' : ''}`}>
                            <svg className={`animate-spin ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} text-gray-400`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </div>

                {(helperText || error) && (
                    <p
                        id={hasError ? `${textareaId}-error` : undefined}
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

TextArea.displayName = 'TextArea';
