import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';
import toast from 'react-hot-toast';
import BookCover from '../components/BookCover';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                
                
                const orderData = await getMyOrders();
                setOrders(Array.isArray(orderData) ? orderData : []);
            } catch (error) {
                console.error("Siparişler çekilemedi:", error);
                toast.error("Sipariş geçmişiniz yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1"><span>⏳</span> Hazırlanıyor</span>;
            case 'SHIPPED':
                return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1"><span>🚚</span> Kargoya Verildi</span>;
            case 'DELIVERED':
                return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1"><span>✅</span> Teslim Edildi</span>;
            case 'CANCELLED':
                return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1"><span>❌</span> İptal Edildi</span>;
            default:
                return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium animate-pulse">Siparişleriniz Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                    📦 Sipariş Geçmişim
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz Siparişiniz Yok</h2>
                        <p className="text-gray-500 mb-6">Kitaplığınızı genişletmek için harika eserler sizi bekliyor.</p>
                        <Link to="/" className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md">
                            Kataloğu Keşfet
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                
                                {}
                                <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                                        <div>
                                            <span className="block text-gray-500">Sipariş Tarihi</span>
                                            <span className="font-bold text-gray-900">
                                                {new Date(order.createdAt || Date.now()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500">Sipariş No</span>
                                            <span className="font-mono font-bold text-gray-900">#{order.id}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500">Toplam Tutar</span>
                                            <span className="font-bold text-primary">{order.totalPrice?.toFixed(2)} ₺</span>
                                        </div>
                                    </div>
                                    <div>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>

                                {}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.orderItems?.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0 last:pb-0">
                                                <div className="w-16 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                    <BookCover src={item.coverImageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow">
                                                    <Link to={`/book/${item.bookId}`} className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1">
                                                        {item.bookTitle}
                                                    </Link>
                                                    <p className="text-sm text-gray-500 mt-1">{item.authorName}</p>
                                                    <p className="text-sm font-medium text-gray-700 mt-2">
                                                        {item.quantity} Adet x {item.price?.toFixed(2)} ₺
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900">
                                                        {(item.quantity * item.price).toFixed(2)} ₺
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {}
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-sm text-gray-600 flex items-start gap-2">
                                    <span className="mt-0.5">📍</span>
                                    <span>
                                        <strong className="text-gray-900">Teslimat Adresi:</strong> {order.shippingAddress || 'Adres bilgisi bulunamadı.'}
                                    </span>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyOrdersPage;