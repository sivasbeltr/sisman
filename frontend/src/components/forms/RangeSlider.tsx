import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface RangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    step?: number;
    onChange: (value: [number, number]) => void;
    formatValue: (value: number) => string;
    className?: string;
    disabled?: boolean;
    trackHeight?: number;
    handleSize?: number;
    primaryColor?: string;
    secondaryColor?: string;
    showTicks?: boolean;
    tickCount?: number;
    showLabels?: boolean;
    formatLabel?: (value: number) => string;
    showTooltips?: boolean;
    showRangeLabels?: boolean;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
    min,
    max,
    value,
    step = 1,
    onChange,
    formatValue,
    className = '',
    disabled = false,
    trackHeight = 6,
    handleSize = 20,
    primaryColor = '#3b82f6',
    showTicks = false,
    tickCount = 10,
    showLabels = true,
    formatLabel = (value) => String(value),
    showTooltips = true,
    showRangeLabels = true,
}) => {
    const [sliderValue, setSliderValue] = useState<[number, number]>(value);
    const [isDragging, setIsDragging] = useState<'min' | 'max' | 'range' | null>(null);
    const [showTooltip, setShowTooltip] = useState<'min' | 'max' | 'both' | null>(null);
    const [tempValue, setTempValue] = useState<[number, number]>(value);
    const sliderRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const updateRect = useCallback(() => {
        if (sliderRef.current) {
            return sliderRef.current.getBoundingClientRect();
        }
        return null;
    }, []);

    useEffect(() => {
        setSliderValue(value);
        setTempValue(value);
    }, [value]);

    const getPercentage = useCallback((val: number) => ((val - min) / (max - min)) * 100, [min, max]);
    const roundToStep = useCallback((val: number) => Math.round((val - min) / step) * step + min, [min, step]);
    const clamp = useCallback((val: number, lower = min, upper = max) => Math.min(Math.max(val, lower), upper), [min, max]);

    const getValueFromPosition = useCallback((posX: number, rect: DOMRect) => {
        const relativeX = posX - rect.left;
        const percentage = clamp(relativeX / rect.width, 0, 1);
        return clamp(roundToStep(min + percentage * (max - min)));
    }, [min, max, clamp, roundToStep]);

    const generateTicks = useCallback(() => {
        const ticks = [];
        const interval = (max - min) / (tickCount - 1);
        for (let value = min; value <= max; value += interval) {
            ticks.push(roundToStep(value));
        }
        if (ticks[ticks.length - 1] !== max) ticks.push(max);
        return ticks;
    }, [min, max, tickCount, roundToStep]);

    const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, type: 'min' | 'max' | 'range') => {
        if (disabled) return;
        e.preventDefault();
        const rect = updateRect();
        if (!rect) return;

        setIsDragging(type);
        setShowTooltip(type === 'range' ? 'both' : type);
        setTempValue([...sliderValue]);
    }, [disabled, sliderValue, updateRect]);

    const processDragMovement = useCallback((clientX: number) => {
        if (!isDragging || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const newValue = getValueFromPosition(clientX, rect);
        let newMinValue = tempValue[0];
        let newMaxValue = tempValue[1];
        const minGap = Math.max(step, (max - min) * 0.01);

        if (isDragging === 'min') {
            newMinValue = clamp(newValue, min, tempValue[1] - minGap);
        } else if (isDragging === 'max') {
            newMaxValue = clamp(newValue, tempValue[0] + minGap, max);
        } else if (isDragging === 'range') {
            const rangeWidth = sliderValue[1] - sliderValue[0];
            newMinValue = clamp(newValue, min, max - rangeWidth);
            newMaxValue = newMinValue + rangeWidth;
            if (newMaxValue > max) {
                newMaxValue = max;
                newMinValue = max - rangeWidth;
            }
        }

        const newValues: [number, number] = [newMinValue, newMaxValue];
        setTempValue(newValues);
    }, [isDragging, sliderValue, tempValue, min, max, step, clamp, getValueFromPosition]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => processDragMovement(e.clientX));
    }, [processDragMovement]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        e.preventDefault();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => processDragMovement(e.touches[0].clientX));
    }, [processDragMovement]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(null);
        setSliderValue([...tempValue]);
        onChange([...tempValue]);
        setTimeout(() => setShowTooltip(null), 500);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleDragEnd);
    }, [handleMouseMove, handleTouchMove, tempValue, onChange]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleDragEnd);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]); // Hatalı satır düzeltildi

    const minPercentage = getPercentage(tempValue[0]);
    const maxPercentage = getPercentage(tempValue[1]);
    const ticks = showTicks ? generateTicks() : [];

    return (
        <div className={`range-slider-container w-full ${className}`}>
            <div
                ref={sliderRef}
                className={`relative w-full rounded-full cursor-pointer select-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ height: `${trackHeight}px` }}
            >
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full shadow-inner" />
                <div
                    className="absolute h-full rounded-full transition-all duration-100"
                    style={{
                        left: `${minPercentage}%`,
                        width: `${maxPercentage - minPercentage}%`,
                        backgroundColor: primaryColor,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseDown={(e) => startDrag(e, 'range')}
                    onTouchStart={(e) => startDrag(e, 'range')}
                />
                {showTicks && ticks.map((tick) => (
                    <div
                        key={tick}
                        className="absolute top-1/2 w-0.5 h-2 bg-gray-400 dark:bg-gray-500"
                        style={{ left: `${getPercentage(tick)}%`, transform: 'translate(-50%, -50%)' }}
                    />
                ))}
                <div
                    className={`absolute top-1/2 rounded-full bg-white shadow-lg border-2 cursor-grab transition-all duration-100 
                        ${isDragging === 'min' ? 'scale-110 ring-2 ring-blue-300/50' : 'hover:scale-105'}`}
                    style={{
                        left: `${minPercentage}%`,
                        height: `${handleSize}px`,
                        width: `${handleSize}px`,
                        borderColor: primaryColor,
                        transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => startDrag(e, 'min')}
                    onTouchStart={(e) => startDrag(e, 'min')}
                >
                    {showTooltips && (showTooltip === 'min' || showTooltip === 'both') && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 text-white rounded-lg shadow-lg">
                            {formatValue(tempValue[0])}
                        </div>
                    )}
                </div>
                <div
                    className={`absolute top-1/2 rounded-full bg-white shadow-lg border-2 cursor-grab transition-all duration-100 
                        ${isDragging === 'max' ? 'scale-110 ring-2 ring-blue-300/50' : 'hover:scale-105'}`}
                    style={{
                        left: `${maxPercentage}%`,
                        height: `${handleSize}px`,
                        width: `${handleSize}px`,
                        borderColor: primaryColor,
                        transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => startDrag(e, 'max')}
                    onTouchStart={(e) => startDrag(e, 'max')}
                >
                    {showTooltips && (showTooltip === 'max' || showTooltip === 'both') && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-gray-800 text-white rounded-lg shadow-lg">
                            {formatValue(tempValue[1])}
                        </div>
                    )}
                </div>
            </div>
            {showLabels && showTicks && (
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 relative">
                    {ticks.map((tick) => (
                        <div key={tick} className="absolute" style={{ left: `${getPercentage(tick)}%`, transform: 'translateX(-50%)' }}>
                            {formatLabel(tick)}
                        </div>
                    ))}
                </div>
            )}
            {showRangeLabels && (
                <div className="flex justify-between mt-3 text-sm">
                    <div className="font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {formatValue(tempValue[0])}
                    </div>
                    <div className="font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {formatValue(tempValue[1])}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RangeSlider;