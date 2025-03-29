import React, { createContext, useContext, useState } from 'react';

/**
 * Props for the Accordion component
 */
export interface AccordionProps {
    /** The accordion's child items */
    children: React.ReactNode;
    /** Allow multiple items to be expanded at once */
    allowMultiple?: boolean;
    /** Index of the initially expanded item(s) */
    defaultExpandedIndex?: number | number[];
    /** Additional CSS classes */
    className?: string;
    /** Border style for the accordion */
    bordered?: boolean;
    /** Whether to automatically collapse other items when one is expanded */
    autoCollapse?: boolean;
    /** Variant for the accordion styling */
    variant?: 'default' | 'filled' | 'separated';
}

/**
 * Context to share state between Accordion and AccordionItem
 */
interface AccordionContextType {
    /** Set of expanded item indexes */
    expandedIndexes: Set<number>;
    /** Function to toggle an accordion item's expanded state */
    toggleItem: (index: number) => void;
    /** Index of the current active item to track active state */
    currentIndex: number;
    /** Visual style variant */
    variant: 'default' | 'filled' | 'separated';
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

/**
 * Hook to use accordion context in children components
 */
export const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error('useAccordion must be used within an Accordion component');
    }
    return context;
};

/**
 * A component for displaying collapsible accordion items.
 * 
 * @example
 * <Accordion defaultExpandedIndex={0}>
 *   <AccordionItem title="Bölüm 1">
 *     <p>Bölüm 1 içeriği burada yer alır.</p>
 *   </AccordionItem>
 *   <AccordionItem title="Bölüm 2">
 *     <p>Bölüm 2 içeriği burada yer alır.</p>
 *   </AccordionItem>
 * </Accordion>
 */
export const Accordion: React.FC<AccordionProps> = ({
    children,
    allowMultiple = false,
    defaultExpandedIndex,
    className = '',
    bordered = true,
    autoCollapse = !allowMultiple,
    variant = 'default',
}) => {
    // Initialize expanded indexes based on defaultExpandedIndex prop
    const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(() => {
        const expanded = new Set<number>();

        if (typeof defaultExpandedIndex === 'number') {
            expanded.add(defaultExpandedIndex);
        } else if (Array.isArray(defaultExpandedIndex)) {
            defaultExpandedIndex.forEach(index => expanded.add(index));
        }

        return expanded;
    });

    // Track the current index for potential animations or active styles
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    // Toggle the expanded state of an accordion item
    const toggleItem = (index: number) => {
        setCurrentIndex(index);

        setExpandedIndexes(prev => {
            const newSet = new Set(prev);

            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                if (autoCollapse) {
                    newSet.clear();
                }
                newSet.add(index);
            }

            return newSet;
        });
    };

    // Define variant-specific classes
    const variantClasses = {
        default: bordered ? 'border border-gray-200 dark:border-gray-700 rounded-md' : '',
        filled: 'bg-gray-50 dark:bg-gray-800 rounded-md',
        separated: 'space-y-2',
    };

    return (
        <div className={`accordion ${variantClasses[variant]} ${className}`}>
            <AccordionContext.Provider value={{ expandedIndexes, toggleItem, currentIndex, variant }}>
                {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child)) {
                        // Type assertion to specify that the child accepts index prop
                        return React.cloneElement(child as React.ReactElement<{ index?: number }>, {
                            index,
                            // Pass other necessary props here
                        });
                    }
                    return child;
                })}
            </AccordionContext.Provider>
        </div>
    );
};
