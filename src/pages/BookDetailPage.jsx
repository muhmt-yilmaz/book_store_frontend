import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { addToCart as addToCartRequest } from '../services/cartService';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import BookCover from '../components/BookCover';

const BookDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                
                const response = await api.get(`/books/${id}`);
                setBook(response.data.object || response.data);
            } catch (error) {
                console.error("Kitap detayı yüklenemedi:", error);
                toast.error("Kitap bilgileri bulunamadı.");
                navigate('/catalog'); 
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id, navigate]);

    
    const handleAddToCart = async () => {


        

        setAddingToCart(true);
        try {
            
            
            await addToCartRequest(book.id, quantity);
            
            toast.success(`"${book.title}" sepetinize eklendi!`);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Sepete eklenirken bir hata oluştu."));
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium animate-pulse">Kitap İnceleniyor...</div>;
    }

    if (!book) return null;

    
    const hasDiscount = book.discountPercentage > 0;
    const discountedPrice = hasDiscount 
        ? book.price - (book.price * (book.discountPercentage / 100))
        : book.price;

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {}
                <nav className="text-sm font-medium text-gray-500 mb-8 flex items-center gap-2">
                    <Link to="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
                    <span>/</span>
                    <Link to="/catalog" className="hover:text-primary transition-colors">Katalog</Link>
                    <span>/</span>
                    <span className="text-gray-900 line-clamp-1">{book.title}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    
                    {}
                    <div className="md:w-2/5 bg-gray-100 p-8 flex items-center justify-center relative">
                        {hasDiscount && (
                            <div className="absolute top-6 left-6 bg-green-500 text-white font-bold px-3 py-1 rounded-full shadow-sm z-10">
                                %{book.discountPercentage} İndirim
                            </div>
                        )}
                        <div className="w-full max-w-sm aspect-[2/3] bg-white rounded-xl shadow-md overflow-hidden flex items-center justify-center">
                            <BookCover
                                src={book.coverImageUrl}
                                alt={book.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {}
                    <div className="md:w-3/5 p-8 md:p-12 flex flex-col">
                        <div className="mb-2 text-sm font-bold text-primary uppercase tracking-wider">
                            {book.categoryName || 'Genel'}
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                            {book.title}
                        </h1>
                        
                        <p className="text-lg text-gray-600 mb-6 font-medium">
                            Yazar:{' '}
                            {book.authorId ? (
                                <Link to={`/author/${book.authorId}`} className="text-primary font-bold hover:underline">
                                    {book.authorName || 'Bilinmiyor'}
                                </Link>
                            ) : (
                                <span className="text-gray-900 font-bold">{book.authorName || 'Bilinmiyor'}</span>
                            )}
                        </p>

                        {}
                        <div className="mb-8 flex items-end gap-4 border-b border-gray-100 pb-8">
                            <div className="flex flex-col">
                                {hasDiscount && (
                                    <span className="text-lg text-gray-400 line-through mb-1">{book.price?.toFixed(2)} ₺</span>
                                )}
                                <span className="text-4xl font-extrabold text-gray-900">
                                    {discountedPrice?.toFixed(2)} ₺
                                </span>
                            </div>
                            
                            {}
                            <div className="mb-1.5">
                                {book.stockQuantity > 10 ? (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Stokta Var</span>
                                ) : book.stockQuantity > 0 ? (
                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">Son {book.stockQuantity} Ürün</span>
                                ) : (
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">Tükendi</span>
                                )}
                            </div>
                        </div>

                        {}
                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden h-14 bg-gray-50 w-full sm:w-1/3">
                                <button 
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    disabled={quantity <= 1 || book.stockQuantity === 0}
                                    className="px-4 h-full hover:bg-gray-200 text-gray-600 font-bold text-xl disabled:opacity-50 transition-colors"
                                >-</button>
                                <span className="flex-grow font-bold text-lg flex items-center justify-center bg-white h-full border-x border-gray-300">
                                    {quantity}
                                </span>
                                <button 
                                    onClick={() => setQuantity(prev => Math.min(book.stockQuantity, prev + 1))}
                                    disabled={quantity >= book.stockQuantity || book.stockQuantity === 0}
                                    className="px-4 h-full hover:bg-gray-200 text-gray-600 font-bold text-xl disabled:opacity-50 transition-colors"
                                >+</button>
                            </div>
                            
                            <button 
                                onClick={handleAddToCart}
                                disabled={addingToCart || book.stockQuantity === 0}
                                className="w-full sm:w-2/3 bg-primary hover:bg-opacity-90 text-white h-14 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400"
                            >
                                {addingToCart ? 'Ekleniyor...' : (book.stockQuantity === 0 ? 'Stokta Yok' : '🛒 Sepete Ekle')}
                            </button>
                        </div>

                        {}
                        <div className="mt-auto">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Kitap Özeti</h3>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                {book.description || 'Bu kitap için henüz bir açıklama girilmemiştir.'}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-gray-100 pt-6">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 mb-1">Yayınevi</span>
                                    <span className="font-bold text-gray-900">{book.publisherName || '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 mb-1">Kategori</span>
                                    <span className="font-bold text-gray-900">{book.categoryName || '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 mb-1">ISBN</span>
                                    <span className="font-mono font-bold text-gray-900">{book.isbn || '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 mb-1">Stok Kodu (SKU)</span>
                                    <span className="font-mono font-bold text-gray-900">{book.sku || '-'}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;