/**
 * Combines multiple class names into a single string.
 * @param {...(string|boolean|undefined|null)} classes 
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
