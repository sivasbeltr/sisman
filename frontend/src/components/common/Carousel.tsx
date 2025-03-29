import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid';
import { classNames } from '../../utils/classNames';

export interface CarouselProps {
    /** The slides to display in the carousel */
    children: React.ReactNode[];
    /** Whether to auto-play the carousel */
    autoPlay?: boolean;
    /** Interval between slides in ms when auto-playing */
    interval?: number;
    /** Whether to show indicators */
    indicators?: boolean;
    /** Whether to show controls */
    controls?: boolean;
    /** Additional CSS classes for the container */
    className?: string;
    /** Height of the carousel */
    height?: string;
    /** Whether to show thumbnails */
    thumbnails?: boolean;
    /** Whether to enable swipe gestures */
    swipeable?: boolean;
    /** Whether to enable fullscreen mode */
    fullscreen?: boolean;
    /** Optional captions for each slide */
    captions?: string[];
}

/**
 * Carousel component for cycling through elements like images or slides.
 */
export const Carousel: React.FC<CarouselProps> = ({
    children,
    autoPlay = false,
    interval = 5000,
    indicators = true,
    controls = true,
    className = '',
    height = 'h-64',
    thumbnails = false,
    swipeable = true,
    fullscreen = false,
    captions,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    const slides = React.Children.toArray(children);

    const nextSlide = useCallback(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    }, [slides.length]);

    const goToSlide = (index: number) => {
        setActiveIndex(index);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Auto-play logic
    useEffect(() => {
        if (autoPlay && !isPaused && !isFullscreen) {
            timerRef.current = setInterval(nextSlide, interval);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [autoPlay, interval, nextSlide, isPaused, isFullscreen, activeIndex]);

    // Swipe handling
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!swipeable) return;
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!swipeable || touchStartX.current === null) return;
        const touchEndX = e.touches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        if (Math.abs(diff) > 50) { // Minimum swipe threshold
            if (diff > 0) nextSlide();
            else prevSlide();
            touchStartX.current = null;
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
    };

    return (
        <div
            ref={carouselRef}
            className={classNames(
                'relative overflow-hidden rounded-xl shadow-lg',
                isFullscreen ? 'fixed inset-0 z-50 bg-black' : height,
                className
            )}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Slides */}
            <div className={classNames('h-full w-full', isFullscreen ? 'flex items-center justify-center' : '')}>
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={classNames(
                            'absolute inset-0 transition-all duration-500 ease-in-out',
                            index === activeIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95'
                        )}
                    >
                        {isFullscreen ? (
                            <div className="flex h-full w-full items-center justify-center">
                                {slide}
                            </div>
                        ) : (
                            slide
                        )}
                        {/* Caption */}
                        {captions && captions[index] && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center text-sm text-white">
                                {captions[index]}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Controls */}
            {controls && slides.length > 1 && (
                <>
                    <button
                        type="button"
                        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-gray-800/70 p-2 text-white hover:bg-gray-800/90 focus:outline-none focus:ring-2 focus:ring-white/50"
                        onClick={prevSlide}
                        aria-label="Önceki slayt"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-gray-800/70 p-2 text-white hover:bg-gray-800/90 focus:outline-none focus:ring-2 focus:ring-white/50"
                        onClick={nextSlide}
                        aria-label="Sonraki slayt"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </>
            )}

            {/* Fullscreen Button */}
            {fullscreen && (
                <button
                    type="button"
                    className="absolute right-4 top-4 z-20 rounded-full bg-gray-800/70 p-2 text-white hover:bg-gray-800/90 focus:outline-none focus:ring-2 focus:ring-white/50"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Tam ekrandan çık' : 'Tam ekran yap'}
                >
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                </button>
            )}

            {/* Indicators */}
            {indicators && slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={classNames(
                                'h-2.5 w-2.5 rounded-full transition-all duration-300',
                                index === activeIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                            )}
                            onClick={() => goToSlide(index)}
                            aria-label={`Slayt ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Thumbnails */}
            {thumbnails && slides.length > 1 && (
                <div className="absolute bottom-0 left-0 z-20 flex w-full justify-center bg-gray-900/50 p-2">
                    <div className="flex space-x-2 overflow-x-auto">
                        {slides.map((slide, index) => (
                            <button
                                key={index}
                                type="button"
                                className={classNames(
                                    'h-16 w-24 flex-shrink-0 rounded-md border-2 transition-all duration-200',
                                    index === activeIndex ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
                                )}
                                onClick={() => goToSlide(index)}
                                aria-label={`Slayt ${index + 1}'e git`}
                            >
                                <div className="h-full w-full overflow-hidden">{slide}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Carousel;