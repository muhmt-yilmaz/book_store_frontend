import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart } from '../services/cartService';
import toast from 'react-hot-toast';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    const isStaff = userRole === 'ADMIN' || userRole === 'MANAGER';

    
    const [cartCount, setCartCount] = useState(0);


    
    
    const updateCartCount = useCallback(async () => {
        if (userRole === 'ADMIN' || userRole === 'MANAGER') {
            setCartCount(0);
            return;
        }
        try {
            const cart = await fetchCart();
            const totalItems = cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
            setCartCount(totalItems);
        } catch (error) {
            console.error("Sepet sayısı alınamadı", error);
        }
    }, [userRole]);

    useEffect(() => {
        
        
        updateCartCount();

        
        window.addEventListener('cartUpdated', updateCartCount);

        
        return () => window.removeEventListener('cartUpdated', updateCartCount);
    }, [updateCartCount]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        toast.success("Başarıyla çıkış yapıldı.");
        navigate('/login');
    };

    const roleLabel = userRole === 'ADMIN' ? 'Yönetici' : userRole === 'MANAGER' ? 'Mağaza Müdürü' : 'Müşteri';

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    
                    {}
                    <div className="flex items-center">
                        <Link to={isStaff ? "/admin/dashboard" : "/"} className="flex items-center gap-2">
                            <span className="text-3xl">📚</span>
                            <span className="font-extrabold text-xl tracking-tight text-gray-900">
                                Book<span className="text-primary">Store</span>
                            </span>
                        </Link>
                    </div>

                    {}
                    <div className="flex items-center gap-6">
                        
                        {}
                        {!token && (
                            <>
                                <Link to="/catalog" className="text-gray-600 hover:text-primary font-medium transition-colors">Katalog</Link>
                                <Link to="/authors" className="text-gray-600 hover:text-primary font-medium transition-colors">Yazarlar</Link>
                                <Link to="/login" className="text-gray-600 hover:text-primary font-medium transition-colors">Giriş Yap</Link>
                                <Link to="/register" className="bg-primary hover:bg-opacity-90 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm">
                                    Kayıt Ol
                                </Link>

                                {}
                                <Link to="/cart" className="relative text-gray-600 hover:text-primary transition-colors flex items-center p-1 mt-1">
                                    <span className="text-2xl">🛒</span>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {}
                        {token && userRole === 'CUSTOMER' && (
                            <>
                                <Link to="/catalog" className="text-gray-600 hover:text-primary font-medium transition-colors">Katalog</Link>
                                <Link to="/authors" className="text-gray-600 hover:text-primary font-medium transition-colors">Yazarlar</Link>
                                <Link to="/my-orders" className="text-gray-600 hover:text-primary font-medium transition-colors">Siparişlerim</Link>
                                <Link to="/profile" className="text-gray-600 hover:text-primary font-medium transition-colors">Profilim</Link>
                                
                                {}
                                <Link to="/cart" className="relative text-gray-600 hover:text-primary transition-colors flex items-center p-1 mt-1">
                                    <span className="text-2xl">🛒</span>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {}
                        {token && isStaff && (
                            <>
                                <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary font-medium transition-colors">Panel</Link>
                                <Link to="/admin/books" className="text-gray-600 hover:text-primary font-medium transition-colors">Kitaplar</Link>
                                <Link to="/admin/categories" className="text-gray-600 hover:text-primary font-medium transition-colors">Kategoriler</Link>
                                <Link to="/admin/publishers" className="text-gray-600 hover:text-primary font-medium transition-colors">Yayınevleri</Link>
                                <Link to="/admin/authors" className="text-gray-600 hover:text-primary font-medium transition-colors">Yazarlar</Link>
                                <Link to="/admin/orders" className="text-gray-600 hover:text-primary font-medium transition-colors">Siparişler</Link>
                                {}
                                {userRole === 'ADMIN' && (
                                    <Link to="/admin/managers" className="text-gray-600 hover:text-primary font-medium transition-colors">Yöneticiler</Link>
                                )}
                            </>
                        )}

                        {}
                        {token && (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                <div className="hidden md:flex flex-col text-right">
                                    <span className="text-xs font-bold text-gray-800 uppercase">
                                        {roleLabel}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">{userName}</span>
                                </div>
                                <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors border border-red-100 text-sm">
                                    Çıkış
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
