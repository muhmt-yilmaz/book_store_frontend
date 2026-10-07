import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import Pagination from '../components/Pagination';
import BookCover from '../components/BookCover';

const BookManagement = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [editImageFile, setEditImageFile] = useState(null);
    const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publishers, setPublishers] = useState([]);

    
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [syncQuery, setSyncQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    
    const fetchBooks = async (page = 0, query = '') => {
        setLoading(true);
        try {
            let response;
            if (query.trim()) {
                response = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
                setBooks(response.data.object || []);
                setTotalPages(1);
            } else {
                response = await api.get(`/books?page=${page}&size=10&sort=id&type=desc`);
                const pageData = response.data.object; 
                setBooks(pageData?.content || []); 
                setTotalPages(pageData?.totalPages || 1); 
                setCurrentPage(pageData?.number || 0); 
            }
        } catch (error) {
            console.error(error);
            toast.error("Kitaplar yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelations = async () => {
        try {
            const [authorRes, catRes, pubRes] = await Promise.all([
                api.get('/authors/all'),
                api.get('/categories/all'),
                api.get('/publishers/all')
            ]);
            setAuthors(authorRes.data.object || []);
            setCategories(catRes.data.object || []);
            setPublishers(pubRes.data.object || []);
        } catch (error) {
            console.error("İlişkiler çekilemedi:", error);
        }
    };

    useEffect(() => {
        const initData = async () => {
            await fetchBooks(0);
            await fetchRelations();
        };
        initData();
    }, []);

    
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchBooks(0, searchQuery);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setCurrentPage(0);
        fetchBooks(0, '');
    };

    
    const handleDelete = async (id, title) => {
        if (!window.confirm(`"${title}" adlı kitabı tamamen silmek istediğinize emin misiniz?`)) return;
        setLoading(true);
        try {
            await api.delete(`/books/${id}`);
            toast.success("Kitap başarıyla silindi!");
            await fetchBooks(currentPage, searchQuery);
        } catch (error) {
            console.error(error);
            toast.error("Silme işlemi başarısız.");
        } finally {
            setLoading(false);
        }
    };

    
    const handlePageChange = async (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            await fetchBooks(newPage, searchQuery);
        }
    };

    
    const handleEditClick = (book) => {
        setEditFormData({
            id: book.id,
            title: book.title,
            isbn: book.isbn,
            sku: book.sku || '',
            price: book.price,
            description: book.description || '',
            coverImageUrl: book.coverImageUrl || '',
            authorId: book.authorId || '',
            categoryId: book.categoryId || '',
            publisherId: book.publisherId || '',
            stockQuantity: book.stockQuantity || 0,
            discountPercentage: book.discountPercentage || 0
        });
        setEditImageFile(null);
        setIsModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsUploadingEditImage(true);
        try {
            let finalData = {
                ...editFormData,
                price: Number(editFormData.price),
                stockQuantity: Number(editFormData.stockQuantity),
                discountPercentage: Number(editFormData.discountPercentage) || 0,
                authorId: Number(editFormData.authorId),
                categoryId: Number(editFormData.categoryId),
                publisherId: Number(editFormData.publisherId)
            };


            
            if (editImageFile) {
                const formDataForImage = new FormData();
                formDataForImage.append('file', editImageFile);
                const uploadRes = await api.post('/api/files/upload', formDataForImage, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalData.coverImageUrl = uploadRes.data.url;
            }

            await api.put(`/books/${editFormData.id}`, finalData);
            toast.success("Kitap başarıyla güncellendi!");
            setIsModalOpen(false);
            await fetchBooks(currentPage, searchQuery);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Güncelleme başarısız."));
        } finally {
            setIsUploadingEditImage(false);
        }
    };

    
    const handleSyncSubmit = async (e) => {
        e.preventDefault();
        if (!syncQuery.trim()) return;

        setIsSyncing(true);
        try {
            await api.post(`/api/books/sync?query=${encodeURIComponent(syncQuery)}`);
            toast.success(`"${syncQuery}" araması için kitaplar başarıyla senkronize edildi!`);
            setIsSyncModalOpen(false);
            setSyncQuery('');
            await fetchBooks(0, searchQuery); 
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Kitaplar çekilirken bir hata oluştu."));
        } finally {
            setIsSyncing(false);
        }
    };


    
    
    
    const [isBulkFetching, setIsBulkFetching] = useState(false);
    const [bulkFetchCount, setBulkFetchCount] = useState(40);
    const handleBulkFetch = async () => {
        setIsBulkFetching(true);
        try {
            const response = await api.post(`/api/books/bulk-sync?count=${bulkFetchCount}`);
            toast.success(response.data, { duration: 8000 });
            await fetchBooks(0, searchQuery);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Toplu kitap getirme sırasında bir hata oluştu."));
        } finally {
            setIsBulkFetching(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kitap Yönetimi</h1>
                        <p className="text-sm text-gray-500 mt-1">Sistemdeki tüm kitapları görüntüleyin, güncelleyin veya Google'dan yeni kitaplar çekin.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div
                            className="flex items-center bg-emerald-100 rounded-lg overflow-hidden shadow-sm"
                            title="Arama terimi girmeden, veritabanında olmayan yeni kitapları (Google Books + Open Library) otomatik ekler. Kataloğu doldurmak için tekrar tekrar tıklayabilirsiniz."
                        >
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={bulkFetchCount}
                                onChange={(e) => setBulkFetchCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                                disabled={isBulkFetching}
                                className="w-16 text-center bg-transparent text-emerald-700 font-bold py-2.5 focus:outline-none"
                            />
                            <button
                                onClick={handleBulkFetch}
                                disabled={isBulkFetching}
                                className="hover:bg-emerald-200 text-emerald-700 pl-2 pr-5 py-2.5 font-bold transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {isBulkFetching ? '⏳ Getiriliyor...' : '📦 Yeni Kitap Getir'}
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsSyncModalOpen(true)}
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
                        >
                            ☁️ Google'dan Ara ve Çek
                        </button>
                        <Link to="/admin/add-book" className="bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm">
                            + Manuel Ekle
                        </Link>
                    </div>
                </div>

                {}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-2">
                    <form onSubmit={handleSearchSubmit} className="flex-grow flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Kitap adı, yazar veya ISBN numarası ile ara..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                        <button type="submit" className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Ara
                        </button>
                    </form>
                    {searchQuery && (
                        <button onClick={handleClearSearch} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors border border-red-100">
                            Temizle
                        </button>
                    )}
                </div>

                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Kitaplar Yükleniyor...</div>
                    ) : books.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="text-4xl mb-3">📚</div>
                            Henüz kitap bulunamadı.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-[11px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Görsel</th>
                                        <th className="px-6 py-4 w-1/3">Kitap Detayı</th>
                                        <th className="px-6 py-4">Stok Kodu / ISBN</th>
                                        <th className="px-6 py-4">Fiyat / İndirim</th>
                                        <th className="px-6 py-4">Stok</th>
                                        <th className="px-6 py-4 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {books.map((book) => {
                                        const discountedPrice = book.discountPercentage > 0 
                                            ? book.price - (book.price * (book.discountPercentage / 100))
                                            : book.price;

                                        return (
                                            <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                                                        <BookCover src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 mb-1 line-clamp-2">{book.title}</div>
                                                    <div className="text-xs text-gray-500 mb-1">✍️ {book.authorName || 'Bilinmiyor'}</div>
                                                    <div className="text-xs text-primary font-medium">🏷️ {book.categoryName || 'Kategorisiz'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                                    <div className="mb-1 text-gray-900 font-bold">{book.sku || '-'}</div>
                                                    <div>ISBN: {book.isbn}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {book.discountPercentage > 0 && (
                                                        <div className="text-xs text-gray-400 line-through">{book.price?.toFixed(2)} ₺</div>
                                                    )}
                                                    <div className="font-bold text-gray-900">{discountedPrice?.toFixed(2)} ₺</div>
                                                    {book.discountPercentage > 0 && (
                                                        <span className="inline-block mt-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                                            %{book.discountPercentage} İndirim
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${book.stockQuantity === 0 ? 'bg-red-100 text-red-700' : book.stockQuantity < 10 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                        {book.stockQuantity} Adet
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-3">
                                                    <button onClick={() => handleEditClick(book)} className="text-indigo-600 hover:text-indigo-900 font-bold text-sm transition-colors">
                                                        Düzenle
                                                    </button>
                                                    <button onClick={() => handleDelete(book.id, book.title)} className="text-red-600 hover:text-red-900 font-bold text-sm transition-colors">
                                                        Sil
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {}
                {!searchQuery && totalPages > 1 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-6">
                        <p className="text-sm text-gray-500 text-center mb-2">
                            Toplam <span className="font-bold text-gray-900">{totalPages}</span> sayfadan <span className="font-bold text-gray-900">{currentPage + 1}.</span> sayfa gösteriliyor.
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            disabled={loading}
                        />
                    </div>
                )}
            </div>

            {}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Kitap Güncelle</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-20 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                    {editImageFile ? (
                                        <img src={URL.createObjectURL(editImageFile)} alt="Önizleme" className="w-full h-full object-cover" />
                                    ) : (
                                        <BookCover src={editFormData.coverImageUrl} alt={editFormData.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapak Görseli</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditImageFile(e.target.files[0] || null)}
                                        className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Boş bırakılırsa mevcut görsel korunur.</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kitap Adı</label>
                                <input type="text" name="title" value={editFormData.title} onChange={handleEditChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                                    <input type="text" name="isbn" value={editFormData.isbn} onChange={handleEditChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL)</label>
                                    <input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleEditChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok Adedi</label>
                                    <input type="number" name="stockQuantity" value={editFormData.stockQuantity} onChange={handleEditChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Oranı (%)</label>
                                    <input type="number" name="discountPercentage" min="0" max="100" value={editFormData.discountPercentage} onChange={handleEditChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yazar</label>
                                    <select name="authorId" value={editFormData.authorId} onChange={handleEditChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm">
                                        <option value="">Seçiniz</option>
                                        {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select name="categoryId" value={editFormData.categoryId} onChange={handleEditChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm">
                                        <option value="">Seçiniz</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yayınevi</label>
                                    <select name="publisherId" value={editFormData.publisherId} onChange={handleEditChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm">
                                        <option value="">Seçiniz</option>
                                        {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">İptal</button>
                                <button type="submit" disabled={isUploadingEditImage} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 shadow-sm disabled:bg-gray-400">
                                    {isUploadingEditImage ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {}
            {isSyncModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50">
                            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                ☁️ Google Books'tan Çek
                            </h3>
                        </div>
                        <form onSubmit={handleSyncSubmit} className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Aradığınız anahtar kelimeye (örn: "Yüzüklerin Efendisi", "Tarih") ait kitapları Google üzerinden otomatik olarak veritabanınıza ekleyin.
                            </p>
                            <input 
                                type="text" 
                                value={syncQuery} 
                                onChange={(e) => setSyncQuery(e.target.value)} 
                                placeholder="Kitap veya konu adı girin..." 
                                required 
                                disabled={isSyncing}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-6"
                            />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsSyncModalOpen(false)} disabled={isSyncing} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" disabled={isSyncing || !syncQuery.trim()} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 shadow-sm flex items-center gap-2">
                                    {isSyncing ? '⏳ İndiriliyor...' : 'Veritabanına Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookManagement;