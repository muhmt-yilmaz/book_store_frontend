import { useState, useEffect, useCallback } from 'react';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchAllOrders = useCallback(async () => {
        try {
            const data = await getAllOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Siparişler yüklenemedi:", error);
            toast.error("Siparişler yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        
        fetchAllOrders();
    }, [fetchAllOrders]);

    
    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {


            await updateOrderStatus(orderId, newStatus);
            toast.success("Sipariş durumu başarıyla güncellendi!");
            await fetchAllOrders();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Durum güncellenirken hata oluştu."));
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium animate-pulse">Siparişler Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sipariş Yönetimi</h1>
                    <p className="text-sm text-gray-500 mt-1">Sisteme gelen tüm müşteri siparişlerini takip edin ve kargo durumlarını güncelleyin.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">Sistemde kayıtlı sipariş bulunmuyor.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Sipariş ID</th>
                                        <th className="px-6 py-4">Müşteri</th>
                                        <th className="px-6 py-4">Tarih</th>
                                        <th className="px-6 py-4">Tutar</th>
                                        <th className="px-6 py-4">Durum</th>
                                        <th className="px-6 py-4 text-center">İşlem / Durum Değiştir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                {order.customerName}
                                                <span className="block text-xs text-gray-400 font-normal">{order.customerEmail}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR') : 'Tarih Yok'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {order.totalPrice?.toFixed(2)} ₺
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <select 
                                                    value={order.status}
                                                    disabled={updatingId === order.id}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:ring-primary focus:border-primary disabled:opacity-50"
                                                >
                                                    <option value="PENDING">Hazırlanıyor (PENDING)</option>
                                                    <option value="SHIPPED">Kargolandı (SHIPPED)</option>
                                                    <option value="DELIVERED">Teslim Edildi (DELIVERED)</option>
                                                    <option value="CANCELLED">İptal Edildi (CANCELLED)</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminOrdersPage;