import React, { useRef, useState, useEffect, useCallback } from 'react';

export interface RangeBrushProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    onChangeEnd?: (value: [number, number]) => void; // Yeni eklenen prop
    height?: number;
    backgroundElement?: React.ReactNode;
    showLabels?: boolean;
    formatValue?: (value: number) => string;
    className?: string;
    disabled?: boolean;
    selectionColor?: string;
    maskOpacity?: number;
    handleWidth?: number;
    showTooltips?: boolean;
    renderSelectionContent?: (range: [number, number]) => React.ReactNode;
    step?: number;
}

const RangeBrush: React.FC<RangeBrushProps> = ({
    min,
    max,
    value,
    onChange,
    onChangeEnd, // Yeni eklenen prop
    height = 80,
    backgroundElement,
    showLabels = true,
    formatValue = (val) => val.toString(),
    className = '',
    disabled = false,
    selectionColor = 'rgba(59, 130, 246, 0.5)',
    maskOpacity = 0.4,
    handleWidth = 8,
    showTooltips = true,
    renderSelectionContent,
    step,
}) => {
    const [isDragging, setIsDragging] = useState<'left' | 'right' | 'area' | null>(null);
    const [selectionRange, setSelectionRange] = useState<[number, number]>(value);
    const [startPos, setStartPos] = useState(0);
    const [startRange, setStartRange] = useState<[number, number]>([0, 0]);
    const [showTooltip, setShowTooltip] = useState<'left' | 'right' | 'both' | null>(null);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);

    const updateRect = useCallback(() => {
        if (containerRef.current) {
            setRect(containerRef.current.getBoundingClientRect());
        }
    }, []);

    useEffect(() => {
        updateRect();
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [updateRect]);

    useEffect(() => {
        setSelectionRange(value);
    }, [value]);

    const roundToStep = useCallback((value: number): number => {
        if (!step) return value;
        return Math.round(value / step) * step;
    }, [step]);

    const getPositionPercent = useCallback((val: number) => {
        return ((val - min) / (max - min)) * 100;
    }, [min, max]);


    const startDrag = useCallback((
        e: React.MouseEvent | React.TouchEvent,
        type: 'left' | 'right' | 'area'
    ) => {
        if (disabled) return;
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

        setIsDragging(type);
        setShowTooltip(type === 'area' ? 'both' : type);
        setStartPos(clientX);
        setStartRange([...selectionRange]);
        updateRect();
    }, [disabled, selectionRange, updateRect]);

    const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !rect) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - startPos;
        const deltaValue = (deltaX / rect.width) * (max - min);
        let newMin = startRange[0];
        let newMax = startRange[1];
        const minGap = (max - min) * 0.01;

        if (isDragging === 'left') {
            newMin = Math.max(min, Math.min(startRange[0] + deltaValue, startRange[1] - minGap));
        } else if (isDragging === 'right') {
            newMax = Math.min(max, Math.max(startRange[1] + deltaValue, startRange[0] + minGap));
        } else if (isDragging === 'area') {
            const rangeWidth = startRange[1] - startRange[0];
            newMin = startRange[0] + deltaValue;
            newMax = newMin + rangeWidth;

            if (newMin < min) {
                newMin = min;
                newMax = min + rangeWidth;
            }
            if (newMax > max) {
                newMax = max;
                newMin = max - rangeWidth;
            }
        }

        if (step) {
            newMin = roundToStep(newMin);
            newMax = roundToStep(newMax);
            newMin = Math.max(min, Math.min(newMin, newMax - minGap));
            newMax = Math.min(max, Math.max(newMax, newMin + minGap));
        }

        const newRange: [number, number] = [newMin, newMax];
        setSelectionRange(newRange);
        onChange(newRange);
    }, [isDragging, rect, startPos, startRange, min, max, step, roundToStep, onChange]);

    const endDrag = useCallback(() => {
        setIsDragging(null);
        setTimeout(() => setShowTooltip(null), 500);
        if (onChangeEnd) {
            onChangeEnd(selectionRange); // Yeni eklenen onChangeEnd çağrısı
        }
    }, [selectionRange, onChangeEnd]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchmove', handleDrag, { passive: false });
            document.addEventListener('touchend', endDrag);
        }
        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', endDrag);
        };
    }, [isDragging, handleDrag, endDrag]);

    const leftPercent = getPositionPercent(selectionRange[0]);
    const rightPercent = getPositionPercent(selectionRange[1]);
    const widthPercent = rightPercent - leftPercent;

    return (
        <div className={`range-brush-container w-full ${className}`}>
            <div
                ref={containerRef}
                className={`range-brush relative w-full overflow-hidden select-none rounded-md ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ height: `${height}px` }}
            >
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800">
                    {backgroundElement}
                </div>

                <div
                    className="absolute top-0 bottom-0 bg-white dark:bg-gray-900"
                    style={{ left: 0, width: `${leftPercent}%`, opacity: maskOpacity }}
                />
                <div
                    className="absolute top-0 bottom-0 bg-white dark:bg-gray-900"
                    style={{ right: 0, width: `${100 - rightPercent}%`, opacity: maskOpacity }}
                />

                <div
                    ref={selectionRef}
                    className="absolute top-0 bottom-0 cursor-move z-10"
                    style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: selectionColor,
                    }}
                    onMouseDown={(e) => startDrag(e, 'area')}
                    onTouchStart={(e) => startDrag(e, 'area')}
                >
                    {renderSelectionContent && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            {renderSelectionContent(selectionRange)}
                        </div>
                    )}
                    {showTooltips && showTooltip === 'both' && (
                        <div className="absolute top-0 inset-x-0 flex justify-between transform -translate-y-full mb-1">
                            <div className="px-2 py-1 text-xs bg-gray-900 text-white rounded">
                                {formatValue(selectionRange[0])}
                            </div>
                            <div className="px-2 py-1 text-xs bg-gray-900 text-white rounded">
                                {formatValue(selectionRange[1])}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="absolute top-0 bottom-0 cursor-ew-resize z-20"
                    style={{
                        left: `${leftPercent}%`,
                        width: `${handleWidth}px`,
                        transform: `translateX(-${handleWidth / 2}px)`,
                    }}
                    onMouseDown={(e) => startDrag(e, 'left')}
                    onTouchStart={(e) => startDrag(e, 'left')}
                >
                    <div className="w-1 h-full bg-white dark:bg-gray-200 mx-auto" />
                    {showTooltips && (showTooltip === 'left' || showTooltip === 'both') && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 px-2 py-1 text-xs bg-gray-900 text-white rounded">
                            {formatValue(selectionRange[0])}
                        </div>
                    )}
                </div>

                <div
                    className="absolute top-0 bottom-0 cursor-ew-resize z-20"
                    style={{
                        left: `${rightPercent}%`,
                        width: `${handleWidth}px`,
                        transform: `translateX(-${handleWidth / 2}px)`,
                    }}
                    onMouseDown={(e) => startDrag(e, 'right')}
                    onTouchStart={(e) => startDrag(e, 'right')}
                >
                    <div className="w-1 h-full bg-white dark:bg-gray-200 mx-auto" />
                    {showTooltips && (showTooltip === 'right' || showTooltip === 'both') && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 px-2 py-1 text-xs bg-gray-900 text-white rounded">
                            {formatValue(selectionRange[1])}
                        </div>
                    )}
                </div>
            </div>

            {showLabels && (
                <div className="flex justify-between mt-2 text-sm">
                    <div className="text-gray-700 dark:text-gray-300">
                        {formatValue(selectionRange[0])}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                        {formatValue(selectionRange[1])}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RangeBrush;