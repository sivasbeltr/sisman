import React, { useState, useEffect, Children, isValidElement } from 'react';
import { TabPageProps } from './TabPage';

/**
 * Props for the TabBar component
 */
export interface TabBarProps {
    /** Default active tab value */
    defaultActiveTab?: string;
    /** Current active tab value (controlled mode) */
    activeTab?: string;
    /** Handler for tab change (controlled mode) */
    onTabChange?: (value: string) => void;
    /** Additional class names */
    className?: string;
    /** TabPage components as children */
    children: React.ReactNode;
}

/**
 * A tab navigation component that displays a list of selectable tabs.
 * Automatically adapts to light and dark themes.
 * 
 * @example
 * <TabBar defaultActiveTab="tab1">
 *   <TabPage value="tab1" label="First Tab">Content 1</TabPage>
 *   <TabPage value="tab2" label="Second Tab">Content 2</TabPage>
 * </TabBar>
 */
export const TabBar: React.FC<TabBarProps> = ({
    defaultActiveTab,
    activeTab: controlledActiveTab,
    onTabChange,
    className = '',
    children,
}) => {
    // Extract tab information from children
    const tabPages = Children.toArray(children)
        .filter(child =>
            isValidElement(child) &&
            typeof child.type === 'function' &&
            // Check for TabPage by looking at expected props
            isValidElement<TabPageProps>(child) && 'value' in child.props &&
            'label' in child.props
        )
        .map(child => {
            const tabPage = child as React.ReactElement<TabPageProps>;
            return {
                value: tabPage.props.value,
                label: tabPage.props.label,
                icon: tabPage.props.icon,
                disabled: tabPage.props.disabled,
            };
        });

    // Determine the first available tab value for default
    const firstTabValue = tabPages.length > 0 ? tabPages[0].value : '';

    // Local state for uncontrolled component
    const [localActiveTab, setLocalActiveTab] = useState<string>(
        defaultActiveTab || firstTabValue
    );

    // Determine if component is controlled or uncontrolled
    const isControlled = controlledActiveTab !== undefined;
    const currentActiveTab = isControlled ? controlledActiveTab : localActiveTab;

    // Update local state if defaultActiveTab changes
    useEffect(() => {
        if (!isControlled && defaultActiveTab) {
            setLocalActiveTab(defaultActiveTab);
        }
    }, [defaultActiveTab, isControlled]);

    // Handle tab change
    const handleTabChange = (value: string) => {
        if (!isControlled) {
            setLocalActiveTab(value);
        }

        if (onTabChange) {
            onTabChange(value);
        }
    };

    return (
        <div className={className}>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex flex-wrap -mb-px">
                    {tabPages.map((tab) => {
                        const isActive = currentActiveTab === tab.value;

                        // Classes based on active state with proper dark mode support
                        const baseClasses = 'inline-flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors';
                        const activeClasses = isActive
                            ? 'border-blue-500 text-blue-600 dark:text-blue-300 dark:border-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600';
                        const disabledClasses = tab.disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer';

                        return (
                            <button
                                key={tab.value}
                                className={`${baseClasses} ${activeClasses} ${disabledClasses} mr-2`}
                                onClick={() => !tab.disabled && handleTabChange(tab.value)}
                                disabled={tab.disabled}
                                aria-selected={isActive}
                                role="tab"
                            >
                                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Render active tab content */}
            <div className="py-4">
                {Children.map(children, child => {
                    if (!isValidElement<TabPageProps>(child) || !('value' in child.props)) {
                        return null;
                    }

                    // Only render the active tab
                    if (child.props.value !== currentActiveTab) {
                        return null;
                    }

                    return child;
                })}
            </div>
        </div>
    );
};
