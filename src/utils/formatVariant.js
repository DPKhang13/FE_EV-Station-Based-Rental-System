/**
 * Format variant về dạng First-letter capitalized
 * Workaround cho việc backend lowercase variant
 * 
 * @param {string} variant - Variant từ backend (có thể là "plus", "PLUS", "Plus")
 * @returns {string} Variant đã format ("Plus", "Air", "Pro")
 * 
 * @example
 * formatVariant("plus")  => "Plus"
 * formatVariant("PLUS")  => "Plus"
 * formatVariant("Plus")  => "Plus"
 * formatVariant("air")   => "Air"
 * formatVariant(null)    => ""
 */
export const formatVariant = (variant) => {
    if (!variant || typeof variant !== 'string') {
        return '';
    }
    
    // Trim whitespace
    const trimmed = variant.trim();
    
    if (trimmed.length === 0) {
        return '';
    }
    
    // First letter uppercase + rest lowercase
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

/**
 * Validate variant value
 * @param {string} variant - Variant to validate
 * @returns {boolean} True if valid variant
 */
export const isValidVariant = (variant) => {
    const validVariants = ['Air', 'Plus', 'Pro', 'Eco', 'Standard'];
    const formatted = formatVariant(variant);
    return validVariants.includes(formatted);
};

/**
 * Get variant display name (có thể customize sau)
 * @param {string} variant
 * @returns {string} Display name
 */
export const getVariantDisplayName = (variant) => {
    const formatted = formatVariant(variant);
    
    // Có thể thêm mapping nếu cần
    const displayMap = {
        'Air': 'Air',
        'Plus': 'Plus',
        'Pro': 'Pro',
        'Eco': 'Eco',
        'Standard': 'Standard'
    };
    
    return displayMap[formatted] || formatted;
};

export default formatVariant;
