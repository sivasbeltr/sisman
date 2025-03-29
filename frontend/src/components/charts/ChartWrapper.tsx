import React from 'react';

/**
 * Props for the ChartWrapper component
 */
export interface ChartWrapperProps {
    /** Title of the chart */
    title?: string;
    /** Subtitle with additional context */
    subtitle?: string;
    /** Whether data is currently loading */
    loading?: boolean;
    /** Error message if data fetching failed */
    error?: Error | null;
    /** Function to refresh data */
    onRefresh?: () => void;
    /** Whether automatic refresh is active */
    isRefreshing?: boolean;
    /** Height of the chart container */
    height?: number | string;
    /** Width of the chart container */
    width?: number | string;
    /** CSS class names */
    className?: string;
    /** Additional style properties */
    style?: React.CSSProperties;
    /** Chart content */
    children: React.ReactNode;
}

/**
 * A wrapper component for charts that handles loading states, errors, and provides a consistent layout
 */
const ChartWrapper: React.FC<ChartWrapperProps> = ({
    title,
    subtitle,
    loading = false,
    error = null,
    onRefresh,
    isRefreshing = false,
    height = 300,
    width = '100%',
    className = '',
    style = {},
    children,
}) => {

    return (
        <div
            className={`chart-container bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}
            style={{
                height: typeof height === 'number' ? `${height}px` : height,
                width: typeof width === 'number' ? `${width}px` : width,
                ...style
            }}
        >
            {/* Header section with title, subtitle and refresh button */}
            {(title || subtitle || onRefresh) && (
                <div className="chart-header flex items-center justify-between mb-4">
                    <div>
                        {title && <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
                    </div>
                    {onRefresh && (
                        <button
                            className={`p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700
                ${isRefreshing ? 'animate-spin' : ''}`}
                            onClick={onRefresh}
                            title="Yenile"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-lg z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-red-500 mb-2">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Veri yüklenemedi</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {error.message || 'Beklenmeyen bir hata oluştu.'}
                    </p>
                    {onRefresh && (
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={onRefresh}
                        >
                            Yeniden Dene
                        </button>
                    )}
                </div>
            )}

            {/* Chart content - only show if not error state */}
            {!error && (
                <div className="chart-content relative" style={{
                    height: title || subtitle || onRefresh ? 'calc(100% - 2rem)' : '100%'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default ChartWrapper;
