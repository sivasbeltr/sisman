import React from 'react';
import { classNames } from '../../utils/classNames';

/**
 * Props for the TabPage component
 */
export interface TabPageProps {
    /** The value of the tab, should be unique */
    value: string;
    /** The label of the tab displayed in the tab bar */
    label: string;
    /** Whether the tab is disabled */
    disabled?: boolean;
    /** The content to render when this tab is active */
    children: React.ReactNode;
    /** Icon to display next to the tab label */
    icon?: React.ReactNode;
    /** Additional CSS classes for the tab content */
    className?: string;
}

/**
 * A tab page component that displays content for a specific tab.
 * Designed to be used as a child of TabBar.
 * 
 * @example
 * <TabPage value="tab1" label="First Tab">
 *   <p>Content for tab 1</p>
 * </TabPage>
 */
export const TabPage: React.FC<TabPageProps> = ({
    children,
    className = '',
    // Other props are used by TabBar parent
}) => {
    return (
        <div className={classNames('tab-content text-gray-800 dark:text-gray-200', className)}>
            {children}
        </div>
    );
};

// Set display name for component identification by TabBar
TabPage.displayName = 'TabPage';
