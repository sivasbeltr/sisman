import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

export interface AutoCompleteItem {
    id: string | number;
    label: string;
    [key: string]: any;
}

export interface AutoCompleteProps<T extends AutoCompleteItem> {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (item: T) => void;
    label?: string;
    placeholder?: string;
    apiUrl?: string;
    items?: T[];
    transformResponse?: (data: any) => T[];
    minChars?: number;
    debounceMs?: number;
    helperText?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    isLoading?: boolean;
    className?: string;
    wrapperClassName?: string;
    size?: 'sm' | 'md' | 'lg';
    itemTemplate?: (item: T, isHighlighted: boolean) => React.ReactNode;
    displayMode?: 'list' | 'grid' | 'table';
    maxHeight?: number;
    maxItems?: number;
    filterFunction?: (item: T, query: string) => boolean;
    queryParams?: Record<string, string>;
}

export const AutoComplete = <T extends AutoCompleteItem>({
    value,
    onChange,
    onSelect,
    label,
    placeholder,
    apiUrl,
    items: staticItems,
    transformResponse,
    minChars = 2,
    debounceMs = 300,
    helperText,
    error,
    disabled = false,
    required = false,
    isLoading: externalLoading = false,
    className = '',
    wrapperClassName = '',
    size = 'md',
    itemTemplate,
    displayMode = 'list',
    maxHeight = 250,
    maxItems = 10,
    filterFunction,
    queryParams = {},
}: AutoCompleteProps<T>) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<T[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const requestRef = useRef<AbortController | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debouncedValue = useDebounce(value, debounceMs);
    const hasError = !!error || !!errorMessage;

    const inputId = `autocomplete-${Math.random().toString(36).substring(2, 9)}`;
    const listId = `${inputId}-list`;

    const sizeClasses = {
        sm: 'py-1 px-2 text-xs',
        md: 'py-2 px-3 text-sm',
        lg: 'py-3 px-4 text-base',
    };

    const filteredStaticItems = useMemo(() => {
        if (!staticItems || !value || value.length < minChars) return [];

        if (filterFunction) {
            return staticItems.filter(item => filterFunction(item, value)).slice(0, maxItems);
        }

        return staticItems
            .filter(item => item.label.toLowerCase().includes(value.toLowerCase()))
            .slice(0, maxItems);
    }, [staticItems, value, minChars, filterFunction, maxItems]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!results.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && results[highlightedIndex]) {
                    handleItemSelect(results[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsFocused(false);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (requestRef.current) {
            requestRef.current.abort();
            requestRef.current = null;
        }

        if (disabled || !debouncedValue || debouncedValue.length < minChars) {
            if (isMounted) {
                setResults([]);
                setHighlightedIndex(-1);
                setIsLoading(false);
                setErrorMessage(null);
            }
            return;
        }

        if (staticItems) {
            if (isMounted) {
                setResults(filteredStaticItems);
                setIsLoading(false);
                setErrorMessage(null);
            }
            return;
        }

        if (!apiUrl) {
            if (isMounted) {
                setResults([]);
                setIsLoading(false);
                setErrorMessage(null);
            }
            return;
        }

        const fetchResults = async () => {
            if (isMounted) {
                setIsLoading(true);
                setErrorMessage(null);
            }

            const abortController = new AbortController();
            requestRef.current = abortController;

            try {
                const queryString = new URLSearchParams({
                    q: debouncedValue,
                    ...queryParams,
                }).toString();

                const url = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${queryString}`;
                const response = await fetch(url, { signal: abortController.signal });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();

                if (!isMounted || abortController.signal.aborted) {
                    return;
                }

                let processedData: T[] = [];
                if (transformResponse) {
                    processedData = transformResponse(data);
                } else if (Array.isArray(data)) {
                    processedData = data;
                }

                if (isMounted) {
                    setResults(processedData.slice(0, maxItems));
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                console.error('AutoComplete fetch error:', error);
                if (isMounted) {
                    setErrorMessage('Sonuçlar alınamadı. Lütfen daha sonra tekrar deneyiniz.');
                    setResults([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchResults();

        return () => {
            isMounted = false;
            if (requestRef.current) {
                requestRef.current.abort();
            }
        };
    }, [debouncedValue, apiUrl, staticItems, minChars, disabled, maxItems]); // transformResponse ve queryParams çıkarıldı

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemSelect = (item: T) => {
        onChange(item.label);
        if (onSelect) onSelect(item);
        setIsFocused(false);
        setResults([]);
        setHighlightedIndex(-1);
    };

    const getResultContent = () => {
        if (results.length === 0) return null;

        if (displayMode === 'grid') {
            return (
                <div className="grid grid-cols-2 gap-2">
                    {results.map((item, index) => (
                        <div
                            key={item.id}
                            className={`p-2 cursor-pointer rounded ${index === highlightedIndex ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onClick={() => handleItemSelect(item)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            {itemTemplate ? itemTemplate(item, index === highlightedIndex) : item.label}
                        </div>
                    ))}
                </div>
            );
        }

        if (displayMode === 'table') {
            return (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {results.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`${index === highlightedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} cursor-pointer`}
                                onClick={() => handleItemSelect(item)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                <td className="p-2">
                                    {itemTemplate ? itemTemplate(item, index === highlightedIndex) : item.label}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <ul className="py-1" role="listbox" id={listId}>
                {results.map((item, index) => (
                    <li
                        key={item.id}
                        role="option"
                        aria-selected={index === highlightedIndex}
                        className={`px-4 py-2 cursor-pointer ${index === highlightedIndex ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        onClick={() => handleItemSelect(item)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                    >
                        {itemTemplate ? itemTemplate(item, index === highlightedIndex) : item.label}
                    </li>
                ))}
            </ul>
        );
    };

    const inputClasses = `
        block w-full rounded-md shadow-sm border
        ${sizeClasses[size]}
        ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'}
        ${disabled || externalLoading ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'}
        focus:outline-none focus:ring-1
        ${className}
    `;

    const showDropdown = isFocused && value.length >= minChars && !disabled && (results.length > 0 || isLoading || errorMessage);

    return (
        <div className={`relative ${wrapperClassName}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={`block text-sm font-medium mb-1 ${hasError ? 'text-red-700 dark:text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    id={inputId}
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={showDropdown ? 'true' : 'false'}
                    aria-autocomplete="list"
                    aria-controls={listId}
                    aria-activedescendant={highlightedIndex >= 0 ? `${listId}-item-${highlightedIndex}` : undefined}
                    className={inputClasses}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || externalLoading}
                    required={required}
                    autoComplete="off"
                />

                {(isLoading || externalLoading) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg
                            className={`animate-spin ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} text-gray-400`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                )}
            </div>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden"
                    style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto' }}
                >
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
                    ) : errorMessage ? (
                        <div className="p-4 text-center text-red-500 dark:text-red-400">{errorMessage}</div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">Sonuç bulunamadı</div>
                    ) : (
                        getResultContent()
                    )}
                </div>
            )}

            {(helperText || error) && (
                <p className={`mt-1 text-sm ${hasError ? 'text-red-600 dark:text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};