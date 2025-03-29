import React, { useRef, useEffect } from 'react';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import ChartWrapper from './ChartWrapper';
import { useChartData } from '../../hooks/useChartData';
import { useTheme } from '../../context/ThemeContext';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Props for the LineChart component
 */
export interface LineChartProps {
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
    /** Whether to fill area under the line */
    fill?: boolean;
    /** Whether to use curved lines */
    curved?: boolean;
    /** Whether to use stepped lines */
    stepped?: boolean;
}

/**
 * Line chart component for visualizing trends over time
 * 
 * @example
 * // Basic line chart
 * <LineChart 
 *   data={lineData}
 *   title="Aylık Varlık Eklemeleri"
 *   height={300} 
 * />
 * 
 * @example
 * // Filled area chart from API with auto-refresh
 * <LineChart 
 *   apiUrl="/api/istatistik/aylik-islemler"
 *   refreshInterval={60000}
 *   title="Son 12 Ay İşlem Sayısı"
 *   fill={true}
 *   curved={true}
 * />
 */
const LineChart: React.FC<LineChartProps> = ({
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
    fill = false,
    curved = false,
    stepped = false,
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
            gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            textColor: isDarkMode ? '#e5e7eb' : '#374151',
            borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        };
    };

    const colors = getThemeColors();

    useEffect(() => {
        if (!chartRef.current || !chartData) return;

        // Get tension value based on curved prop
        const getTension = () => {
            if (stepped) return 0;
            return curved ? 0.4 : 0;
        };

        // Default options based on props and theme
        const defaultOptions: ChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        color: colors.gridColor,
                    },
                    ticks: {
                        color: colors.textColor,
                    },
                    border: {
                        color: colors.borderColor,
                    }
                },
                y: {
                    grid: {
                        color: colors.gridColor,
                    },
                    ticks: {
                        color: colors.textColor,
                    },
                    border: {
                        color: colors.borderColor,
                    },
                    beginAtZero: true,
                }
            },
            elements: {
                line: {
                    tension: getTension(),
                    stepped: stepped,
                },
                point: {
                    radius: 4,
                    hoverRadius: 6,
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

        // Apply fill option to datasets if not explicitly set
        if (chartData && chartData.datasets && fill) {
            chartData.datasets = chartData.datasets.map((dataset, index) => {
                // Use type assertion to access fill property
                const typedDataset = dataset as any;
                if (typeof typedDataset.fill === 'undefined') {
                    return {
                        ...dataset,
                        fill: true,
                        backgroundColor: (dataset.backgroundColor as string) ||
                            `rgba(${59 + index * 40}, ${130 + index * 20}, ${246 - index * 30}, ${theme === 'dark' ? 0.2 : 0.1})`,
                    };
                }
                return dataset;
            });
        }

        // Create or update chart
        if (chartInstance.current) {
            chartInstance.current.data = chartData;
            chartInstance.current.options = mergedOptions;
            chartInstance.current.update();
        } else {
            chartInstance.current = new Chart(chartRef.current, {
                type: 'line',
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
    }, [chartData, theme, fill, curved, stepped, options]);

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

export default LineChart;
