import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalBooks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                
                const [booksRes, ordersRes] = await Promise.all([
                    api.get('/books?page=0&size=10&sort=id&type=desc'), 
                    api.get('/orders/all')
                ]);

                const booksData = booksRes.data.object || booksRes.data;
                const ordersData = ordersRes.data.object || ordersRes.data || [];

                const totalBooks = booksData.totalElements || 0;
                const totalOrders = ordersData.length;
                const pendingOrders = ordersData.filter(o => o.status === 'PENDING').length;
                
                const totalRevenue = ordersData
                    .filter(o => o.status !== 'CANCELLED')
                    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

                setStats({ totalRevenue, totalOrders, pendingOrders, totalBooks });
            } catch (error) {
                console.error("İstatistikler alınamadı:", error);
                toast.error("Dashboard verileri yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium animate-pulse">İstatistikler Hesaplanıyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kontrol Paneli</h1>
                        <p className="text-sm text-gray-500 mt-1">Mağazanızın anlık özetine ve performans metriklerine hoş geldiniz.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/admin/add-book" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                            + Yeni Kitap
                        </Link>
                        <Link to="/admin/orders" className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                            Siparişleri Yönet
                        </Link>
                    </div>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">₺</div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Toplam Ciro</h3>
                        <div className="text-3xl font-extrabold text-gray-900">
                            {stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </div>
                        <div className="mt-4 text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-1 rounded w-max">
                            Aktif Siparişlerden
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📦</div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Toplam Sipariş</h3>
                        <div className="text-3xl font-extrabold text-gray-900">
                            {stats.totalOrders} <span className="text-lg text-gray-500 font-medium">Adet</span>
                        </div>
                        <Link to="/admin/orders" className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors w-max">
                            Tümünü Görüntüle →
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">⏳</div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bekleyen Kargolar</h3>
                        <div className="text-3xl font-extrabold text-gray-900">
                            {stats.pendingOrders}
                        </div>
                        {stats.pendingOrders > 0 ? (
                            <div className="mt-4 text-xs font-medium text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded w-max animate-pulse">
                                Müdahale Gerekiyor
                            </div>
                        ) : (
                            <div className="mt-4 text-xs font-medium text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded w-max">
                                Tüm siparişler kargolandı
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📚</div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Kütüphane Hacmi</h3>
                        <div className="text-3xl font-extrabold text-gray-900">
                            {stats.totalBooks} <span className="text-lg text-gray-500 font-medium">Çeşit</span>
                        </div>
                        <Link to="/admin/books" className="mt-4 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors w-max">
                            Kataloğu Yönet →
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;