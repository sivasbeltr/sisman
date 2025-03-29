import React, { useRef, useState, useEffect } from 'react';
import { useAccordion } from './Accordion';

/**
 * Props for the AccordionItem component
 */
export interface AccordionItemProps {
    /** Title displayed in the header */
    title: React.ReactNode;
    /** Content displayed when expanded */
    children: React.ReactNode;
    /** Optional icon to display before the title */
    icon?: React.ReactNode;
    /** Whether the item is disabled */
    disabled?: boolean;
    /** CSS class for the container */
    className?: string;
    /** CSS class for the header */
    headerClassName?: string;
    /** CSS class for the content */
    contentClassName?: string;
    /** Optional custom expand/collapse icon */
    expandIcon?: React.ReactNode;
    /** Optional custom collapse icon */
    collapseIcon?: React.ReactNode;
    /** Item index (set internally by Accordion) */
    index?: number;
}

/**
 * Represents a collapsible item within an Accordion.
 * 
 * @example
 * <AccordionItem 
 *   title="Sık Sorulan Sorular" 
 *   icon={<QuestionMarkIcon />}
 * >
 *   <p>Burada sorulara cevaplar yer alır.</p>
 * </AccordionItem>
 */
export const AccordionItem: React.FC<AccordionItemProps> = ({
    title,
    children,
    icon,
    disabled = false,
    className = '',
    headerClassName = '',
    contentClassName = '',
    expandIcon,
    collapseIcon,
    index = 0,
}) => {
    // Get accordion context from parent
    const { expandedIndexes, toggleItem, variant } = useAccordion();

    // Refs for content height calculation
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);

    // Track if this item is expanded
    const isExpanded = expandedIndexes.has(index);

    // Update content height when expanded state changes or children change
    useEffect(() => {
        if (isExpanded && contentRef.current) {
            // Get the height of the content
            setContentHeight(contentRef.current.scrollHeight);
        } else {
            setContentHeight(0);
        }
    }, [isExpanded, children]);

    // Handle click on the accordion header
    const handleToggle = () => {
        if (!disabled) {
            toggleItem(index);
        }
    };

    // Determine item-specific classes based on state and variant
    const getItemClasses = () => {
        const baseClasses = 'transition-colors';

        switch (variant) {
            case 'separated':
                return `${baseClasses} rounded-md border border-gray-200 dark:border-gray-700 ${isExpanded ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}`;
            case 'filled':
                return `${baseClasses} ${isExpanded ? 'bg-gray-100 dark:bg-gray-700' : ''}`;
            default:
                return `${baseClasses} ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''} 
                ${variant === 'default' ? 'border-b border-gray-200 dark:border-gray-700 last:border-b-0' : ''}`;
        }
    };

    // Default expand/collapse icons
    const defaultExpandIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );

    const defaultCollapseIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
    );

    return (
        <div className={`accordion-item ${getItemClasses()} ${className}`}>
            {/* Header */}
            <h3 className="m-0">
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={disabled}
                    aria-expanded={isExpanded}
                    className={`
            flex items-center justify-between w-full text-left py-3 px-4
            font-medium text-gray-900 dark:text-white
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${headerClassName}
          `}
                >
                    <span className="flex items-center">
                        {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
                        <span className="text-sm sm:text-base">{title}</span>
                    </span>

                    <span className="ml-2 flex-shrink-0 transition-transform duration-200 ease-in-out">
                        {isExpanded
                            ? (collapseIcon || defaultCollapseIcon)
                            : (expandIcon || defaultExpandIcon)
                        }
                    </span>
                </button>
            </h3>

            {/* Content */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${contentClassName}`}
                style={{ height: isExpanded ? `${contentHeight}px` : '0' }}
                aria-hidden={!isExpanded}
            >
                <div ref={contentRef} className="p-4 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
};
