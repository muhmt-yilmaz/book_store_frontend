import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import { normalizeUrl } from '../utils/urlHelper';

const BookAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    
    const [formData, setFormData] = useState({
        title: '', isbn: '', sku: '', price: '', stockQuantity: '',
        description: '',
        authorId: '', categoryId: '', publisherId: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    
    const [externalCoverUrl, setExternalCoverUrl] = useState(null);
    const [fetchingCover, setFetchingCover] = useState(false);

    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publishers, setPublishers] = useState([]);

    
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
    const [newAuthor, setNewAuthor] = useState({ name: '', surname: '', biography: '', birthDate: '' });
    const [isPublisherModalOpen, setIsPublisherModalOpen] = useState(false);
    const [newPublisher, setNewPublisher] = useState({ name: '', description: '', website: '', contactEmail: '' });

    const fetchRelations = useCallback(async () => {
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
            toast.error("Listeler yüklenirken hata oluştu.");
        }
    }, []);

    useEffect(() => {
        
        fetchRelations();
    }, [fetchRelations]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'sku') {
            value = value.toUpperCase(); 
            if (value.length > 0 && !value.startsWith('SKU-')) {
                value = 'SKU-' + value.replace(/^SKU-?/, '');
            }
        }
        if (name === 'isbn') value = value.replace(/[^\d-]/g, ''); 
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setExternalCoverUrl(null); 
        }
    };


    
    
    const handleFetchCoverFromIsbn = () => {
        const cleanIsbn = formData.isbn.replace(/-/g, '');
        if (!cleanIsbn) {
            toast.error("Önce ISBN girmelisiniz.");
            return;
        }
        setFetchingCover(true);


        const url = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`;
        setExternalCoverUrl(url);
        setImageFile(null);
        setImagePreview(null);
    };

    
    const handleAddAuthor = async (e) => {
        e.preventDefault();
        try {


            const authorPayload = {
                name: newAuthor.name,
                surname: newAuthor.surname,
                biography: newAuthor.biography,
                birthDate: newAuthor.birthDate ? newAuthor.birthDate : null 
            };

            const res = await api.post('/authors', authorPayload);
            toast.success("Yazar eklendi!");
            await fetchRelations();
            setFormData(prev => ({ ...prev, authorId: res.data.object?.id || res.data?.id || '' }));
            setIsAuthorModalOpen(false);
            setNewAuthor({ name: '', surname: '', biography: '', birthDate: '' }); 
        } catch (error) { 
            console.error(error); 
            toast.error(getErrorMessage(error, "Yazar eklenemedi.")); 
        }
    };

    
    const handleAddPublisher = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newPublisher, website: normalizeUrl(newPublisher.website) };
            const res = await api.post('/publishers', payload);
            toast.success("Yayınevi eklendi!");
            await fetchRelations();
            setFormData(prev => ({ ...prev, publisherId: res.data.object?.id || res.data?.id || '' }));
            setIsPublisherModalOpen(false);
            setNewPublisher({ name: '', description: '', website: '', contactEmail: '' });
        } catch (error) { 
            console.error(error); 
            toast.error(getErrorMessage(error, "Yayınevi eklenemedi.")); 
        }
    };

    
    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/categories', { categoryName: newCategoryName });
            toast.success("Kategori eklendi!");
            await fetchRelations();
            setFormData(prev => ({ ...prev, categoryId: res.data.object?.id || res.data?.id || '' }));
            setIsCategoryModalOpen(false);
            setNewCategoryName('');
        } catch (error) { 
            console.error(error); 
            toast.error(getErrorMessage(error, "Kategori eklenemedi.")); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let uploadedImageUrl = externalCoverUrl; 

        try {
            if (imageFile) {
                const formDataForImage = new FormData();
                formDataForImage.append('file', imageFile);
                const uploadRes = await api.post('/api/files/upload', formDataForImage, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImageUrl = uploadRes.data.url;
            }


            


            const finalBookData = {
                ...formData,
                isbn: formData.isbn.trim() || null,
                price: Number(formData.price),
                stockQuantity: Number(formData.stockQuantity),
                authorId: Number(formData.authorId),
                categoryId: Number(formData.categoryId),
                publisherId: Number(formData.publisherId),
                coverImageUrl: uploadedImageUrl
            };
            await api.post('/books', finalBookData);
            toast.success("Kitap başarıyla eklendi!");
            navigate('/admin/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Kitap eklenirken hata oluştu."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">📚 Yeni Kitap Ekle</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {}
                    <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-gray-100 pb-6">
                        <div className="w-full sm:w-1/3 flex flex-col items-center">
                            <div className="w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Kapak Önizleme" className="w-full h-full object-cover" />
                                ) : externalCoverUrl ? (
                                    <img
                                        src={externalCoverUrl}
                                        alt="ISBN'den bulunan kapak"
                                        className="w-full h-full object-cover"
                                        onError={() => {
                                            toast.error("Bu ISBN için Open Library'de kapak bulunamadı.");
                                            setExternalCoverUrl(null);
                                        }}
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm px-4 text-center">Kapak Fotoğrafı Seçin</span>
                                )}
                            </div>
                            <input type="file" accept="image/*" id="coverImage" onChange={handleImageChange} className="hidden"/>
                            <label htmlFor="coverImage" className="mt-4 cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                {imagePreview ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                            </label>
                            <button
                                type="button"
                                onClick={handleFetchCoverFromIsbn}
                                disabled={fetchingCover || !formData.isbn}
                                className="mt-2 text-xs text-primary font-medium hover:underline disabled:text-gray-300 disabled:no-underline disabled:cursor-not-allowed"
                            >
                                📖 ISBN'den kapak bul
                            </button>
                        </div>

                        {/* TEMEL BİLGİLER */}
                        <div className="w-full sm:w-2/3 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kitap Adı</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ISBN (İsteğe Bağlı)</label>
                                    <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} maxLength="17" placeholder="Örn: 978-3-16-148410-0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok Kodu (SKU)</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleChange} maxLength="15" placeholder="SKU-XXXX" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                                    <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 -mt-2">
                                İndirim oranı burada belirlenmez; kitap oluşturulduktan sonra "Kitap Yönetimi" sayfasından düzenlenerek eklenebilir.
                            </p>
                        </div>
                    </div>

                    {/* İLİŞKİLER */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Yazar</label>
                            <div className="flex gap-2">
                                <select name="authorId" value={formData.authorId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                                    <option value="">Seçiniz...</option>
                                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setIsAuthorModalOpen(true)} className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors" title="Yeni Yazar Ekle">+</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <div className="flex gap-2">
                                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                                    <option value="">Seçiniz...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                                </select>
                                <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors" title="Yeni Kategori Ekle">+</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Yayınevi</label>
                            <div className="flex gap-2">
                                <select name="publisherId" value={formData.publisherId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                                    <option value="">Seçiniz...</option>
                                    {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setIsPublisherModalOpen(true)} className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors" title="Yeni Yayınevi Ekle">+</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kitap Açıklaması</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => navigate('/admin/dashboard')} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">İptal</button>
                        <button type="submit" disabled={loading} className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                            {loading ? 'Kaydediliyor...' : 'Kitabı Kaydet'}
                        </button>
                    </div>
                </form>
            </div>

            {/* YAZAR EKLEME MODALI */}
            {isAuthorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Yeni Yazar Ekle</h3>
                        <form onSubmit={handleAddAuthor} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Yazar Adı *</label>
                                    <input type="text" value={newAuthor.name} onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Soyadı *</label>
                                    <input type="text" value={newAuthor.surname} onChange={(e) => setNewAuthor({...newAuthor, surname: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Doğum Tarihi</label>
                                <input 
                                    type="date" 
                                    value={newAuthor.birthDate} 
                                    onChange={(e) => setNewAuthor({...newAuthor, birthDate: e.target.value})} 
                                    min="1900-01-01"
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split("T")[0]}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Biyografi</label>
                                <textarea value={newAuthor.biography} onChange={(e) => setNewAuthor({...newAuthor, biography: e.target.value})} rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary resize-none"></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAuthorModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">İptal</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* YAYINEVİ EKLEME MODALI */}
            {isPublisherModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Yeni Yayınevi Ekle</h3>
                        <form onSubmit={handleAddPublisher} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Yayınevi Adı *</label>
                                <input type="text" value={newPublisher.name} onChange={(e) => setNewPublisher({...newPublisher, name: e.target.value})} required className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">İletişim Email</label>
                                    <input type="email" value={newPublisher.contactEmail} onChange={(e) => setNewPublisher({...newPublisher, contactEmail: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Website</label>
<input 
    type="text" 
    value={newPublisher.website} 
    onChange={(e) => setNewPublisher({...newPublisher, website: e.target.value})} 
    placeholder="www.ornek.com"
    className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" 
/>                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Açıklama</label>
                                <textarea value={newPublisher.description} onChange={(e) => setNewPublisher({...newPublisher, description: e.target.value})} rows="2" className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary resize-none"></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsPublisherModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">İptal</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* KATEGORİ EKLEME MODALI */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Yeni Kategori Ekle</h3>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required placeholder="Kategori Adı..." className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">İptal</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookAdd;