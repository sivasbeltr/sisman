import React, { useState, useEffect, Children, isValidElement, cloneElement } from 'react';
import TreeNode, { TreeNodeProps, TreeNodeItemData } from './TreeNode';

/**
 * Props for the Tree component
 */
interface TreeProps {
    /** Child TreeNode components */
    children?: React.ReactNode;
    /** Data for generating the tree structure */
    data?: TreeNodeItemData[];
    /** Default expanded state for all nodes */
    defaultExpanded?: boolean;
    /** Specific node IDs that should be expanded by default */
    defaultExpandedIds?: string[];
    /** Whether to show checkboxes */
    showCheckbox?: boolean;
    /** Position of checkboxes (left or right) */
    checkboxPosition?: 'left' | 'right';
    /** Multiple selection mode */
    multiSelect?: boolean;
    /** Whether to show connecting lines between nodes */
    showLines?: boolean;
    /** Handler called when a node is selected */
    onNodeSelect?: (node: TreeNodeItemData, selected: boolean) => void;
    /** Handler called when a node is checked/unchecked */
    onNodeCheck?: (node: TreeNodeItemData, checked: boolean) => void;
    /** Handler called when a node is expanded/collapsed */
    onNodeExpand?: (node: TreeNodeItemData, expanded: boolean) => void;
    /** Custom class names to apply to the tree */
    className?: string;
    /** Custom line color */
    lineColor?: string;
    /** Whether to allow searching/filtering nodes */
    searchable?: boolean;
    /** Current search term */
    searchTerm?: string;
    /** Custom search function */
    searchMethod?: (node: TreeNodeItemData, term: string) => boolean;
    /** Whether to highlight matched search terms */
    highlightSearch?: boolean;
    /** Disable the whole tree */
    disabled?: boolean;
}

/**
 * Tree component for displaying hierarchical data structures
 */
const Tree: React.FC<TreeProps> = ({
    children,
    data,
    defaultExpanded = false,
    defaultExpandedIds = [],
    showCheckbox = false,
    checkboxPosition = 'left',
    multiSelect = true,
    showLines = true,
    onNodeSelect,
    onNodeCheck,
    onNodeExpand,
    className = '',
    lineColor = '#E5E7EB', // Default light border color from Tailwind
    searchable = false,
    searchTerm = '',
    searchMethod,
    highlightSearch = true,
    disabled = false,
}) => {
    // State for holding checked node IDs
    const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
    // State for holding indeterminate node IDs
    const [indeterminateKeys, setIndeterminateKeys] = useState<Set<string>>(new Set());
    // State for holding expanded node IDs
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(defaultExpandedIds));
    // State for holding the tree data with updated states
    const [treeData, setTreeData] = useState<TreeNodeItemData[]>([]);
    // State for holding selected node IDs
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    // Initialize tree data
    useEffect(() => {
        if (data) {
            const processedData = processInitialData(data);
            setTreeData(processedData);
        }
    }, [data]);

    // Process initial data to set default states
    const processInitialData = (nodes: TreeNodeItemData[]): TreeNodeItemData[] => {
        return nodes.map(node => {
            const isExpanded = defaultExpandedIds.includes(node.id) || defaultExpanded;

            // Update expanded keys if needed
            if (isExpanded) {
                expandedKeys.add(node.id);
            }

            // Process children recursively
            const children = node.children ? processInitialData(node.children) : undefined;

            return {
                ...node,
                expanded: isExpanded,
                children
            };
        });
    };

    // Helper to determine if a node matches search criteria
    const nodeMatchesSearch = (node: TreeNodeItemData, term: string): boolean => {
        if (!term) return true;

        if (searchMethod) {
            return searchMethod(node, term);
        }

        // Default search implementation (case insensitive contains)
        const normalizedTerm = term.toLowerCase();
        const nodeLabel = String(node.label).toLowerCase();
        return nodeLabel.includes(normalizedTerm);
    };

    // Helper to find if any child node matches search
    const anyChildMatches = (node: TreeNodeItemData, term: string): boolean => {
        if (!node.children) return false;

        return node.children.some(child =>
            nodeMatchesSearch(child, term) || anyChildMatches(child, term)
        );
    };

    // Apply search filtering to tree data
    const applySearch = (nodes: TreeNodeItemData[], term: string): TreeNodeItemData[] => {
        if (!term) return nodes;

        return nodes
            .map(node => {
                const nodeMatches = nodeMatchesSearch(node, term);
                const childrenMatch = anyChildMatches(node, term);

                // If this node or any child matches, include it
                if (nodeMatches || childrenMatch) {
                    return {
                        ...node,
                        expanded: childrenMatch ? true : node.expanded,
                        children: node.children ? applySearch(node.children, term) : undefined,
                    };
                }

                // This node and none of its children match, filter it out
                return null;
            })
            .filter(Boolean) as TreeNodeItemData[];
    };

    // Highlight search term in node label
    const highlightSearchTerm = (label: string, term: string): React.ReactNode => {
        if (!term || !highlightSearch) return label;

        const normalizedLabel = String(label);
        const normalizedTerm = term.toLowerCase();
        const index = normalizedLabel.toLowerCase().indexOf(normalizedTerm);

        if (index === -1) return normalizedLabel;

        return (
            <>
                {normalizedLabel.substring(0, index)}
                <span className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
                    {normalizedLabel.substring(index, index + term.length)}
                </span>
                {normalizedLabel.substring(index + term.length)}
            </>
        );
    };

    // Process checkboxes to handle parent-child relationships
    const processCheckboxState = (
        nodes: TreeNodeItemData[],
        checkedKeys: Set<string>,
        indeterminateKeys: Set<string>
    ): [Set<string>, Set<string>] => {
        nodes.forEach(node => {
            if (!node.children || node.children.length === 0) {
                // Leaf node, just use its checked state
                return;
            }

            // Process children recursively
            processCheckboxState(node.children, checkedKeys, indeterminateKeys);

            const checkedChildren = node.children.filter(child =>
                checkedKeys.has(child.id) && !indeterminateKeys.has(child.id)
            );
            const indeterminateChildren = node.children.filter(child =>
                indeterminateKeys.has(child.id)
            );

            // Update this node's state based on children
            if (checkedChildren.length === node.children.length) {
                // All children are checked, parent is checked
                checkedKeys.add(node.id);
                indeterminateKeys.delete(node.id);
            } else if (checkedChildren.length > 0 || indeterminateChildren.length > 0) {
                // Some children are checked, parent is indeterminate
                checkedKeys.delete(node.id);
                indeterminateKeys.add(node.id);
            } else {
                // No children are checked, parent is unchecked
                checkedKeys.delete(node.id);
                indeterminateKeys.delete(node.id);
            }
        });

        return [checkedKeys, indeterminateKeys];
    };

    // Handle node check state change with propagation
    const handleNodeCheck = (node: TreeNodeItemData, checked: boolean, propagate = true) => {
        const newCheckedKeys = new Set(checkedKeys);
        const newIndeterminateKeys = new Set(indeterminateKeys);

        if (checked) {
            newCheckedKeys.add(node.id);
            newIndeterminateKeys.delete(node.id);
        } else {
            newCheckedKeys.delete(node.id);
            newIndeterminateKeys.delete(node.id);
        }

        // Propagate to children if applicable
        if (propagate && node.children && node.children.length > 0) {
            propagateCheckToChildren(node.children, checked, newCheckedKeys, newIndeterminateKeys);
        }

        // Update parent states
        if (propagate && data) {
            processCheckboxState(data, newCheckedKeys, newIndeterminateKeys);
        }

        setCheckedKeys(newCheckedKeys);
        setIndeterminateKeys(newIndeterminateKeys);

        if (onNodeCheck) {
            onNodeCheck(node, checked);
        }
    };

    // Propagate check state to all children
    const propagateCheckToChildren = (
        nodes: TreeNodeItemData[],
        checked: boolean,
        checkedKeys: Set<string>,
        indeterminateKeys: Set<string>
    ) => {
        nodes.forEach(node => {
            if (checked) {
                checkedKeys.add(node.id);
                indeterminateKeys.delete(node.id);
            } else {
                checkedKeys.delete(node.id);
                indeterminateKeys.delete(node.id);
            }

            if (node.children && node.children.length > 0) {
                propagateCheckToChildren(node.children, checked, checkedKeys, indeterminateKeys);
            }
        });
    };

    // Handle node expansion
    const handleNodeExpand = (node: TreeNodeItemData, expanded: boolean) => {
        const newExpandedKeys = new Set(expandedKeys);

        if (expanded) {
            newExpandedKeys.add(node.id);
        } else {
            newExpandedKeys.delete(node.id);
        }

        setExpandedKeys(newExpandedKeys);

        if (onNodeExpand) {
            onNodeExpand(node, expanded);
        }
    };

    // Handle node selection
    const handleNodeSelect = (node: TreeNodeItemData, selected: boolean) => {
        const newSelectedKeys = new Set(selectedKeys);

        if (selected) {
            // In single select mode, clear previous selections first
            if (!multiSelect) {
                newSelectedKeys.clear();
            }
            newSelectedKeys.add(node.id);
        } else {
            newSelectedKeys.delete(node.id);
        }

        setSelectedKeys(newSelectedKeys);

        if (onNodeSelect) {
            onNodeSelect(node, selected);
        }
    };

    // Render tree from data
    const renderTreeNodes = (nodes?: TreeNodeItemData[], level = 0, parentKeys: string[] = []): React.ReactNode => {
        if (!nodes) return null;

        const filteredNodes = searchable && searchTerm
            ? applySearch(nodes, searchTerm)
            : nodes;

        return filteredNodes.map((node, index) => {
            const isChecked = checkedKeys.has(node.id);
            const isIndeterminate = indeterminateKeys.has(node.id);
            const isExpanded = expandedKeys.has(node.id);
            const isLastChild = index === filteredNodes.length - 1;
            const isSelected = selectedKeys.has(node.id);
            const currentPath = [...parentKeys, node.id];

            // Create a custom label renderer that highlights search matches
            const renderSearchLabel = () => {
                if (searchable && searchTerm && highlightSearch) {
                    return highlightSearchTerm(node.label as string, searchTerm);
                }
                return node.label;
            };

            return (
                <TreeNode
                    key={node.id}
                    item={node}
                    label={renderSearchLabel()}
                    icon={node.icon}
                    expanded={isExpanded}
                    checked={isChecked}
                    selected={isSelected}
                    indeterminate={isIndeterminate}
                    disabled={disabled || node.disabled}
                    level={level}
                    showCheckbox={showCheckbox}
                    checkboxPosition={checkboxPosition}
                    isLastChild={isLastChild}
                    hasChildren={node.children && node.children.length > 0}
                    onExpand={(expanded) => handleNodeExpand(node, expanded)}
                    onCheck={(checked) => handleNodeCheck(node, checked)}
                    onSelect={() => handleNodeSelect(node, !isSelected)}
                    showLines={showLines}
                    lineColor={lineColor}
                    parentPath={parentKeys}
                >
                    {renderTreeNodes(node.children, level + 1, currentPath)}
                </TreeNode>
            );
        });
    };

    // Process and enhance child TreeNode elements with proper props
    const processChildrenNodes = (children: React.ReactNode, level = 0, parentPath: string[] = []): React.ReactNode => {
        return Children.map(children, (child, index) => {
            if (!isValidElement<TreeNodeProps>(child)) return child;

            const childProps = child.props as TreeNodeProps;
            const isLastChild = index === Children.count(children) - 1;

            // Generate a key if not provided
            const key = child.key || `tree-node-${level}-${index}`;
            const nodeId = childProps.item?.id || `node-${level}-${index}`;
            const currentPath = [...parentPath, nodeId];

            // Check if this child has TreeNode children
            const hasChildren = Children.toArray(childProps.children).some(
                (c) => isValidElement(c) && c.type === TreeNode
            );

            const enhancedProps: Partial<TreeNodeProps> = {
                showCheckbox,
                checkboxPosition,
                level,
                isLastChild,
                hasChildren,
                showLines,
                lineColor,
                parentPath,
                selected: selectedKeys.has(nodeId),
                onSelect: () => {
                    // For JSX mode, we need to create a mock node
                    const mockNode: TreeNodeItemData = {
                        id: nodeId,
                        label: childProps.label as string,
                        icon: childProps.icon,
                        expanded: childProps.expanded,
                        selected: childProps.selected,
                        disabled: childProps.disabled,
                        children: hasChildren ? [] : undefined,
                    };
                    handleNodeSelect(mockNode, !selectedKeys.has(nodeId));
                }
            };

            // Recursively process any TreeNode children
            if (hasChildren) {
                return cloneElement(child, {
                    ...enhancedProps,
                    key,
                    children: processChildrenNodes(childProps.children, level + 1, currentPath),
                });
            }

            return cloneElement(child, {
                ...enhancedProps,
                key,
            });
        });
    };

    // Return the tree component with proper JSX
    return (
        <div
            className={`tree ${className} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
            role="tree"
        >
            {data ? (
                renderTreeNodes(treeData)
            ) : (
                processChildrenNodes(children)
            )}
        </div>
    );
};

export default Tree;
