/**
 * Utility function to conditionally join CSS class names together.
 * 
 * @param classes - Any number of class names or conditional class expressions
 * @returns A string of space-separated class names, with falsy values filtered out
 * 
 * @example
 * // Basic usage
 * classNames('btn', 'btn-primary') // 'btn btn-primary'
 * 
 * @example
 * // With conditionals
 * classNames('btn', isActive && 'btn-active', hasError ? 'btn-error' : 'btn-normal')
 * 
 * @example
 * // With arrays and objects (not supported in this implementation)
 * classNames('btn', ['btn-sm', 'rounded'], { 'disabled': isDisabled })
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
