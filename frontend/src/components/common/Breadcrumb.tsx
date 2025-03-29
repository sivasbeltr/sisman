import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';
import { classNames } from '../../utils/classNames';

export interface BreadcrumbItem {
    /** The name to display */
    name: string;
    /** The route path */
    path: string;
    /** Whether this is the current page (last item) */
    current?: boolean;
    /** Optional icon to display before the name */
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface BreadcrumbProps {
    /** The items to display in the breadcrumb */
    items: BreadcrumbItem[];
    /** Whether to show the home icon on the first item */
    homeIcon?: boolean;
    /** Additional CSS classes for the container */
    className?: string;
    /** The separator to use between items */
    separator?: React.ReactNode;
}

/**
 * Breadcrumb component for showing navigation hierarchy.
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    homeIcon = true,
    className = '',
    separator = <ChevronRightIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
}) => {
    // Mark the last item as current if not explicitly set
    const breadcrumbItems = items.map((item, index) => ({
        ...item,
        current: item.current !== undefined ? item.current : index === items.length - 1
    }));

    return (
        <nav className={classNames('flex', className)} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1 sm:space-x-2">
                {breadcrumbItems.map((item, index) => (
                    <li key={item.path} className="flex items-center">
                        {index > 0 && (
                            <span className="mx-1 sm:mx-2 text-gray-400">{separator}</span>
                        )}

                        <div className="flex items-center">
                            {index === 0 && homeIcon && !item.icon && (
                                <HomeIcon
                                    className="mr-1 h-4 w-4 text-gray-500"
                                    aria-hidden="true"
                                />
                            )}

                            {item.icon && (
                                <item.icon
                                    className="mr-1 h-4 w-4 text-gray-500"
                                    aria-hidden="true"
                                />
                            )}

                            <Link
                                to={item.path}
                                className={classNames(
                                    'text-sm font-medium',
                                    item.current
                                        ? 'text-gray-800 dark:text-gray-200 cursor-default hover:text-gray-800 dark:hover:text-gray-200'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                )}
                                aria-current={item.current ? 'page' : undefined}
                            >
                                {item.name}
                            </Link>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
