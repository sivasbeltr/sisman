import React from 'react';

/**
 * Radio option interface
 */
export interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

/**
 * Props for the RadioGroup component
 */
export interface RadioGroupProps {
    /** Radio group label */
    label?: string;
    /** Name attribute for the radio inputs */
    name: string;
    /** Array of radio options */
    options: RadioOption[];
    /** Current selected value */
    value?: string;
    /** onChange handler */
    onChange?: (value: string) => void;
    /** Helper text displayed below the radio group */
    helperText?: string;
    /** Error message to display */
    error?: string;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Whether the field is required */
    required?: boolean;
    /** Layout direction */
    direction?: 'horizontal' | 'vertical';
    /** Additional class name for the wrapper */
    className?: string;
}

/**
 * RadioGroup component for selecting one option from a list.
 * 
 * @example
 * <RadioGroup
 *   label="Cinsiyet"
 *   name="gender"
 *   options={[
 *     { value: 'male', label: 'Erkek' },
 *     { value: 'female', label: 'Kadın' },
 *     { value: 'other', label: 'Diğer' }
 *   ]}
 *   value={gender}
 *   onChange={(value) => setGender(value)}
 * />
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    name,
    options,
    value = '',
    onChange,
    helperText,
    error,
    disabled = false,
    required = false,
    direction = 'vertical',
    className = '',
}) => {
    // Generate a unique ID for the group
    const groupId = `radio-group-${Math.random().toString(36).substring(2, 9)}`;
    const hasError = !!error;

    // Handle radio change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className={`${className}`}>
            {label && (
                <div
                    id={groupId}
                    className={`block text-sm font-medium mb-2 ${hasError
                        ? 'text-red-700 dark:text-red-500'
                        : 'text-gray-700 dark:text-gray-300'
                        }`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </div>
            )}

            <div
                role="radiogroup"
                aria-labelledby={label ? groupId : undefined}
                className={`${direction === 'horizontal' ? 'flex flex-wrap gap-x-6' : 'space-y-4'}`}
            >
                {options.map((option) => {
                    const optionId = `${name}-${option.value}`;
                    const isChecked = value === option.value;
                    const isOptionDisabled = disabled || option.disabled;

                    return (
                        <div key={option.value} className="flex items-center">
                            <div className="relative flex items-center">
                                {/* Hidden original radio input */}
                                <input
                                    id={optionId}
                                    name={name}
                                    type="radio"
                                    value={option.value}
                                    checked={isChecked}
                                    onChange={handleChange}
                                    disabled={isOptionDisabled}
                                    className="sr-only" // Hide the actual input
                                    aria-invalid={hasError ? 'true' : 'false'}
                                />

                                {/* Custom styled radio button */}
                                <div className={`
                                    w-5 h-5 flex items-center justify-center rounded-full
                                    border-2 mr-2 
                                    ${isChecked
                                        ? 'border-blue-500 dark:border-blue-400'
                                        : 'border-gray-400 dark:border-gray-600'}
                                    ${isOptionDisabled
                                        ? 'opacity-60 cursor-not-allowed'
                                        : 'cursor-pointer'}
                                    ${hasError
                                        ? '!border-red-500 dark:!border-red-400'
                                        : ''}
                                `}>
                                    {/* Inner circle for selected state */}
                                    {isChecked && (
                                        <div className={`
                                            w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400
                                            ${isOptionDisabled ? 'opacity-60' : ''}
                                            ${hasError ? '!bg-red-500 dark:!bg-red-400' : ''}
                                        `}></div>
                                    )}
                                </div>

                                <label
                                    htmlFor={optionId}
                                    className={`text-sm font-medium 
                                        ${isOptionDisabled
                                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'text-gray-700 dark:text-gray-300 cursor-pointer'
                                        }
                                    `}
                                >
                                    {option.label}
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>

            {(helperText || error) && (
                <p
                    id={hasError ? `${groupId}-error` : undefined}
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
