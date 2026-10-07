import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import { normalizeUrl } from '../utils/urlHelper';

const AuthorManagement = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);


    
    
    const [formData, setFormData] = useState({ id: '', name: '', surname: '', biography: '', birthDate: '', nationality: '', websiteUrl: '' });

    const fetchAuthors = async () => {
        try {
            const response = await api.get('/authors/all');
            setAuthors(response.data.object || response.data);
        } catch (error) {
            console.error(error);
            toast.error("Yazarlar yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        
        fetchAuthors();
    }, []);

    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (author = null) => {
        if (author) {
            setIsEditing(true);
            
            const formattedDate = author.birthDate ? author.birthDate.split('T')[0] : '';
            setFormData({
                id: author.id,
                name: author.name,
                surname: author.surname || '',
                biography: author.biography || '',
                birthDate: formattedDate,
                nationality: author.nationality || '',
                websiteUrl: author.websiteUrl || ''
            });
        } else {
            setIsEditing(false);
            setFormData({ id: '', name: '', surname: '', biography: '', birthDate: '', nationality: '', websiteUrl: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        const payload = {
            name: formData.name,
            surname: formData.surname,
            ...(formData.biography && formData.biography.trim() !== '' && { biography: formData.biography }),
            ...(formData.birthDate && { birthDate: formData.birthDate }),
            ...(formData.nationality && formData.nationality.trim() !== '' && { nationality: formData.nationality }),
            ...(formData.websiteUrl && formData.websiteUrl.trim() !== '' && { websiteUrl: normalizeUrl(formData.websiteUrl) })
        };

        try {
            if (isEditing) {
                await api.put(`/authors/${formData.id}`, payload);
                toast.success("Yazar başarıyla güncellendi!");
            } else {
                await api.post('/authors', payload);
                toast.success("Yazar başarıyla eklendi!");
            }
            setIsModalOpen(false);
            setLoading(true);
            await fetchAuthors();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "İşlem başarısız oldu."));
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`"${name}" adlı yazarı silmek istediğinize emin misiniz? (Bu yazara ait kitaplar etkilenebilir)`)) return;
        try {
            await api.delete(`/authors/${id}`);
            toast.success("Yazar başarıyla silindi!");
            setLoading(true);
            await fetchAuthors();
        } catch (error) {
            console.error(error);
            toast.error("Silme işlemi başarısız.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                
                {}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Yazar Yönetimi</h2>
                        <p className="text-sm text-gray-500 mt-1">Sistemdeki tüm yazarları detaylarıyla beraber buradan yönetebilirsiniz.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-primary hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
                    >
                        + Yeni Yazar Ekle
                    </button>
                </div>

                {}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500 font-medium animate-pulse">Yazarlar Yükleniyor...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-xs">
                                    <tr>
                                        <th className="px-6 py-4 w-1/4">Yazar Adı</th>
                                        <th className="px-6 py-4">Biyografi</th>
                                        <th className="px-6 py-4 text-center w-32">Doğum Tarihi</th>
                                        <th className="px-6 py-4 text-center w-32">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {authors.length > 0 ? (
                                        authors.map((author) => (
                                            <tr key={author.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {author.name} {author.surname}
                                                    {author.nationality && <span className="block text-xs font-normal text-gray-400">{author.nationality}</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="line-clamp-2 text-xs text-gray-500">{author.biography || '-'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">
                                                    {author.birthDate ? new Date(author.birthDate).toLocaleDateString('tr-TR') : <span className="text-gray-400 italic">Bilinmiyor</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-3">
                                                    <button onClick={() => handleOpenModal(author)} className="text-indigo-600 hover:text-indigo-900 font-bold text-sm">Düzenle</button>
                                                    <button onClick={() => handleDelete(author.id, `${author.name} ${author.surname}`)} className="text-red-600 hover:text-red-900 font-bold text-sm">Sil</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">Sistemde henüz kayıtlı yazar bulunmamaktadır.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 px-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Yazarı Güncelle' : 'Yeni Yazar Ekle'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                                    <input 
                                        type="text" name="name" value={formData.name} onChange={handleChange} required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                                    <input 
                                        type="text" name="surname" value={formData.surname} onChange={handleChange} required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                                    <input 
                                        type="date" 
                                        name="birthDate" 
                                        value={formData.birthDate} 
                                        onChange={handleChange} 
                                        min="1900-01-01" 
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split("T")[0]}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Uyruk</label>
                                    <input 
                                        type="text" name="nationality" value={formData.nationality} onChange={handleChange}
                                        placeholder="örn. Türk"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
                                <input 
                                    type="text" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange}
                                    placeholder="ornek.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Biyografi</label>
                                <textarea 
                                    name="biography" value={formData.biography} onChange={handleChange} rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                                    placeholder="Yazar hakkında kısa bilgi..."
                                ></textarea>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4 mt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition-colors">İptal</button>
                                <button type="submit" className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 shadow-sm transition-all">
                                    {isEditing ? 'Değişiklikleri Kaydet' : 'Yazarı Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorManagement;
