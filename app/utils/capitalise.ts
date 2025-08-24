/**
 * Capitalises the first letter of a string.
 * @param str The string to capitalise.
 * @returns The capitalised string.
 */
export function capitalise(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}
