import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart } from '../services/cartService';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import BookCover from '../components/BookCover';

const CartPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);


    
    const loadCart = async () => {
        try {
            const data = await fetchCart();
            setCart(data);
        } catch (error) {
            console.error("Sepet yüklenemedi:", error);
            toast.error("Sepet bilgileri alınırken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    
    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        setActionLoading(true);
        try {
            const data = await updateCartItem(cartItemId, newQuantity);
            setCart(data);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Adet güncellenirken hata oluştu."));
        } finally {
            setActionLoading(false);
        }
    };

    
    const handleRemoveItem = async (cartItemId) => {
        setActionLoading(true);
        try {
            const data = await removeFromCart(cartItemId);
            setCart(data);
            toast.success("Ürün sepetten çıkarıldı.");
        } catch (error) {
            console.error(error);
            toast.error("Ürün silinirken hata oluştu.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">Sepetiniz Yükleniyor...</div>;
    }


    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-8xl mb-6">🛒</div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sepetiniz Boş</h2>
                <p className="text-gray-500 mb-8 text-center max-w-md">
                    Görünüşe göre sepetinize henüz hiç kitap eklememişsiniz. Yeni dünyalar keşfetmek için kataloğumuza göz atın.
                </p>
                <Link to="/" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-md">
                    Alışverişe Başla
                </Link>
            </div>
        );
    }

    
    const cartTotal = cart.totalPrice || 0;

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Alışveriş Sepetim</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {}
                    <div className="w-full lg:w-2/3 space-y-4">
                        {cart.items.map((item) => {
                            
                            
                            const hasDiscount = item.unitPrice < item.originalPrice;

                            return (
                                <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 relative">
                                    
                                    {}
                                    <div className="w-24 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                        <BookCover src={item.coverImageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                                    </div>

                                    {}
                                    <div className="flex-grow text-center sm:text-left w-full">
                                        <div className="text-xs font-semibold text-primary uppercase mb-1">{item.categoryName}</div>
                                        <Link to={`/book/${item.bookId}`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1">
                                            {item.bookTitle}
                                        </Link>
                                        <p className="text-sm text-gray-500 mb-2">{item.authorName}</p>
                                        
                                        <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9 bg-gray-50">
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={actionLoading || item.quantity <= 1}
                                                    className="px-3 h-full hover:bg-gray-200 text-gray-600 font-bold disabled:opacity-50 transition-colors"
                                                >-</button>
                                                <span className="px-4 font-bold text-sm border-x border-gray-300 h-full flex items-center justify-center bg-white min-w-[2.5rem]">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={actionLoading || item.quantity >= item.stockQuantity}
                                                    className="px-3 h-full hover:bg-gray-200 text-gray-600 font-bold disabled:opacity-50 transition-colors"
                                                >+</button>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={actionLoading}
                                                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                                            >
                                                Kaldır
                                            </button>
                                        </div>
                                        {item.quantity >= item.stockQuantity && (
                                            <p className="text-xs text-amber-600 mt-2">Stokta bu üründen en fazla {item.stockQuantity} adet var.</p>
                                        )}
                                    </div>

                                    {}
                                    <div className="flex flex-col items-center sm:items-end flex-shrink-0 mt-4 sm:mt-0">
                                        {hasDiscount && (
                                            <span className="text-xs text-gray-400 line-through mb-1">{(item.originalPrice * item.quantity).toFixed(2)} ₺</span>
                                        )}
                                        <span className="text-xl font-extrabold text-gray-900">
                                            {item.subTotal.toFixed(2)} ₺
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">{item.unitPrice.toFixed(2)} ₺ / Adet</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Sipariş Özeti</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Ara Toplam</span>
                                    <span className="font-medium">{cartTotal.toFixed(2)} ₺</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Kargo Ücreti</span>
                                    <span className="font-medium text-green-600">Ücretsiz</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Genel Toplam</span>
                                <span className="text-3xl font-extrabold text-primary">{cartTotal.toFixed(2)} ₺</span>
                            </div>

                            <button 
                                onClick={() => navigate(token ? '/checkout' : '/login')} 
                                className="w-full bg-primary hover:bg-opacity-90 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md"
                            >
                                {token ? 'Sepeti Onayla' : 'Satın Almak İçin Giriş Yap / Kayıt Ol'}
                            </button>
                            {!token && (
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    Sepetiniz korunacak - giriş yapınca otomatik olarak hesabınıza aktarılacak.
                                </p>
                            )}

                            <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                                <span>🔒</span> 256-bit Güvenli Ödeme Altyapısı
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CartPage;
