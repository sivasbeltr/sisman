import React from 'react';

export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineItemStatus = 'completed' | 'current' | 'pending';

export interface TimelineItemProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    date?: React.ReactNode;
    status?: TimelineItemStatus;
    icon?: React.ReactNode;
    dotColor?: string;
    dotBgColor?: string;
    dotSize?: number;
    className?: string;
    contentClassName?: string;
    clickable?: boolean;
    onClick?: () => void;
    orientation?: TimelineOrientation;
    align?: 'left' | 'right';
    isFirst?: boolean;
    isLast?: boolean;
    connectorColor?: string;
    connectorWidth?: number;
    index?: number;
    withConnectors?: boolean;
}
export const TimelineItem: React.FC<TimelineItemProps> = ({
    children,
    title,
    subtitle,
    date,
    status = 'pending',
    icon,
    dotColor,
    dotBgColor,
    dotSize = 24,
    className = '',
    contentClassName = '',
    clickable = false,
    onClick,
    orientation = 'vertical',
    align = 'left',
    connectorColor,
    connectorWidth = 2,
    isLast,
    withConnectors = true,
}) => {
    const getStatusColor = () => dotColor || {
        completed: '#10b981',
        current: '#3b82f6',
        pending: '#9ca3af',
    }[status];

    const getStatusBgColor = () => dotBgColor || {
        completed: 'rgba(16, 185, 129, 0.1)',
        current: 'rgba(59, 130, 246, 0.1)',
        pending: 'rgba(156, 163, 175, 0.1)',
    }[status];

    const statusIcon = () => {
        if (icon) return icon;
        switch (status) {
            case 'completed':
                return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;
            case 'current':
                return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></svg>;
            case 'pending':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>;
            default:
                return null;
        }
    };

    const color = getStatusColor();
    const backgroundColor = getStatusBgColor();
    const clickableClass = clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : '';

    return (
        <div
            className={`relative flex ${orientation === 'vertical' ? (align === 'left' ? 'flex-row' : 'flex-row-reverse') : 'flex-col items-center'} ${className} ${clickableClass}`}
            onClick={clickable && onClick ? onClick : undefined}
            aria-current={status === 'current' ? 'step' : undefined}
        >
            {/* Dot/Icon */}
            <div
                className="relative flex items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    backgroundColor,
                    color,
                    border: `2px solid ${color}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 10,
                }}
            >
                {statusIcon()}
            </div>

            {/* Connector */}
            {orientation === 'vertical' && withConnectors && !isLast && (
                <div
                    className="absolute w-0.5"
                    style={{
                        backgroundColor: connectorColor,
                        width: `${connectorWidth}px`,
                        top: `${dotSize}px`,
                        bottom: 0,
                        left: align === 'left' ? `${dotSize / 2 - connectorWidth / 2}px` : 'auto',
                        right: align === 'right' ? `${dotSize / 2 - connectorWidth / 2}px` : 'auto',
                    }}
                />
            )}
            {orientation === 'horizontal' && withConnectors && !isLast && (
                <div
                    className="flex-1 h-0.5"
                    style={{
                        backgroundColor: connectorColor,
                        height: `${connectorWidth}px`,
                        margin: '0 8px',
                    }}
                />
            )}

            {/* Content */}
            <div
                className={`flex-1 ${orientation === 'vertical' ? (align === 'left' ? 'ml-4' : 'mr-4') : 'mt-4 text-center'} ${contentClassName}`}
            >
                {(title || date) && (
                    <div className="flex items-center justify-between mb-1">
                        {title && <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h4>}
                        {date && <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>}
                    </div>
                )}
                {subtitle && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{subtitle}</p>}
                <div className="text-sm text-gray-700 dark:text-gray-200">{children}</div>
            </div>
        </div>
    );
};