import api from './api';
import {
    getGuestCartItems,
    addToGuestCart,
    updateGuestCartItem,
    removeFromGuestCart,
} from '../utils/guestCart';


const isGuest = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');


    return !token || role === 'ADMIN' || role === 'MANAGER';
};


const buildGuestCartResponse = async () => {
    const guestItems = getGuestCartItems();
    if (guestItems.length === 0) {
        return { cartId: null, items: [], totalPrice: 0 };
    }

    const bookDetails = await Promise.all(
        guestItems.map(async (item) => {
            try {
                const res = await api.get(`/books/${item.bookId}`);
                const book = res.data.object || res.data;
                const unitPrice = book.discountPercentage > 0
                    ? book.price - (book.price * (book.discountPercentage / 100))
                    : book.price;
                return {
                    id: item.bookId, 
                    bookId: book.id,
                    bookTitle: book.title,
                    coverImageUrl: book.coverImageUrl,
                    authorName: book.authorName,
                    categoryName: book.categoryName,
                    stockQuantity: book.stockQuantity,
                    originalPrice: book.price,
                    unitPrice,
                    quantity: Math.min(item.quantity, book.stockQuantity || item.quantity),
                    subTotal: unitPrice * Math.min(item.quantity, book.stockQuantity || item.quantity),
                };
            } catch {
                return null; 
            }
        })
    );

    const items = bookDetails.filter(Boolean);
    const totalPrice = items.reduce((sum, i) => sum + i.subTotal, 0);
    return { cartId: null, items, totalPrice };
};


export const fetchCart = async () => {
    if (isGuest()) {
        return buildGuestCartResponse();
    }
    const response = await api.get('/cart');
    return response.data.object || response.data;
};


export const addToCart = async (bookId, quantity = 1) => {
    if (isGuest()) {
        addToGuestCart(bookId, quantity); 
        return buildGuestCartResponse();
    }
    const response = await api.post('/cart/add', { bookId, quantity });
    window.dispatchEvent(new Event('cartUpdated'));
    return response.data.object || response.data;
};


export const updateCartItem = async (id, quantity) => {
    if (isGuest()) {
        updateGuestCartItem(id, quantity);
        return buildGuestCartResponse();
    }
    const response = await api.put(`/cart/item/${id}`, null, { params: { quantity } });
    window.dispatchEvent(new Event('cartUpdated'));
    return response.data.object || response.data;
};


export const removeFromCart = async (id) => {
    if (isGuest()) {
        removeFromGuestCart(id);
        return buildGuestCartResponse();
    }
    const response = await api.delete(`/cart/item/${id}`);
    window.dispatchEvent(new Event('cartUpdated'));
    return response.data.object || response.data;
};


export const mergeGuestCartIntoAccount = async () => {
    const guestItems = getGuestCartItems();
    if (guestItems.length === 0) return;

    try {
        await api.post('/cart/merge', guestItems.map((i) => ({ bookId: i.bookId, quantity: i.quantity })));
        localStorage.removeItem('guestCart');
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
        console.error('Misafir sepeti birleştirilemedi:', error);
        
    }
};
