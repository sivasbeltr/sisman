import React from 'react';

/**
 * Timeline orientation options
 */
export type TimelineOrientation = 'vertical' | 'horizontal';

/**
 * Timeline alignment options for vertical orientation
 */
export type TimelineAlign = 'left' | 'right' | 'alternate';

/**
 * Status options for timeline items
 */
export type TimelineItemStatus = 'completed' | 'current' | 'pending';

/**
 * Props for the Timeline component
 */
export interface TimelineProps {
    /** Timeline items */
    children: React.ReactNode;
    /** Orientation of the timeline */
    orientation?: TimelineOrientation;
    /** Alignment of timeline items (for vertical orientation) */
    align?: TimelineAlign;
    /** Additional CSS classes for the timeline */
    className?: string;
    /** Whether to add line connectors between items */
    withConnectors?: boolean;
    /** Color of the connectors */
    connectorColor?: string;
    /** Width/thickness of the connectors */
    connectorWidth?: number;
    /** Configures the maximum width of the timeline in horizontal mode */
    maxWidth?: string;
}

/**
 * Timeline container component that manages the layout and orientation of timeline items.
 * 
 * @example
 * <Timeline orientation="vertical" align="left">
 *   <TimelineItem title="İlk Adım" status="completed">
 *     İlk adım içeriği
 *   </TimelineItem>
 *   <TimelineItem title="İkinci Adım" status="current">
 *     Şu anki adım
 *   </TimelineItem>
 * </Timeline>
 */
export const Timeline: React.FC<TimelineProps> = ({
    children,
    orientation = 'vertical',
    align = 'left',
    className = '',
    withConnectors = true,
    connectorColor = 'var(--color-primary, #3b82f6)',
    connectorWidth = 2,
    maxWidth = '100%',
}) => {
    // Base styles for the timeline
    const baseStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        maxWidth: orientation === 'horizontal' ? maxWidth : undefined,
        overflowX: orientation === 'horizontal' ? 'auto' : undefined,
        position: 'relative',
    };

    // Enhanced children with props
    const enhancedChildren = React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        // Calculate alignment for the specific child
        // Make sure we only pass 'left' or 'right' to TimelineItem
        let itemAlign: 'left' | 'right';
        if (align === 'alternate') {
            itemAlign = index % 2 === 0 ? 'left' : 'right';
        } else {
            itemAlign = align as 'left' | 'right'; // Safe because 'alternate' is handled above
        }

        // Pass additional props to TimelineItem components with type assertion
        return React.cloneElement(child as React.ReactElement<TimelineItemProps>, {
            orientation,
            align: itemAlign,
            isFirst: index === 0,
            isLast: index === React.Children.count(children) - 1,
            withConnector: withConnectors && index < React.Children.count(children) - 1,
            connectorColor,
            connectorWidth,
            index,
        });
    });

    return (
        <div className={`timeline ${orientation} ${className}`} style={baseStyles}>
            {enhancedChildren}
        </div>
    );
};

/**
 * Props for the TimelineItem component
 */
export interface TimelineItemProps {
    /** The content to display inside the timeline item */
    children: React.ReactNode;
    /** Title of the timeline item */
    title?: React.ReactNode;
    /** Optional subtitle for additional context */
    subtitle?: React.ReactNode;
    /** Optional date or timestamp */
    date?: React.ReactNode;
    /** Current status of this item in the timeline */
    status?: TimelineItemStatus;
    /** Optional icon or marker to display */
    icon?: React.ReactNode;
    /** Color of the dot/icon container */
    dotColor?: string;
    /** Background color of the dot/icon container */
    dotBgColor?: string;
    /** Size of the dot/icon container */
    dotSize?: number;
    /** Additional CSS classes for the timeline item */
    className?: string;
    /** Additional CSS classes for the content */
    contentClassName?: string;
    /** Whether the item is clickable */
    clickable?: boolean;
    /** Click handler for the item */
    onClick?: () => void;

    // Props automatically passed by parent Timeline component
    /** Orientation inherited from parent (internal) */
    orientation?: TimelineOrientation;
    /** Alignment inherited from parent (internal) */
    align?: 'left' | 'right';
    /** Whether this is the first item (internal) */
    isFirst?: boolean;
    /** Whether this is the last item (internal) */
    isLast?: boolean;
    /** Whether to show connector to the next item (internal) */
    withConnector?: boolean;
    /** Color of connectors (internal) */
    connectorColor?: string;
    /** Width of connectors (internal) */
    connectorWidth?: number;
    /** Index of this item (internal) */
    index?: number;
}

/**
 * TimelineItem component represents a single event/milestone in a timeline sequence.
 * 
 * @example
 * <TimelineItem 
 *   title="Başvuru Onaylandı" 
 *   subtitle="İlk aşama" 
 *   date="10.05.2023"
 *   status="completed" 
 *   icon={<CheckIcon />}
 * >
 *   Başvurunuz başarıyla onaylandı ve işleme alındı.
 * </TimelineItem>
 */
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

    // Props from parent Timeline
    orientation = 'vertical',
    align = 'left',
    isLast = false,
    withConnector = true,
    connectorColor = 'var(--color-primary, #3b82f6)',
    connectorWidth = 2,
}) => {
    // Define status-specific colors if custom colors aren't provided
    const getStatusColor = () => {
        if (dotColor) return dotColor;

        switch (status) {
            case 'completed':
                return '#10b981'; // green-500
            case 'current':
                return '#3b82f6'; // blue-500
            case 'pending':
                return '#9ca3af'; // gray-400
            default:
                return '#9ca3af'; // gray-400
        }
    };

    const getStatusBgColor = () => {
        if (dotBgColor) return dotBgColor;

        switch (status) {
            case 'completed':
                return '#d1fae5'; // green-100
            case 'current':
                return '#dbeafe'; // blue-100
            case 'pending':
                return '#f3f4f6'; // gray-100
            default:
                return '#f3f4f6'; // gray-100
        }
    };

    // Default icon based on status if no custom icon
    const statusIcon = () => {
        if (icon) return icon;

        switch (status) {
            case 'completed':
                return (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                );
            case 'current':
                return (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="5" />
                    </svg>
                );
            case 'pending':
                return (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                );
            default:
                return null;
        }
    };

    // Style variables
    const color = getStatusColor();
    const backgroundColor = getStatusBgColor();

    // Generate specific classes and styles based on orientation and alignment
    const getTimelineItemClasses = () => {
        const baseClasses = 'timeline-item relative';
        const orientationClass = orientation === 'vertical' ? 'timeline-vertical' : 'timeline-horizontal';
        const alignClass = orientation === 'vertical' ? `timeline-align-${align}` : '';
        const clickableClass = clickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : '';

        return `${baseClasses} ${orientationClass} ${alignClass} ${clickableClass} ${className}`;
    };

    // Container style based on orientation
    const containerStyle: React.CSSProperties = orientation === 'vertical'
        ? {
            position: 'relative',
            padding: '12px 0',
            display: 'flex',
            flexDirection: align === 'left' ? 'row' : 'row-reverse',
        }
        : {
            position: 'relative',
            padding: '0 12px',
            flex: '1 0 auto',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '150px',
            maxWidth: '300px',
        };

    // Connector styles - FIXED to ensure continuous line with no gaps
    const connectorStyles = (): React.CSSProperties => {

        if (orientation === 'vertical') {
            return {
                position: 'absolute',
                // Remove the adjustment for the active item - ensure line starts from the top
                top: 0,
                // If it's the last item, stop at dot center, otherwise go all the way to bottom
                bottom: isLast ? 'auto' : 0,
                height: isLast ? `${dotSize / 2}px` : '100%',
                // Align with the center of the dot based on alignment
                left: align === 'left' ? `${dotSize / 2}px` : 'auto',
                right: align === 'right' ? `${dotSize / 2}px` : 'auto',
                width: `${connectorWidth}px`,
                // Use the same color as the dots for a continuous look
                backgroundColor: connectorColor,
                // Ensure the connector is behind the dot
                zIndex: 1
            };
        } else {
            return {
                position: 'absolute',
                // Remove the adjustment for the active item - ensure line starts from the left
                left: 0,
                // If it's the last item, stop at dot center, otherwise go all the way to right
                right: isLast ? 'auto' : 0,
                width: isLast ? `${dotSize / 2}px` : '100%',
                // Align with the center of the dot
                top: `${dotSize / 2}px`,
                height: `${connectorWidth}px`,
                // Use the same color as the dots for a continuous look
                backgroundColor: connectorColor,
                // Ensure the connector is behind the dot
                zIndex: 1
            };
        }
    };

    // Content placement based on orientation and alignment
    const contentStyle: React.CSSProperties = orientation === 'vertical'
        ? {
            padding: align === 'left' ? '0 0 0 16px' : '0 16px 0 0',
            flex: 1,
        }
        : {
            padding: '16px 0 0 0',
            flex: 1,
        };

    return (
        <div
            className={getTimelineItemClasses()}
            onClick={clickable && onClick ? onClick : undefined}
            aria-current={status === 'current' ? 'step' : undefined}
        >
            <div style={containerStyle}>
                {/* Connector line - Move this BEFORE the dot so the dot appears on top of the line */}
                {withConnector && (
                    <div className="timeline-connector" style={connectorStyles()} />
                )}

                {/* Dot/Icon - Increase z-index to make sure it's above the connector line */}
                <div
                    className="timeline-dot flex items-center justify-center rounded-full z-20"
                    style={{
                        backgroundColor,
                        color,
                        width: `${dotSize}px`,
                        height: `${dotSize}px`,
                        border: `${Math.max(1, connectorWidth - 1)}px solid ${color}`,
                        flexShrink: 0,
                        position: 'relative', // Add position relative to establish a new stacking context
                    }}
                >
                    {statusIcon()}
                </div>

                {/* Content */}
                <div className={`timeline-content ${contentClassName}`} style={contentStyle}>
                    <div className="timeline-header flex items-center mb-1">
                        {title && (
                            <h4 className="text-base font-medium text-gray-900 dark:text-white mr-2">
                                {title}
                            </h4>
                        )}
                        {date && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {date}
                            </span>
                        )}
                    </div>

                    {subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            {subtitle}
                        </p>

                    )}

                    <div className="timeline-body text-sm text-gray-700 dark:text-gray-400">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
