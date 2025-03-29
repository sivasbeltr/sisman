import React from 'react';

/**
 * Props for the Card component
 */
export interface CardProps {
    /** Card content */
    children: React.ReactNode;
    /** Optional card title */
    title?: React.ReactNode;
    /** Optional card subtitle */
    subtitle?: React.ReactNode;
    /** Optional card image */
    image?: string;
    /** Optional card image alt text */
    imageAlt?: string;
    /** Image position - top or bottom */
    imagePosition?: 'top' | 'bottom';
    /** Optional card footer content */
    footer?: React.ReactNode;
    /** Optional card header content (overrides title/subtitle) */
    header?: React.ReactNode;
    /** Card border style */
    bordered?: boolean;
    /** Card shadow style */
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    /** Whether to add padding to the card body */
    bodyPadding?: boolean;
    /** Card visual variant */
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
    /** Whether the card is in a horizontal layout */
    horizontal?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Additional CSS classes for the body */
    bodyClassName?: string;
    /** Additional CSS classes for the header */
    headerClassName?: string;
    /** Additional CSS classes for the footer */
    footerClassName?: string;
    /** Additional CSS classes for the image */
    imageClassName?: string;
    /** Card click handler */
    onClick?: () => void;
    /** Whether the card is hoverable */
    hoverable?: boolean;
}

/**
 * Compound component type for Card with subcomponents
 */
type CardComponent = React.FC<CardProps> & {
    Body: typeof CardBody;
    Header: typeof CardHeader;
    Footer: typeof CardFooter;
    Image: typeof CardImage;
    Title: typeof CardTitle;
    Subtitle: typeof CardSubtitle;
};

/**
 * A versatile card component with support for headers, footers, images, and different styles.
 * 
 * @example
 * <Card 
 *   title="Kart Başlığı"
 *   subtitle="Alt başlık"
 *   image="/path/to/image.jpg"
 *   footer={<Button>İşlem Yap</Button>}
 *   shadow="md"
 * >
 *   <p>Kart içeriği burada yer alıyor.</p>
 * </Card>
 */
export const Card: CardComponent = ({
    children,
    title,
    subtitle,
    image,
    imageAlt = '',
    imagePosition = 'top',
    footer,
    header,
    bordered = true,
    shadow = 'sm',
    bodyPadding = true,
    variant = 'default',
    horizontal = false,
    className = '',
    bodyClassName = '',
    headerClassName = '',
    footerClassName = '',
    imageClassName = '',
    onClick,
    hoverable = false,
}) => {
    // Shadow classes
    const shadowClasses = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow',
        lg: 'shadow-lg',
    };

    // Variant classes
    const variantClasses = {
        default: '',
        primary: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        secondary: 'border-gray-500 bg-gray-50 dark:bg-gray-800',
        success: 'border-green-500 bg-green-50 dark:bg-green-900/20',
        danger: 'border-red-500 bg-red-50 dark:bg-red-900/20',
        warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
        info: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
    };

    // Build card classes
    const cardClasses = `
        overflow-hidden 
        ${bordered ? 'border border-gray-200 dark:border-gray-700' : ''}
        ${shadowClasses[shadow]} 
        ${variantClasses[variant]}
        rounded-lg
        ${onClick || hoverable ? 'cursor-pointer transition-transform duration-200 hover:-translate-y-1' : ''}
        ${horizontal ? 'flex flex-col md:flex-row' : ''}
        ${className}
    `;

    // Build image classes
    const imageContainerClasses = `
        ${horizontal ? 'md:w-2/5 overflow-hidden' : 'w-full'}
        ${imageClassName}
    `;

    // Build body container classes
    const bodyContainerClasses = `
        ${horizontal ? 'md:w-3/5' : 'w-full'}
        ${bodyPadding ? 'p-4' : ''}
        ${bodyClassName}
    `;

    // Determine if the card should render a header
    const hasHeader = header || title || subtitle;

    // Determine if the card should render an image
    const hasImage = !!image;

    // Create click handler
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    // Render different layouts based on image position and horizontal flag
    const renderContent = () => {
        // Render image
        const renderImage = () => {
            if (!hasImage) return null;
            return (
                <div className={imageContainerClasses}>
                    <img
                        src={image}
                        alt={imageAlt}
                        className="w-full h-full object-cover"
                    />
                </div>
            );
        };

        // Render header
        const renderHeader = () => {
            if (!hasHeader) return null;

            if (header) {
                return (
                    <div className={`border-b border-gray-200 dark:border-gray-700 p-4 ${headerClassName}`}>
                        {header}
                    </div>
                );
            }

            return (
                <div className={`border-b border-gray-200 dark:border-gray-700 p-4 ${headerClassName}`}>
                    {title && (
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>
            );
        };

        // Render footer
        const renderFooter = () => {
            if (!footer) return null;
            return (
                <div className={`border-t border-gray-200 dark:border-gray-700 p-4 ${footerClassName}`}>
                    {footer}
                </div>
            );
        };

        // Render main content based on horizontal and image position
        if (horizontal) {
            return (
                <>
                    {imagePosition === 'top' && renderImage()}
                    <div className={bodyContainerClasses}>
                        {renderHeader()}
                        <div className="h-full flex flex-col">
                            <div className="flex-grow">{children}</div>
                            {renderFooter()}
                        </div>
                    </div>
                    {imagePosition === 'bottom' && renderImage()}
                </>
            );
        }

        return (
            <>
                {imagePosition === 'top' && renderImage()}
                {renderHeader()}
                <div className={bodyContainerClasses}>{children}</div>
                {renderFooter()}
                {imagePosition === 'bottom' && renderImage()}
            </>
        );
    };

    return (
        <div
            className={`bg-white dark:bg-gray-800 ${cardClasses}`}
            onClick={handleClick}
        >
            {renderContent()}
        </div>
    );
};

/**
 * Card.Body component for semantic markup
 */
export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`p-4 ${className}`} {...props}>
            {children}
        </div>
    );
};

/**
 * Card.Header component for semantic markup
 */
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props}>
            {children}
        </div>
    );
};

/**
 * Card.Footer component for semantic markup
 */
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
            {children}
        </div>
    );
};

/**
 * Card.Image component for semantic markup
 */
export const CardImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & {
    position?: 'top' | 'bottom'
}> = ({
    className = '',
    position = 'top',
    ...props
}) => {
        return (
            <img
                className={`w-full ${className}`}
                data-position={position}
                {...props}
            />
        );
    };

/**
 * Card.Title component for semantic markup
 */
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${className}`} {...props}>
            {children}
        </h3>
    );
};

/**
 * Card.Subtitle component for semantic markup
 */
export const CardSubtitle: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className}`} {...props}>
            {children}
        </p>
    );
};

// Add subcomponents to Card for dot notation usage
Card.Body = CardBody;
Card.Header = CardHeader;
Card.Footer = CardFooter;
Card.Image = CardImage;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
