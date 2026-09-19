import { type ClassValue, clsx } from "clsx"

/**
 * Joins class name values, dropping falsy ones.
 *
 * Components use it as `cn(styleProps.className, className)`: the first
 * argument is the atom list StyleX produced, the second whatever the caller
 * passed through `className`. There is nothing to de-duplicate — StyleX
 * already resolves conflicts between its own atoms inside `stylex.props()`,
 * and a caller's class names are opaque to us. Callers that need to override a
 * StyleX declaration use the `sx` prop, which wins by being the last argument
 * to `stylex.props()`.
 */
export const cn = (...inputs: ClassValue[]) => clsx(inputs)
