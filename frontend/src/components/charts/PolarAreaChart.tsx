import React, { useRef, useEffect } from 'react';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import ChartWrapper from './ChartWrapper';
import { useChartData } from '../../hooks/useChartData';
import { useTheme } from '../../context/ThemeContext';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Props for the PolarAreaChart component
 */
export interface PolarAreaChartProps {
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
    /** Whether to display percentages in tooltip */
    showPercentages?: boolean;
    /** Start angle for the chart in degrees */
    startAngle?: number;
}

/**
 * Polar Area chart component for visualizing data with single values per category
 * 
 * @example
 * // Basic polar area chart
 * <PolarAreaChart 
 *   data={polarData}
 *   title="Kategori Dağılımı"
 *   height={300} 
 * />
 * 
 * @example
 * // With API data and auto-refresh
 * <PolarAreaChart 
 *   apiUrl="/api/istatistik/kategori-dagilimi"
 *   refreshInterval={60000}
 *   title="Kategori Dağılımı"
 *   subtitle="Her dakika güncellenir"
 * />
 */
const PolarAreaChart: React.FC<PolarAreaChartProps> = ({
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
    showPercentages = true,
    startAngle = 0,
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
        const isDarkMode = theme === 'dark';

        return {
            textColor: isDarkMode ? '#e5e7eb' : '#374151',
            // Generate different default color palettes for light and dark modes
            backgroundColors: isDarkMode
                ? [
                    'rgba(59, 130, 246, 0.8)', // blue
                    'rgba(16, 185, 129, 0.8)', // green
                    'rgba(249, 115, 22, 0.8)', // orange
                    'rgba(139, 92, 246, 0.8)', // purple
                    'rgba(236, 72, 153, 0.8)', // pink
                    'rgba(245, 158, 11, 0.8)', // amber
                    'rgba(6, 182, 212, 0.8)', // cyan
                ]
                : [
                    'rgba(59, 130, 246, 0.6)', // blue
                    'rgba(16, 185, 129, 0.6)', // green
                    'rgba(249, 115, 22, 0.6)', // orange
                    'rgba(139, 92, 246, 0.6)', // purple
                    'rgba(236, 72, 153, 0.6)', // pink
                    'rgba(245, 158, 11, 0.6)', // amber
                    'rgba(6, 182, 212, 0.6)', // cyan
                ],
            borderColors: isDarkMode
                ? [
                    'rgba(59, 130, 246, 1)', // blue
                    'rgba(16, 185, 129, 1)', // green
                    'rgba(249, 115, 22, 1)', // orange
                    'rgba(139, 92, 246, 1)', // purple
                    'rgba(236, 72, 153, 1)', // pink
                    'rgba(245, 158, 11, 1)', // amber
                    'rgba(6, 182, 212, 1)', // cyan
                ]
                : [
                    'rgba(59, 130, 246, 1)', // blue
                    'rgba(16, 185, 129, 1)', // green
                    'rgba(249, 115, 22, 1)', // orange
                    'rgba(139, 92, 246, 1)', // purple
                    'rgba(236, 72, 153, 1)', // pink
                    'rgba(245, 158, 11, 1)', // amber
                    'rgba(6, 182, 212, 1)', // cyan
                ],
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
            scales: {
                r: {
                    beginAtZero: true,
                    grid: {
                        color: colors.textColor === '#e5e7eb' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    angleLines: {
                        color: colors.textColor === '#e5e7eb' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        color: colors.textColor,
                    },
                    pointLabels: {
                        color: colors.textColor,
                    },
                    startAngle: startAngle * (Math.PI / 180),  // Convert degrees to radians
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: colors.textColor,
                        padding: 15,
                        usePointStyle: true,
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
                    callbacks: showPercentages
                        ? {
                            label: function (context) {
                                const dataset = context.dataset;
                                // Type-safe data aggregation
                                const total = dataset.data.reduce((sum: number, value: any) => {
                                    return sum + (typeof value === 'number' ? value : 0);
                                }, 0);
                                const value = dataset.data[context.dataIndex] as number;
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: %${percentage} (${value})`;
                            }
                        }
                        : undefined,
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

        // Apply default colors if not set in the data
        if (chartData && !chartData.datasets?.[0]?.backgroundColor) {
            chartData.datasets?.forEach(dataset => {
                if (!dataset.backgroundColor) {
                    dataset.backgroundColor = colors.backgroundColors;
                    dataset.borderColor = colors.borderColors;
                }
            });
        }

        // Destroy existing chart instance if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Create new chart instance
        chartInstance.current = new Chart(chartRef.current, {
            type: 'polarArea',
            data: chartData,
            options: mergedOptions,
        });

        // Cleanup on unmount
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [chartData, theme, startAngle, showPercentages, options]);

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

export default PolarAreaChart;
