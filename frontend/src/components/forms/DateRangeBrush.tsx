import React, { useMemo } from 'react';
import RangeBrush from './RangeBrush';

/**
 * Props for the DateRangeBrush component
 */
export interface DateRangeBrushProps {
    /** Minimum date of the range (inclusive) */
    minDate: Date;
    /** Maximum date of the range (inclusive) */
    maxDate: Date;
    /** Currently selected date range [startDate, endDate] */
    value: [Date, Date];
    /** Called when the selected range changes */
    onChange?: (value: [Date, Date]) => void;
    /** Called when the selection is finalized (after brushing ends) */
    onChangeEnd?: (value: [Date, Date]) => void;
    /** Height of the brush area */
    height?: number;
    /** Optional background element (like a mini chart) */
    backgroundElement?: React.ReactNode;
    /** Format for date display (default: dd.MM.yyyy) */
    dateFormat?: string;
    /** CSS class name */
    className?: string;
    /** Whether the component is disabled */
    disabled?: boolean;
    /** Color of the selection area */
    selectionColor?: string;
    /** Opacity of non-selected areas */
    maskOpacity?: number;
    /** Whether to show tooltip while dragging */
    showTooltips?: boolean;
}

/**
 * Date range brush component for selecting a range of dates
 * 
 * @example
 * <DateRangeBrush
 *   minDate={new Date(2023, 0, 1)}
 *   maxDate={new Date(2023, 11, 31)}
 *   value={[new Date(2023, 2, 1), new Date(2023, 5, 30)]}
 *   onChange={handleDateRangeChange}
 *   onChangeEnd={handleDateRangeFinalized}
 * />
 */
const DateRangeBrush: React.FC<DateRangeBrushProps> = ({
    minDate,
    maxDate,
    value,
    onChange,
    onChangeEnd,
    height = 80,
    backgroundElement,
    dateFormat = 'dd.MM.yyyy',
    className = '',
    disabled = false,
    selectionColor = 'rgba(59, 130, 246, 0.3)',
    maskOpacity = 0.4,
    showTooltips = true,
}) => {
    // Convert dates to numeric timestamps (days since epoch) for the underlying brush
    const minTime = minDate.getTime();
    const maxTime = maxDate.getTime();
    const valueTime = useMemo(() => [
        value[0].getTime(),
        value[1].getTime()
    ] as [number, number], [value]);

    // Calculate number of days in range for display
    const getDaysBetween = (date1: Date, date2: Date) => {
        return Math.round(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Format a timestamp to a readable date string
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return formatDateToString(date, dateFormat);
    };

    // Helper function to format a date according to the specified format
    const formatDateToString = (date: Date, format: string) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return format
            .replace('dd', day)
            .replace('MM', month)
            .replace('yyyy', String(year))
            .replace('yy', String(year).slice(-2));
    };

    // Handle change from the underlying brush
    const handleChange = (newValues: [number, number]) => {
        const newDates: [Date, Date] = [
            new Date(newValues[0]),
            new Date(newValues[1])
        ];
        if (onChange) {
            onChange(newDates);
        }
    };

    // Handle onChangeEnd from the underlying brush
    const handleChangeEnd = (newValues: [number, number]) => {
        if (onChangeEnd) {
            const newDates: [Date, Date] = [
                new Date(newValues[0]),
                new Date(newValues[1])
            ];
            onChangeEnd(newDates);
        }
    };

    // Custom content to render in the selection area
    const renderSelectionContent = ([start, end]: [number, number]) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const days = getDaysBetween(startDate, endDate);

        return (
            <div className="text-xs text-center px-2 py-1 bg-white/80 dark:bg-gray-900/80 rounded text-gray-900 dark:text-white whitespace-nowrap">
                {days} gün
            </div>
        );
    };

    // Create mini-calendar appearance with background grid lines
    const renderCalendarBackground = () => {
        const totalTime = maxTime - minTime;
        const monthLines = [];
        const currentDate = new Date(minDate);

        // Set to first day of month
        currentDate.setDate(1);

        // Create a line for each month
        while (currentDate <= maxDate) {
            const position = ((currentDate.getTime() - minTime) / totalTime) * 100;
            const month = currentDate.toLocaleString('tr-TR', { month: 'short' });

            monthLines.push(
                <div key={currentDate.getTime()} className="absolute h-full flex flex-col items-center" style={{ left: `${position}%` }}>
                    <div className="h-full border-l border-gray-300 dark:border-gray-600"></div>
                    <div className="absolute bottom-1 text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2">
                        {month}
                    </div>
                </div>
            );

            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return (
            <div className="absolute inset-0">
                {monthLines}
            </div>
        );
    };

    return (
        <RangeBrush
            min={minTime}
            max={maxTime}
            value={valueTime}
            onChange={handleChange}
            onChangeEnd={handleChangeEnd}
            height={height}
            backgroundElement={backgroundElement || renderCalendarBackground()}
            formatValue={formatDate}
            className={className}
            disabled={disabled}
            selectionColor={selectionColor}
            maskOpacity={maskOpacity}
            showTooltips={showTooltips}
            renderSelectionContent={renderSelectionContent}
        />
    );
};

export default DateRangeBrush;
