import React, { useMemo } from 'react';
import RangeSlider from './RangeSlider';

export interface DateRangeSliderProps {
    minDate: Date;
    maxDate: Date;
    value: [Date, Date];
    onChange: (value: [Date, Date]) => void;
    stepDays?: number;
    className?: string;
    disabled?: boolean;
    dateFormat?: string;
    labelFormat?: string;
    tickCount?: number;
    showTicks?: boolean;
    showLabels?: boolean;
    trackHeight?: number;
    handleSize?: number;
    primaryColor?: string;
    showTooltips?: boolean;
}

const DateRangeSlider: React.FC<DateRangeSliderProps> = ({
    minDate,
    maxDate,
    value,
    onChange,
    stepDays = 1,
    className = '',
    disabled = false,
    dateFormat = 'dd.MM.yyyy',
    labelFormat = 'dd.MM',
    tickCount = 5,
    showTicks = true,
    showLabels = true,
    trackHeight = 6,
    handleSize = 20,
    primaryColor = '#3b82f6',
    showTooltips = true,
}) => {
    const minDays = Math.floor(minDate.getTime() / (24 * 60 * 60 * 1000));
    const maxDays = Math.floor(maxDate.getTime() / (24 * 60 * 60 * 1000));
    const valueDays = useMemo(() => [
        Math.floor(value[0].getTime() / (24 * 60 * 60 * 1000)),
        Math.floor(value[1].getTime() / (24 * 60 * 60 * 1000)),
    ] as [number, number], [value]);

    const formatDateToString = (date: Date, format: string) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return format
            .replace('dd', day)
            .replace('DD', day)
            .replace('MM', month)
            .replace('yyyy', String(year))
            .replace('YYYY', String(year))
            .replace('yy', String(year).slice(-2))
            .replace('YY', String(year).slice(-2));
    };

    const formatDate = (days: number) => {
        const date = new Date(days * 24 * 60 * 60 * 1000);
        return formatDateToString(date, dateFormat);
    };

    const formatLabel = (days: number) => {
        const date = new Date(days * 24 * 60 * 60 * 1000);
        return formatDateToString(date, labelFormat);
    };

    const handleChange = (newValues: [number, number]) => {
        const newDates: [Date, Date] = [
            new Date(newValues[0] * 24 * 60 * 60 * 1000),
            new Date(newValues[1] * 24 * 60 * 60 * 1000),
        ];
        onChange(newDates);
    };

    return (
        <div className={`date-range-slider ${className}`}>
            <RangeSlider
                min={minDays}
                max={maxDays}
                value={valueDays}
                step={stepDays}
                onChange={handleChange}
                formatValue={formatDate}
                formatLabel={formatLabel}
                className="shadow-sm"
                disabled={disabled}
                trackHeight={trackHeight}
                handleSize={handleSize}
                primaryColor={primaryColor}
                showTicks={showTicks}
                tickCount={tickCount}
                showLabels={showLabels}
                showTooltips={showTooltips}
            />
        </div>
    );
};

export default DateRangeSlider;