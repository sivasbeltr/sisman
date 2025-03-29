import React from 'react';
import { StepperItemProps, StepStatus } from './StepperItem';

export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepperProps {
    activeStep: number;
    children: React.ReactNode;
    orientation?: StepperOrientation;
    withConnectors?: boolean;
    showStepNumbers?: boolean;
    variant?: 'default' | 'outlined' | 'contained';
    activeColor?: string;
    completedColor?: string;
    showLabels?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onStepClick?: (index: number) => void;
    clickable?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
    activeStep,
    children,
    orientation = 'horizontal',
    withConnectors = true,
    showStepNumbers = true,
    variant = 'default',
    activeColor = 'var(--color-primary, #3b82f6)',
    completedColor = 'var(--color-success, #10b981)',
    showLabels = true,
    size = 'md',
    className = '',
    onStepClick,
    clickable = true,
}) => {
    const containerClasses = orientation === 'horizontal'
        ? 'flex items-start w-full'
        : 'flex flex-col';

    const enhancedChildren = React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const getStepStatus = (): StepStatus => {
            const childProps = child.props as Partial<StepperItemProps>;
            if (childProps.status) return childProps.status;
            if (index < activeStep) return 'completed';
            if (index === activeStep) return 'current';
            return 'pending';
        };

        return React.cloneElement(child, {
            ...(typeof child.props === 'object' ? child.props : {}),
            index,
            status: getStepStatus(),
            orientation,
            showStepNumbers,
            variant,
            activeColor,
            completedColor,
            showLabels,
            size,
            clickable: clickable && !(child.props as any).disabled,
            onStepClick: onStepClick ? () => onStepClick(index) : undefined,
            isFirst: index === 0,
            isLast: index === React.Children.count(children) - 1,
            withConnectors,
        } as StepperItemProps);
    });

    return (
        <div className={`stepper ${containerClasses} ${className}`}>
            {enhancedChildren}
        </div>
    );
};