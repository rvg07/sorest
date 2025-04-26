export const generateUniqueId = (prefix) =>
    `${prefix}_${
        crypto.randomUUID ? crypto.randomUUID() : Date.now() + "_" + Math.random()
    }`;

// we make sure items in an array have unique string ids => to avoid conflicts
export const ensureStableStringIds = (items = [], prefix) => {
    if (!Array.isArray(items)) return [];
    const usedIds = new Set();
    return items.map(item => {
        let stableId = item?.id !== undefined && item.id !== null ? String(item.id) : null;

        if (stableId === null || stableId === '' || usedIds.has(stableId)) {
            stableId = generateUniqueId(prefix);
        }
        usedIds.add(stableId);
        return {
            ...item,
            id: stableId,
            enabled: item?.enabled !== false,
        };
    });
};
