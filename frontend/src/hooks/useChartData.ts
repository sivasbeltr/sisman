import { useState, useEffect, useRef } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

/**
 * Options for chart data fetching
 */
export interface ChartDataOptions<T = any> {
    /** API endpoint URL */
    url: string;
    /** Refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional options for the axios request */
    requestOptions?: AxiosRequestConfig;
    /** Transform function to convert API response to chart data format */
    transformData?: (data: any) => T;
    /** Whether to auto-fetch on mount */
    autoFetch?: boolean;
}

/**
 * Return type for useChartData hook
 */
export interface ChartDataResult<T = any> {
    /** The processed chart data */
    data: T | null;
    /** Whether data is currently loading */
    loading: boolean;
    /** Any error that occurred during fetching */
    error: Error | null;
    /** Function to manually refresh data */
    refresh: () => Promise<void>;
    /** Function to stop auto-refresh */
    stopRefresh: () => void;
    /** Function to start auto-refresh */
    startRefresh: () => void;
    /** Whether auto-refresh is currently active */
    isRefreshActive: boolean;
}

/**
 * Custom hook for fetching and managing chart data with auto-refresh capability
 * 
 * @example
 * const { data, loading, error, refresh } = useChartData({
 *   url: '/api/sales-data',
 *   refreshInterval: 60000, // refresh every minute
 *   transformData: (response) => response.data.map(item => ({
 *     name: item.category,
 *     value: item.total
 *   }))
 * });
 */
export function useChartData<T = any>(options: ChartDataOptions<T>): ChartDataResult<T> {
    const {
        url,
        refreshInterval = 0,
        requestOptions = {},
        transformData = (data) => data as T,
        autoFetch = true
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(autoFetch);
    const [error, setError] = useState<Error | null>(null);
    const [isRefreshActive, setIsRefreshActive] = useState<boolean>(refreshInterval > 0);

    const refreshTimerRef = useRef<number | null>(null);

    // Function to fetch data
    const fetchData = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios({ url, ...requestOptions });
            const transformedData = transformData(response.data);

            setData(transformedData);
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError(err instanceof Error ? err : new Error('Unknown error fetching chart data'));
        } finally {
            setLoading(false);
        }
    };

    // Start the refresh interval
    const startRefreshTimer = () => {
        if (refreshInterval <= 0) return;

        stopRefreshTimer();

        // Using setInterval with Window type for browser compatibility
        refreshTimerRef.current = window.setInterval(() => {
            fetchData();
        }, refreshInterval);

        setIsRefreshActive(true);
    };

    // Stop the refresh interval
    const stopRefreshTimer = () => {
        if (refreshTimerRef.current !== null) {
            clearInterval(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        setIsRefreshActive(false);
    };

    // Setup effect for initial fetch and interval
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }

        if (refreshInterval > 0) {
            startRefreshTimer();
        }

        // Cleanup on unmount
        return () => stopRefreshTimer();
    }, [url, refreshInterval]); // Re-run if URL or interval changes

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        stopRefresh: stopRefreshTimer,
        startRefresh: startRefreshTimer,
        isRefreshActive
    };
}
