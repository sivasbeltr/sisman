import React, { useMemo } from 'react';
import RangeSlider from './RangeSlider';

export interface TimeRangeSliderProps {
    minTime?: number;
    maxTime?: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    stepMinutes?: number;
    className?: string;
    disabled?: boolean;
    use24Hour?: boolean;
    tickCount?: number;
    showTicks?: boolean;
    showLabels?: boolean;
    trackHeight?: number;
    handleSize?: number;
    primaryColor?: string;
    showTooltips?: boolean;
}

const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({
    minTime = 0,
    maxTime = 1439,
    value,
    onChange,
    stepMinutes = 15,
    className = '',
    disabled = false,
    use24Hour = false,
    tickCount = 5,
    showTicks = true,
    showLabels = true,
    trackHeight = 6,
    handleSize = 20,
    primaryColor = '#3b82f6',
    showTooltips = true,
}) => {
    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (use24Hour) {
            return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        }
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
    };

    const formatLabel = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        if (use24Hour) return `${hours}:00`;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}${period}`;
    };

    const safeValue = useMemo(() => [
        Math.max(minTime, Math.min(value[0], maxTime)),
        Math.max(minTime, Math.min(value[1], maxTime)),
    ] as [number, number], [value, minTime, maxTime]);

    const calculatedTickCount = useMemo(() => {
        const range = maxTime - minTime;
        const hoursInRange = range / 60;
        return Math.max(4, Math.min(12, Math.ceil(hoursInRange / 2))); // Dinamik tick sayısı
    }, [minTime, maxTime]);

    return (
        <div className={`time-range-slider ${className}`}>
            <RangeSlider
                min={minTime}
                max={maxTime}
                value={safeValue}
                step={stepMinutes}
                onChange={onChange}
                formatValue={formatTime}
                formatLabel={formatLabel}
                className="shadow-sm"
                disabled={disabled}
                trackHeight={trackHeight}
                handleSize={handleSize}
                primaryColor={primaryColor}
                showTicks={showTicks}
                tickCount={tickCount || calculatedTickCount} // Hata düzeltildi
                showLabels={showLabels}
                showTooltips={showTooltips}
            />
        </div>
    );
};

export default TimeRangeSlider;