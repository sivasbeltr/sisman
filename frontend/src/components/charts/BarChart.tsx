import React, { useRef, useEffect } from 'react';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import ChartWrapper from './ChartWrapper';
import { useChartData } from '../../hooks/useChartData';
import { useTheme } from '../../context/ThemeContext';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Props for the BarChart component
 */
export interface BarChartProps {
    /** Data for the chart - provide this OR apiUrl */
    data?: ChartData;
    /** API URL to fetch data from - provide this OR data */
    apiUrl?: string;
    /** Function to transform API response to ChartData format */
    transformData?: (data: any) => ChartData;
    /** Chart options to customize appearance and behavior */
    options?: ChartOptions;
    /** Refresh interval in milliseconds (0 to disable auto-refresh) */
    refreshInterval?: number;
    /** Title displayed above the chart */
    title?: string;
    /** Subtitle with additional context */
    subtitle?: string;
    /** Height of the chart container */
    height?: number;
    /** Width of the chart container */
    width?: number | string;
    /** CSS class names */
    className?: string;
    /** Whether to show horizontal bars instead of vertical */
    horizontal?: boolean;
    /** Whether to stack the bars */
    stacked?: boolean;
}

/**
 * Bar chart component for visualizing categorical data
 * 
 * @example
 * // With static data
 * <BarChart 
 *   data={barChartData}
 *   title="Bölümlere Göre Varlık Sayısı"
 *   height={300} 
 * />
 * 
 * @example
 * // With API data and auto-refresh
 * <BarChart 
 *   apiUrl="/api/istatistik/varlik-durumu"
 *   refreshInterval={60000}
 *   title="Varlık Durum Özeti"
 *   subtitle="Her saat güncellenir"
 *   horizontal={true}
 * />
 */
const BarChart: React.FC<BarChartProps> = ({
    data: staticData,
    apiUrl,
    transformData = data => data,
    options = {},
    refreshInterval = 0,
    title,
    subtitle,
    height = 300,
    width = '100%',
    className = '',
    horizontal = false,
    stacked = false,
}) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);
    const { theme } = useTheme();

    // Only fetch data if apiUrl is provided
    const {
        data: apiData,
        loading,
        error,
        refresh,
    } = useChartData<ChartData>({
        url: apiUrl || '',
        refreshInterval,
        transformData,
        autoFetch: !!apiUrl,
    });

    // Use either static data or API data
    const chartData = staticData || apiData;

    // Configure theme-based colors
    const getThemeColors = () => {
        const darkMode = theme === 'dark';

        return {
            gridColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            textColor: darkMode ? '#e5e7eb' : '#374151',
            borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        };
    };

    const colors = getThemeColors();

    // Initialize or update chart when data or theme changes
    useEffect(() => {
        if (!chartRef.current || !chartData) return;

        // Default options based on props and theme
        const defaultOptions: ChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: horizontal ? 'y' : 'x',
            scales: {
                x: {
                    grid: {
                        color: colors.gridColor,
                        drawOnChartArea: true,
                    },
                    ticks: {
                        color: colors.textColor,
                    },
                    border: {
                        color: colors.borderColor,
                    },
                    stacked: stacked
                },
                y: {
                    grid: {
                        color: colors.gridColor,
                        drawOnChartArea: true,
                    },
                    ticks: {
                        color: colors.textColor,
                    },
                    border: {
                        color: colors.borderColor,
                    },
                    stacked: stacked
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: colors.textColor,
                        boxWidth: 12,
                        padding: 15,
                    },
                },
                tooltip: {
                    backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    titleColor: theme === 'dark' ? '#e5e7eb' : '#111827',
                    bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
                    borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    boxPadding: 5,
                    usePointStyle: true,
                },
            },
        };

        // Merge default options with provided options
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            plugins: {
                ...defaultOptions.plugins,
                ...options?.plugins,
            },
        };

        // Create or update chart
        if (chartInstance.current) {
            chartInstance.current.data = chartData;
            chartInstance.current.options = mergedOptions;
            chartInstance.current.update();
        } else {
            chartInstance.current = new Chart(chartRef.current, {
                type: 'bar',
                data: chartData,
                options: mergedOptions,
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [chartData, theme, horizontal, stacked, options]);

    return (
        <ChartWrapper
            title={title}
            subtitle={subtitle}
            loading={loading}
            error={error}
            onRefresh={apiUrl ? refresh : undefined}
            isRefreshing={loading}
            height={height}
            width={width}
            className={className}
        >
            <canvas ref={chartRef} />
        </ChartWrapper>
    );
};

export default BarChart;
