import React from 'react';
import { ChartData, ChartOptions } from 'chart.js';
import PieChart from './PieChart';

/**
 * Props for the DoughnutChart component
 */
export interface DoughnutChartProps {
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
    /** Cutout percentage (how large the center hole is) */
    cutoutPercentage?: number;
}

/**
 * Doughnut chart component for visualizing proportions with a hole in the center
 * Extends PieChart with doughnut=true
 * 
 * @example
 * <DoughnutChart 
 *   data={doughnutData}
 *   title="Birimlere Göre Varlık Dağılımı"
 *   height={300} 
 * />
 */
const DoughnutChart: React.FC<DoughnutChartProps> = ({
    data,
    apiUrl,
    transformData,
    options = {},
    refreshInterval,
    title,
    subtitle,
    height,
    width,
    className,
    showPercentages = true,
    cutoutPercentage,
}) => {
    // Update options with custom cutout percentage if provided
    const updatedOptions = cutoutPercentage
        ? {
            ...options,
            cutout: `${cutoutPercentage}%`
        }
        : options;

    return (
        <PieChart
            data={data}
            apiUrl={apiUrl}
            transformData={transformData}
            options={updatedOptions}
            refreshInterval={refreshInterval}
            title={title}
            subtitle={subtitle}
            height={height}
            width={width}
            className={className}
            doughnut={true}
            showPercentages={showPercentages}
        />
    );
};

export default DoughnutChart;
