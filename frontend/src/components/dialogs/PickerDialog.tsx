import React from 'react';
import { Button } from '../common/Button';

/**
 * Props for the item in PickerDialog
 */
export interface PickerItem {
    id: string | number;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    [key: string]: any; // Allow additional properties
}

/**
 * Props for the PickerDialog component
 */
export interface PickerDialogProps<T extends PickerItem> {
    /** Whether the dialog is visible */
    isOpen: boolean;
    /** Function to close the dialog */
    onClose: () => void;
    /** The title of the dialog */
    title: string;
    /** Optional subtext */
    subtitle?: string;
    /** List of items to choose from */
    items: T[];
    /** Selected item(s) */
    selectedItems: T[];
    /** Function called when selection changes */
    onSelectionChange: (selectedItems: T[]) => void;
    /** Whether multiple items can be selected */
    multiple?: boolean;
    /** Maximum number of items that can be selected (only applies when multiple is true) */
    maxSelections?: number;
    /** Custom template for rendering each item */
    itemTemplate?: (item: T, isSelected: boolean, onSelect: () => void) => React.ReactNode;
    /** Function to search/filter items */
    searchable?: boolean;
    /** Size of the dialog */
    size?: 'sm' | 'md' | 'lg';
    /** Additional class name */
    className?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Submit button text */
    submitText?: string;
}

/**
 * A dialog component for selecting items from a list, with optional custom templates.
 * 
 * @example
 * <PickerDialog 
 *   isOpen={isOpen} 
 *   onClose={() => setOpen(false)}
 *   title="Departman Seçin"
 *   items={departments}
 *   selectedItems={selectedDepartments}
 *   onSelectionChange={setSelectedDepartments}
 * />
 */
export const PickerDialog = <T extends PickerItem>({
    isOpen,
    onClose,
    title,
    subtitle,
    items,
    selectedItems,
    onSelectionChange,
    multiple = false,
    maxSelections,
    itemTemplate,
    searchable = false,
    size = 'md',
    className = '',
    cancelText = 'İptal',
    submitText = 'Seç',
}: PickerDialogProps<T>) => {
    // State for search term
    const [searchTerm, setSearchTerm] = React.useState('');
    // State for tracking internal selection before confirming
    const [internalSelectedItems, setInternalSelectedItems] = React.useState<T[]>(selectedItems);

    // Reset internal selection when dialog opens or selectedItems changes
    React.useEffect(() => {
        if (isOpen) {
            setInternalSelectedItems(selectedItems);
            setSearchTerm('');
        }
    }, [isOpen, selectedItems]);

    // Filter items based on search term
    const filteredItems = React.useMemo(() => {
        if (!searchTerm) return items;

        return items.filter(item =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [items, searchTerm]);

    // Check if an item is selected
    const isItemSelected = (item: T) => {
        return internalSelectedItems.some(selectedItem => selectedItem.id === item.id);
    };

    // Handle item selection
    const handleItemSelect = (item: T) => {
        if (multiple) {
            setInternalSelectedItems(prev => {
                const isSelected = isItemSelected(item);

                if (isSelected) {
                    // Remove item if already selected
                    return prev.filter(i => i.id !== item.id);
                } else {
                    // Add item, but check max selections
                    if (maxSelections && prev.length >= maxSelections) {
                        // If at max, replace the oldest selection
                        return [...prev.slice(1), item];
                    }
                    return [...prev, item];
                }
            });
        } else {
            // Single selection mode - replace selection
            setInternalSelectedItems([item]);
        }
    };

    // Handle confirmation
    const handleConfirm = () => {
        onSelectionChange(internalSelectedItems);
        onClose();
    };

    // Configure dialog size
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Background overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} aria-hidden="true"></div>

                {/* Dialog */}
                <div
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-auto z-10 overflow-hidden ${className}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="picker-dialog-title"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3
                            id="picker-dialog-title"
                            className="text-lg font-medium text-gray-900 dark:text-white"
                        >
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Search input */}
                    {searchable && (
                        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm text-sm py-2 
                                             focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
                                             dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Ara..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Items list */}
                    <div className="px-6 py-4 max-h-60 md:max-h-80 overflow-y-auto">
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">Sonuç bulunamadı</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {filteredItems.map((item) => {
                                    const isSelected = isItemSelected(item);

                                    if (itemTemplate) {
                                        // Use custom template if provided
                                        return (
                                            <li key={item.id}>
                                                {itemTemplate(item, isSelected, () => handleItemSelect(item))}
                                            </li>
                                        );
                                    }

                                    // Default item rendering
                                    return (
                                        <li key={item.id}>
                                            <div
                                                className={`p-3 rounded-md cursor-pointer flex items-center 
                                                      ${isSelected
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-500'
                                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                                onClick={() => handleItemSelect(item)}
                                            >
                                                {/* Checkbox or radio button indicator */}
                                                <div className="mr-3 flex-shrink-0">
                                                    {multiple ? (
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                                                               ${isSelected
                                                                ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                                                                : 'border-gray-300 dark:border-gray-600'}`}>
                                                            {isSelected && (
                                                                <svg className="w-3.5 h-3.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                               ${isSelected
                                                                ? 'border-blue-500 dark:border-blue-400'
                                                                : 'border-gray-400 dark:border-gray-600'}`}>
                                                            {isSelected && (
                                                                <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Icon (if provided) */}
                                                {item.icon && (
                                                    <div className="mr-3 flex-shrink-0 text-gray-500 dark:text-gray-400">
                                                        {item.icon}
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {item.label}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer with actions */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onClose}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleConfirm}
                            disabled={internalSelectedItems.length === 0}
                        >
                            {submitText} {multiple && internalSelectedItems.length > 0 && `(${internalSelectedItems.length})`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
