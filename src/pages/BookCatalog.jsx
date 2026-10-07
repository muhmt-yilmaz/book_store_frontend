import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { addToCart } from '../services/cartService';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import Pagination from '../components/Pagination';
import BookCover from '../components/BookCover';

const PAGE_SIZE = 12;

const BookCatalog = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(null);

    
    const [searchInput, setSearchInput] = useState('');   
    const [activeSearch, setActiveSearch] = useState('');  
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [sortOption, setSortOption] = useState({ field: 'title', type: 'asc' });

    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    
    const [tryingGoogleFallback, setTryingGoogleFallback] = useState(false);

    
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [catRes, authRes, pubRes] = await Promise.all([
                    api.get('/categories/all'),
                    api.get('/authors/all'),
                    api.get('/publishers/all')
                ]);
                
                
                const cats = (catRes.data.object || []).sort((a, b) => (b.bookCount || 0) - (a.bookCount || 0));
                setCategories(cats);
                setAuthors(authRes.data.object || []);
                setPublishers(pubRes.data.object || []);
            } catch (error) {
                console.error("Filtreler yüklenemedi:", error);
            }
        };
        fetchFilters();
    }, []);


    


    
    const fetchBooks = useCallback(async (page) => {
        setLoading(true);
        setTryingGoogleFallback(false);
        try {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('size', PAGE_SIZE);
            params.set('sort', sortOption.field);
            params.set('type', sortOption.type);
            if (activeSearch.trim()) params.set('q', activeSearch.trim());
            if (selectedCategory) params.set('categoryId', selectedCategory);
            if (selectedAuthor) params.set('authorId', selectedAuthor);
            if (selectedPublisher) params.set('publisherId', selectedPublisher);

            const response = await api.get(`/books?${params.toString()}`);
            const pageData = response.data.object;

            setBooks(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
            setTotalElements(pageData.totalElements || 0);
            setCurrentPage(pageData.number || 0);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Kitaplar yüklenirken hata oluştu."));
        } finally {
            setLoading(false);
        }
    }, [activeSearch, selectedCategory, selectedAuthor, selectedPublisher, sortOption]);

    
    useEffect(() => {
        fetchBooks(currentPage);
        
    }, [currentPage, sortOption, selectedCategory, selectedAuthor, selectedPublisher, activeSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        setActiveSearch(searchInput);
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedAuthor('');
        setSelectedPublisher('');
        setSearchInput('');
        setActiveSearch('');
        setCurrentPage(0);
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategory((prev) => (prev === String(categoryId) ? '' : String(categoryId)));
        setCurrentPage(0);
    };


    const handleTryGoogleFallback = async () => {
        setTryingGoogleFallback(true);
        try {
            const response = await api.get(`/books/search?q=${encodeURIComponent(activeSearch)}`);
            const found = response.data.object || [];
            if (found.length > 0) {
                toast.success(`Google Books'ta "${activeSearch}" için ${found.length} sonuç bulundu ve kataloğa eklendi!`);
                setCurrentPage(0);
                fetchBooks(0);
            } else {
                toast.error("Google Books'ta da bir sonuç bulunamadı.");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Google Books araması başarısız oldu."));
        } finally {
            setTryingGoogleFallback(false);
        }
    };

    const handleAddToCart = async (book) => {


        setAddingToCart(book.id);
        try {
            await addToCart(book.id, 1);
            toast.success(`"${book.title}" sepetinize eklendi!`);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Sepete eklenirken hata oluştu."));
        } finally {
            setAddingToCart(null);
        }
    };

    const selectedCategoryName = categories.find(c => String(c.id) === selectedCategory)?.categoryName;
    const selectedAuthorObj = authors.find(a => String(a.id) === selectedAuthor);
    const selectedPublisherName = publishers.find(p => String(p.id) === selectedPublisher)?.name;
    const hasActiveFilters = selectedCategory || selectedAuthor || selectedPublisher || activeSearch;
    const firstItemIndex = totalElements === 0 ? 0 : currentPage * PAGE_SIZE + 1;
    const lastItemIndex = Math.min((currentPage + 1) * PAGE_SIZE, totalElements);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {}
            <div className="bg-primary py-12 px-4 sm:px-6 lg:px-8 text-center text-white">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">Yeni Dünyaları Keşfet</h1>
                <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-8">
                    Binlerce kitap, yazar ve yayınevi arasında aradığınız eseri hemen bulun.
                </p>
                <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Kitap veya yazar adı girin..." 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full px-5 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-sm"
                    />
                    <button type="submit" className="bg-gray-900 hover:bg-black px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm text-white">
                        Ara
                    </button>
                </form>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {}
                {categories.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kategoriye Göre Gözat</h2>
                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                            <button
                                onClick={() => toggleCategory('')}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                                    !selectedCategory
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                Tümü
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => toggleCategory(c.id)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                                        selectedCategory === String(c.id)
                                            ? 'bg-primary text-white border-primary shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {c.categoryName}
                                    <span className={`ml-1.5 ${selectedCategory === String(c.id) ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {c.bookCount}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-3 flex-grow">
                        <select 
                            value={selectedAuthor} 
                            onChange={(e) => { setSelectedAuthor(e.target.value); setCurrentPage(0); }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-primary focus:border-primary"
                        >
                            <option value="">Tüm Yazarlar</option>
                            {authors.map(a => <option key={a.id} value={a.id}>{a.name} {a.surname}</option>)}
                        </select>

                        <select 
                            value={selectedPublisher} 
                            onChange={(e) => { setSelectedPublisher(e.target.value); setCurrentPage(0); }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-primary focus:border-primary"
                        >
                            <option value="">Tüm Yayınevleri</option>
                            {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>

                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-red-600 font-medium hover:underline">
                                Filtreleri Temizle ✕
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <label className="text-sm font-medium text-gray-500">Sırala:</label>
                        <select
                            value={`${sortOption.field},${sortOption.type}`}
                            onChange={(e) => {
                                const [field, type] = e.target.value.split(',');
                                setSortOption({ field, type });
                                setCurrentPage(0);
                            }}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-primary focus:border-primary"
                        >
                            <option value="title,asc">A'dan Z'ye</option>
                            <option value="title,desc">Z'den A'ya</option>
                            <option value="price,asc">Artan Fiyat</option>
                            <option value="price,desc">Azalan Fiyat</option>
                        </select>
                    </div>
                </div>

                {}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 -mt-2">
                        <span className="text-xs text-gray-400 font-medium">Uygulanan filtreler:</span>
                        {activeSearch && (
                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                                "{activeSearch}" <button onClick={() => { setActiveSearch(''); setSearchInput(''); setCurrentPage(0); }} className="hover:text-red-600">✕</button>
                            </span>
                        )}
                        {selectedCategoryName && (
                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                                {selectedCategoryName} <button onClick={() => toggleCategory('')} className="hover:text-red-600">✕</button>
                            </span>
                        )}
                        {selectedAuthorObj && (
                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                                {selectedAuthorObj.name} {selectedAuthorObj.surname} <button onClick={() => { setSelectedAuthor(''); setCurrentPage(0); }} className="hover:text-red-600">✕</button>
                            </span>
                        )}
                        {selectedPublisherName && (
                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                                {selectedPublisherName} <button onClick={() => { setSelectedPublisher(''); setCurrentPage(0); }} className="hover:text-red-600">✕</button>
                            </span>
                        )}
                    </div>
                )}

                {}
                <p className="text-sm font-medium text-gray-500 mb-4">
                    {totalElements > 0
                        ? `Toplam ${totalElements} kitaptan ${firstItemIndex}-${lastItemIndex} arası gösteriliyor`
                        : loading ? '' : 'Sonuç yok'
                    }
                </p>

                {}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-gray-500 font-medium animate-pulse">
                        Kitaplar yükleniyor...
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {books.map((book) => {
                            const discountedPrice = book.discountPercentage > 0 
                                ? book.price - (book.price * (book.discountPercentage / 100))
                                : book.price;

                            return (
                                <div key={book.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col overflow-hidden relative group">
                                    
                                    <div className="absolute top-3 left-3 right-3 flex justify-between z-10 pointer-events-none">
                                        {book.stockQuantity === 0 && <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">Tükendi</span>}
                                        {book.discountPercentage > 0 && <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">%{book.discountPercentage}</span>}
                                    </div>

                                    <Link to={`/book/${book.id}`} className="flex flex-col flex-grow">
                                        <BookCover
                                            src={book.coverImageUrl}
                                            alt={book.title}
                                            className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                                    <div className="p-4 pt-0 mt-auto flex items-center justify-between border-t border-gray-50">
                                        <div className="flex flex-col">
                                            {book.discountPercentage > 0 && <span className="text-xs text-gray-400 line-through">{book.price.toFixed(2)} ₺</span>}
                                            <span className="text-lg font-extrabold text-gray-900">{discountedPrice.toFixed(2)} ₺</span>
                                        </div>
                                        <button 
                                            onClick={() => handleAddToCart(book)}
                                            disabled={book.stockQuantity === 0 || addingToCart === book.id}
                                            className={`p-2 rounded-lg transition-colors z-20 ${book.stockQuantity === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-opacity-90'}`}
                                        >
                                            {addingToCart === book.id ? '⏳' : '🛒'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="text-5xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Kitap Bulunamadı</h2>
                        <p className="text-gray-500 mb-4">
                            {hasActiveFilters
                                ? 'Seçtiğiniz filtrelere/aramaya uygun kitap bulunmuyor. Farklı filtreler deneyebilirsiniz.'
                                : 'Katalogda henüz kitap bulunmuyor.'}
                        </p>
                        {activeSearch && (
                            <button
                                onClick={handleTryGoogleFallback}
                                disabled={tryingGoogleFallback}
                                className="bg-indigo-50 hover:bg-indigo-100 text-primary font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                            >
                                {tryingGoogleFallback ? 'Aranıyor...' : `☁️ "${activeSearch}" için Google Books'ta ara`}
                            </button>
                        )}
                    </div>
                )}

                {}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                />
            </div>
        </div>
    );
};

export default BookCatalog;
