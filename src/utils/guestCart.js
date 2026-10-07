


const STORAGE_KEY = 'guestCart';

export const getGuestCartItems = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveGuestCartItems = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
};

export const addToGuestCart = (bookId, quantity = 1) => {
    const items = getGuestCartItems();
    const existing = items.find((i) => i.bookId === bookId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        items.push({ bookId, quantity });
    }
    saveGuestCartItems(items);
    return items;
};

export const updateGuestCartItem = (bookId, quantity) => {
    let items = getGuestCartItems();
    if (quantity <= 0) {
        items = items.filter((i) => i.bookId !== bookId);
    } else {
        const existing = items.find((i) => i.bookId === bookId);
        if (existing) existing.quantity = quantity;
    }
    saveGuestCartItems(items);
    return items;
};

export const removeFromGuestCart = (bookId) => {
    const items = getGuestCartItems().filter((i) => i.bookId !== bookId);
    saveGuestCartItems(items);
    return items;
};

export const clearGuestCart = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
};

export const getGuestCartCount = () => {
    return getGuestCartItems().reduce((total, item) => total + item.quantity, 0);
};
