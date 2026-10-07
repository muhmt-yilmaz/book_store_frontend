


export const normalizeUrl = (value) => {
    if (!value) return value;
    const trimmed = value.trim();
    if (trimmed === '') return trimmed;
    if (/^https?:\/\
    return `https://${trimmed}`;
};
