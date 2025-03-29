import React, { useState } from 'react';
import { classNames } from '../../utils/classNames';

export type ListGroupVariant = 'default' | 'subtle' | 'bold';
export type ListGroupSize = 'sm' | 'md' | 'lg';

export interface ListGroupItemProps {
    /** The content of the item */
    children: React.ReactNode;
    /** Whether the item is active */
    active?: boolean;
    /** Whether the item is disabled */
    disabled?: boolean;
    /** Optional function to call when the item is clicked */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Optional badge content to display */
    badge?: React.ReactNode;
    /** Optional icon to display at the start */
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    /** Whether to add a hover effect */
    hover?: boolean;
    /** Collapsible content */
    collapsibleContent?: React.ReactNode;
    /** Variant style */
    variant?: ListGroupVariant;
    /** Size of the item */
    size?: ListGroupSize;
}

export interface ListGroupProps {
    /** The items to display */
    children: React.ReactNode;
    /** Whether to flush out the border */
    flush?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Whether to make items horizontally aligned */
    horizontal?: boolean;
    /** Whether to allow multiple collapsible items open at once */
    multiple?: boolean;
    /** Variant style for the group */
    variant?: ListGroupVariant;
    /** Size of the group */
    size?: ListGroupSize;
}

/**
 * ListGroupItem component for displaying individual items in a ListGroup.
 */
export const ListGroupItem: React.FC<ListGroupItemProps> = ({
    children,
    active = false,
    disabled = false,
    onClick,
    className = '',
    badge,
    icon: Icon,
    hover = true,
    collapsibleContent,
    variant = 'default',
    size = 'md',
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
    };

    const variantClasses = {
        default: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200',
        subtle: 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300',
        bold: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold',
    };

    const handleClick = () => {
        if (disabled) return;
        if (collapsibleContent) setIsOpen(!isOpen);
        if (onClick) onClick();
    };

    return (
        <div className={classNames('border-b border-gray-200 dark:border-gray-700 last:border-b-0')}>
            <div
                className={classNames(
                    'flex items-center transition-all duration-200',
                    sizeClasses[size],
                    variantClasses[variant],
                    onClick && !disabled ? 'cursor-pointer' : 'cursor-default',
                    hover && !disabled ? 'hover:bg-gray-100 dark:hover:bg-gray-600' : '',
                    active
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                        : '',
                    disabled
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                        : '',
                    className
                )}
                onClick={handleClick}
                aria-disabled={disabled}
                role={onClick || collapsibleContent ? 'button' : undefined}
            >
                {Icon && (
                    <Icon
                        className={classNames(
                            'mr-3 h-5 w-5 flex-shrink-0',
                            active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                        )}
                        aria-hidden="true"
                    />
                )}
                <div className="flex-grow">{children}</div>
                {badge && (
                    <div className="ml-2 flex-shrink-0">{badge}</div>
                )}
                {collapsibleContent && (
                    <svg
                        className={classNames(
                            'ml-2 h-4 w-4 transition-transform duration-200',
                            isOpen ? 'rotate-180' : 'rotate-0'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </div>
            {collapsibleContent && (
                <div
                    className={classNames(
                        'overflow-hidden transition-all duration-300',
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}
                >
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {collapsibleContent}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * ListGroup component for displaying a series of related items.
 */
export const ListGroup: React.FC<ListGroupProps> = ({
    children,
    flush = false,
    className = '',
    horizontal = false,
    variant = 'default',
    size = 'md',
}) => {
    return (
        <div
            className={classNames(
                'overflow-hidden rounded-lg shadow-sm',
                flush ? 'border-0' : 'border border-gray-200 dark:border-gray-700',
                horizontal ? 'flex flex-wrap' : '',
                className
            )}
            role="list"
        >
            {React.Children.map(children, (child) => {
                if (React.isValidElement<ListGroupItemProps>(child)) {
                    return React.cloneElement(child, { variant, size, hover: true });
                }
                return child;
            })}
        </div>
    );
};

export default ListGroup;