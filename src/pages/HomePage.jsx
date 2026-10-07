import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BookCover from '../components/BookCover';

const HomePage = () => {
    const navigate = useNavigate();
    const [latestBooks, setLatestBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                
                const booksRes = await api.get('/books?page=0&size=4&sort=id&type=desc');
                setLatestBooks(booksRes.data.object?.content || []);

                
                const catRes = await api.get('/categories/all');
                setCategories(catRes.data.object || []);
            } catch (error) {
                console.error("Ana sayfa verileri yüklenemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans">
            
            {}
            <div className="bg-primary text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Okumak <br/><span className="text-indigo-200">Keşfetmektir.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-lg mx-auto md:mx-0">
                            Binlerce kitap, en sevdiğiniz yazarlar ve yeni dünyalar bir tık uzağınızda. Hemen kataloğumuzu inceleyin.
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <Link to="/catalog" className="bg-white text-primary font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-all">
                                Kitapları Keşfet
                            </Link>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center md:justify-end text-9xl">
                        📚
                    </div>
                </div>
            </div>

            {}
            <div className="bg-gray-50 py-10 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4">
                        <div className="text-3xl mb-2">🚚</div>
                        <h3 className="font-bold text-gray-900">Ücretsiz Kargo</h3>
                        <p className="text-sm text-gray-500">Tüm siparişlerinizde bedava teslimat.</p>
                    </div>
                    <div className="p-4 md:border-l md:border-r border-gray-200">
                        <div className="text-3xl mb-2">🔒</div>
                        <h3 className="font-bold text-gray-900">Güvenli Ödeme</h3>
                        <p className="text-sm text-gray-500">256-bit şifreleme ile korunan altyapı.</p>
                    </div>
                    <div className="p-4">
                        <div className="text-3xl mb-2">⚡</div>
                        <h3 className="font-bold text-gray-900">Hızlı Teslimat</h3>
                        <p className="text-sm text-gray-500">Siparişleriniz 24 saat içinde kargoda.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {}
                <div className="mb-16">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Yeni Eklenenler</h2>
                            <p className="text-gray-500 mt-2">Kütüphanemize yeni katılan en taze eserler.</p>
                        </div>
                        <Link to="/catalog" className="text-primary font-bold hover:underline hidden sm:block">
                            Tümünü Gör →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10 text-gray-400 animate-pulse">Yükleniyor...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {latestBooks.map((book) => {
                                const discountedPrice = book.discountPercentage > 0 
                                    ? book.price - (book.price * (book.discountPercentage / 100))
                                    : book.price;

                                return (
                                    <div key={book.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col overflow-hidden group">
                                        <Link to={`/book/${book.id}`} className="flex flex-col flex-grow">
                                            <BookCover
                                                src={book.coverImageUrl}
                                                alt={book.title}
                                                className="h-56 w-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                            <div className="p-4 flex flex-col flex-grow">
                                                <span className="text-xs font-semibold text-primary uppercase mb-1">{book.categoryName}</span>
                                                <h3 className="text-base font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{book.title}</h3>
                                                <p
                                                    className="text-xs text-gray-500 hover:text-primary hover:underline w-max"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (book.authorId) navigate(`/author/${book.authorId}`);
                                                    }}
                                                >
                                                    {book.authorName}
                                                </p>
                                            </div>
                                        </Link>
                                        <div className="p-4 pt-0 mt-auto flex flex-col border-t border-gray-50">
                                            {book.discountPercentage > 0 && <span className="text-xs text-gray-400 line-through mt-2">{book.price.toFixed(2)} ₺</span>}
                                            <span className="text-lg font-extrabold text-gray-900">{discountedPrice.toFixed(2)} ₺</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {}
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Kategorileri Keşfet</h2>
                    <div className="flex flex-wrap gap-4">
                        {categories.slice(0, 10).map((cat) => (
                            <Link 
                                key={cat.id} 
                                to="/catalog" 
                                className="bg-gray-50 border border-gray-200 hover:border-primary hover:bg-indigo-50 text-gray-700 hover:text-primary px-6 py-3 rounded-full font-medium transition-colors"
                            >
                                {cat.categoryName}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomePage;