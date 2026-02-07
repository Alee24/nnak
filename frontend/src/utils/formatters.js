/**
 * Fontend Data Formatters
 */

/**
 * Convert string to Title Case (Every word capitalized)
 * Best for Names
 */
export const toTitleCase = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

/**
 * Convert string to Sentence Case (Only first letter capitalized)
 * Best for designations, labels etc
 */
export const toSentenceCase = (str) => {
    if (!str || typeof str !== 'string') return str;
    const trimmed = str.trim();
    if (trimmed.length === 0) return str;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};
