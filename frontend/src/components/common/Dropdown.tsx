import React, { useState, useRef, useEffect } from 'react';
import { classNames } from '../../utils/classNames';

/**
 * Represents an item in the dropdown menu
 * @interface DropdownItem
 */
export interface DropdownItem {
    /** The label of the dropdown item */
    label?: string;
    /** Optional icon to display before the label */
    icon?: React.FC<React.ComponentProps<'svg'>>;
    /** Function to execute when the item is clicked */
    onClick?: () => void;
    /** Whether the dropdown item is disabled */
    disabled?: boolean;
    /** Additional CSS classes for the dropdown item */
    className?: string;
    /** Whether this item should be rendered as a divider instead */
    divider?: boolean;
}

/**
 * Dropdown component props interface
 * @interface DropdownProps
 */
export interface DropdownProps {
    /** The element that triggers the dropdown */
    trigger: React.ReactNode;
    /** The items to display in the dropdown */
    items: DropdownItem[];
    /** The alignment of the dropdown relative to the trigger */
    align?: 'left' | 'right';
    /** The width of the dropdown */
    width?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
    /** Additional CSS classes for the dropdown */
    className?: string;
    /** Whether the dropdown is disabled */
    disabled?: boolean;
    /** Optional header content for the dropdown */
    header?: React.ReactNode;
    /** Optional footer content for the dropdown */
    footer?: React.ReactNode;
}

/**
 * Dropdown component for displaying a list of selectable options.
 */
export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    items,
    align = 'left',
    width = 'md',
    className = '',
    disabled = false,
    header,
    footer,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleItemClick = (item: DropdownItem) => {
        if (!item.disabled && item.onClick) {
            item.onClick();
            setIsOpen(false);
        }
    };

    const widthClasses = {
        auto: '',
        sm: 'w-32',
        md: 'w-48',
        lg: 'w-64',
        xl: 'w-80',
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Dropdown Trigger */}
            <div onClick={toggleDropdown}>
                {typeof trigger === 'string' ? (
                    <button
                        type="button"
                        className={classNames(
                            'inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
                            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        )}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                    >
                        {trigger}
                    </button>
                ) : (
                    <div
                        className={classNames(
                            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        )}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                    >
                        {trigger}
                    </div>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={classNames(
                        'absolute z-50 mt-1 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800',
                        align === 'right' ? 'right-0' : 'left-0',
                        widthClasses[width],
                        className
                    )}
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1">
                        {header && (
                            <div className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300">
                                {header}
                            </div>
                        )}

                        {items.map((item, index) => (
                            item.divider ? (
                                <div
                                    key={index}
                                    className="my-1 border-t border-gray-200 dark:border-gray-700"
                                    role="separator"
                                />
                            ) : (
                                <div
                                    key={index}
                                    className={classNames(
                                        'flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
                                        item.disabled ? 'cursor-not-allowed opacity-50' : '',
                                        item.className || ''
                                    )}
                                    onClick={() => handleItemClick(item)}
                                    role="menuitem"
                                    tabIndex={-1}
                                    aria-disabled={item.disabled}
                                >
                                    {item.icon && (
                                        <item.icon
                                            className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span>{item.label}</span>
                                </div>
                            )
                        ))}

                        {footer && (
                            <div className="border-t border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
