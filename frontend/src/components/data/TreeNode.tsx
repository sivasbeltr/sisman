import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

/**
 * Represents a node item structure in the tree
 */
export interface TreeNodeItemData {
    /** Unique identifier for the node */
    id: string;
    /** Display label for the node */
    label: string;
    /** Icon element to display before the label */
    icon?: React.ReactNode;
    /** Custom render function for the label */
    renderLabel?: (node: TreeNodeItemData) => React.ReactNode;
    /** Whether node is currently expanded */
    expanded?: boolean;
    /** Whether node is currently selected */
    selected?: boolean;
    /** Whether node is currently checked (if checkboxes are enabled) */
    checked?: boolean;
    /** Whether node is in indeterminate checked state */
    indeterminate?: boolean;
    /** Whether node is currently disabled */
    disabled?: boolean;
    /** Children nodes */
    children?: TreeNodeItemData[];
    /** Additional custom properties */
    [key: string]: any;
}

/**
 * Props for the TreeNode component
 */
export interface TreeNodeProps {
    /** The tree node data */
    item?: TreeNodeItemData;
    /** Label text to display */
    label?: React.ReactNode;
    /** Icon to display next to the label */
    icon?: React.ReactNode;
    /** Whether the node is expanded */
    expanded?: boolean;
    /** Whether the node is selected */
    selected?: boolean;
    /** Whether the node is checked (when using checkboxes) */
    checked?: boolean;
    /** Whether the node is in indeterminate state (partially checked) */
    indeterminate?: boolean;
    /** Whether the node is disabled */
    disabled?: boolean;
    /** Level of nesting (used for indentation) */
    level?: number;
    /** Child nodes */
    children?: React.ReactNode;
    /** Handler for expand/collapse toggle */
    onExpand?: (expanded: boolean) => void;
    /** Handler for selection */
    onSelect?: () => void;
    /** Handler for checkbox state change */
    onCheck?: (checked: boolean, e?: React.ChangeEvent<HTMLInputElement>) => void;
    /** Custom renderer for the node content */
    renderLabel?: (node: TreeNodeProps) => React.ReactNode;
    /** Whether to show checkboxes */
    showCheckbox?: boolean;
    /** Position of the checkbox (left or right) */
    checkboxPosition?: 'left' | 'right';
    /** Indicates if node is last in its parent's list */
    isLastChild?: boolean;
    /** Indicates if node has children */
    hasChildren?: boolean;
    /** Whether node was expanded by default */
    defaultExpanded?: boolean;
    /** Custom additional CSS classes */
    className?: string;
    /** Whether to show connecting lines between nodes */
    showLines?: boolean;
    /** Color of connection lines */
    lineColor?: string;
    /** Parent node path (array of parent IDs) */
    parentPath?: string[];
}

/**
 * TreeNode component for representing a single node in the tree
 */
const TreeNode: React.FC<TreeNodeProps> = ({
    item,
    label,
    icon,
    expanded = false,
    selected = false,
    checked = false,
    indeterminate = false,
    disabled = false,
    level = 0,
    children,
    onExpand,
    onSelect,
    onCheck,
    renderLabel,
    showCheckbox = false,
    checkboxPosition = 'left',
    isLastChild = false,
    hasChildren: propHasChildren,
    defaultExpanded = false,
    className = '',
    showLines = false,
    lineColor = '#E5E7EB',
    parentPath = [],
}) => {
    const nodeLabel = item?.label || label;
    const nodeIcon = item?.icon || icon;
    const nodeDisabled = item?.disabled || disabled;

    const [isExpanded, setIsExpanded] = useState(item?.expanded || expanded || defaultExpanded);
    const [isChecked, setIsChecked] = useState(item?.checked || checked);
    const [isIndeterminate, setIsIndeterminate] = useState(item?.indeterminate || indeterminate);
    const [isSelected, setIsSelected] = useState(item?.selected || selected);

    const hasChildren = propHasChildren || React.Children.count(children) > 0 || (item?.children && item.children.length > 0);

    const checkboxRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    useEffect(() => {
        setIsChecked(item?.checked || checked);
    }, [item?.checked, checked]);

    useEffect(() => {
        setIsIndeterminate(item?.indeterminate || indeterminate);
    }, [item?.indeterminate, indeterminate]);

    useEffect(() => {
        setIsExpanded(item?.expanded || expanded || defaultExpanded);
    }, [item?.expanded, expanded, defaultExpanded]);

    useEffect(() => {
        setIsSelected(item?.selected || selected);
    }, [item?.selected, selected]);

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        if (onExpand) {
            onExpand(newExpanded);
        }
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!nodeDisabled) {
            const newSelected = !isSelected;
            setIsSelected(newSelected);
            if (onSelect) {
                onSelect();
            }
        }
    };

    const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (!nodeDisabled) {
            const newChecked = e.target.checked;
            setIsChecked(newChecked);
            setIsIndeterminate(false);
            if (onCheck) {
                onCheck(newChecked, e);
            }
        }
    };

    const paddingLeft = `${(level * 1.5) + 0.75}rem`;

    const renderCheckbox = () => {
        if (!showCheckbox) return null;

        return (
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={checkboxRef}
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                               transition duration-150 ease-in-out
                               ${nodeDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    checked={isChecked}
                    disabled={nodeDisabled}
                    onChange={handleCheck}
                    aria-label={`Select ${nodeLabel}`}
                />
            </div>
        );
    };

    const renderConnectionLines = () => {
        if (!showLines) return null;

        // Create connection lines based on parent path and current node position
        return (
            <div className="absolute left-0 top-0 bottom-0" style={{ width: paddingLeft }}>
                {/* Vertical line for current node */}
                {level > 0 && (
                    <div
                        className="absolute h-full"
                        style={{
                            width: '1px',
                            backgroundColor: lineColor,
                            left: `calc(${(level - 0.5) * 1.5}rem)`,
                            top: 0,
                            bottom: isLastChild ? '50%' : 0
                        }}
                    />
                )}

                {/* Horizontal line connecting to the current node */}
                {level > 0 && (
                    <div
                        className="absolute top-1/2 h-px"
                        style={{
                            backgroundColor: lineColor,
                            left: `calc(${(level - 0.5) * 1.5}rem)`,
                            width: '0.75rem',
                            transform: 'translateY(-50%)'
                        }}
                    />
                )}

                {/* Lines for parent nodes */}
                {parentPath.map((_, idx) => {
                    if (idx >= level - 1) return null;

                    const isParentLastChild = parentPath[idx + 1] === 'last';
                    if (isParentLastChild) return null;

                    return (
                        <div
                            key={`line-${idx}`}
                            className="absolute h-full"
                            style={{
                                width: '1px',
                                backgroundColor: lineColor,
                                left: `calc(${(idx + 0.5) * 1.5}rem)`,
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`tree-node relative ${className}`}>
            {renderConnectionLines()}
            <div
                className={`tree-node-content flex items-center py-1.5 px-1 rounded-md transition-colors relative
                            ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}
                            ${nodeDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={handleSelect}
                aria-expanded={hasChildren ? isExpanded : undefined}
                role={hasChildren ? 'treeitem' : undefined}
                style={{ paddingLeft }}
            >
                {showCheckbox && checkboxPosition === 'left' && (
                    <div className="mr-1.5">{renderCheckbox()}</div>
                )}

                <div
                    className={`w-5 h-5 flex items-center justify-center mr-1.5 
                                ${hasChildren ? 'text-gray-500 cursor-pointer' : 'text-transparent'}`}
                    onClick={hasChildren ? handleToggleExpand : undefined}
                >
                    {hasChildren ? (
                        isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4 transition-transform duration-200" />
                        ) : (
                            <ChevronRightIcon className="h-4 w-4 transition-transform duration-200" />
                        )
                    ) : (
                        <span className="h-4 w-4"></span>
                    )}
                </div>

                {nodeIcon && (
                    <div className="mr-1.5">{nodeIcon}</div>
                )}

                <div className="node-label flex-grow truncate">
                    {renderLabel ? renderLabel({ item, label: nodeLabel }) : nodeLabel}
                </div>

                {showCheckbox && checkboxPosition === 'right' && (
                    <div className="ml-1.5">{renderCheckbox()}</div>
                )}
            </div>

            {hasChildren && isExpanded && (
                <div className="tree-node-children">
                    {children}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
