import React, { useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { classNames } from '../../utils/classNames';

export interface PaginationProps {
    /** Current page number (1-based) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Function to call when page changes */
    onPageChange: (page: number) => void;
    /** Number of page buttons to show */
    siblingCount?: number;
    /** Whether to show first and last page buttons */
    showEndButtons?: boolean;
    /** Size of the pagination controls */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
}

/**
 * Pagination component for navigating through pages.
 */
export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    size = 'md',
    className = '',
}) => {
    // Calculate pagination range
    const range = useMemo(() => {
        const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last

        if (totalPageNumbers >= totalPages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const showLeftDots = leftSiblingIndex > 2;
        const showRightDots = rightSiblingIndex < totalPages - 1;

        if (!showLeftDots && showRightDots) {
            const leftItemCount = 1 + 2 * siblingCount;
            return [
                ...Array.from({ length: leftItemCount }, (_, i) => i + 1),
                'dots',
                totalPages
            ];
        }

        if (showLeftDots && !showRightDots) {
            const rightItemCount = 1 + 2 * siblingCount;
            return [
                1,
                'dots',
                ...Array.from(
                    { length: rightItemCount },
                    (_, i) => totalPages - rightItemCount + i + 1
                )
            ];
        }

        return [
            1,
            'dots',
            ...Array.from(
                { length: rightSiblingIndex - leftSiblingIndex + 1 },
                (_, i) => leftSiblingIndex + i
            ),
            'dots',
            totalPages
        ];
    }, [currentPage, totalPages, siblingCount]);

    if (totalPages <= 1) return null;

    const sizeClasses = {
        sm: 'h-7 w-7 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-11 w-11 text-base',
    };

    const iconClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <div className={classNames('flex items-center justify-center', className)}>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Sayfalama">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={classNames(
                        'relative inline-flex items-center justify-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700',
                        currentPage === 1 ? 'cursor-not-allowed' : 'hover:text-gray-500',
                        sizeClasses[size]
                    )}
                    aria-label="Önceki sayfa"
                >
                    <span className="sr-only">Önceki</span>
                    <ChevronLeftIcon className={iconClasses[size]} aria-hidden="true" />
                </button>

                {/* Page Numbers */}
                {range.map((page, index) => {
                    if (page === 'dots') {
                        return (
                            <span
                                key={`dots-${index}`}
                                className={classNames(
                                    'relative inline-flex items-center justify-center border border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400',
                                    sizeClasses[size]
                                )}
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page as number}
                            onClick={() => onPageChange(page as number)}
                            aria-current={currentPage === page ? 'page' : undefined}
                            className={classNames(
                                'relative inline-flex items-center justify-center border text-sm font-medium focus:z-20',
                                currentPage === page
                                    ? 'z-10 border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
                                sizeClasses[size]
                            )}
                            aria-label={`Sayfa ${page}`}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={classNames(
                        'relative inline-flex items-center justify-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700',
                        currentPage === totalPages ? 'cursor-not-allowed' : 'hover:text-gray-500',
                        sizeClasses[size]
                    )}
                    aria-label="Sonraki sayfa"
                >
                    <span className="sr-only">Sonraki</span>
                    <ChevronRightIcon className={iconClasses[size]} aria-hidden="true" />
                </button>
            </nav>
        </div>
    );
};
