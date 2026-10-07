import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';
import { normalizeUrl } from '../utils/urlHelper';

const PublisherManagement = () => {
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);


    
    const [formData, setFormData] = useState({ id: '', name: '', description: '', website: '', contactEmail: '' });

    const fetchPublishers = async () => {
        try {
            const response = await api.get('/publishers/all');
            setPublishers(response.data.object || response.data);
        } catch (error) {
            console.error(error);
            toast.error("Yayınevleri yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublishers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (publisher = null) => {
        if (publisher) {
            setIsEditing(true);
            setFormData({
                id: publisher.id,
                name: publisher.name,
                description: publisher.description || '',
                website: publisher.website || '',
                contactEmail: publisher.contactEmail || ''
            });
        } else {
            setIsEditing(false);
            setFormData({ id: '', name: '', description: '', website: '', contactEmail: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            ...(formData.description && { description: formData.description }),
            ...(formData.website && { website: normalizeUrl(formData.website) }),
            ...(formData.contactEmail && { contactEmail: formData.contactEmail })
        };
        try {
            if (isEditing) {
                await api.put(`/publishers/${formData.id}`, payload);
                toast.success("Yayınevi başarıyla güncellendi!");
            } else {
                await api.post('/publishers', payload);
                toast.success("Yayınevi başarıyla eklendi!");
            }
            setIsModalOpen(false);
            setLoading(true);
            await fetchPublishers();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "İşlem başarısız oldu."));
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`"${name}" yayınevini silmek istediğinize emin misiniz?`)) return;
        try {
            await api.delete(`/publishers/${id}`);
            toast.success("Yayınevi başarıyla silindi!");
            setLoading(true);
            await fetchPublishers();
        } catch (error) {
            console.error(error);
            toast.error("Silme işlemi başarısız.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Yayınevi Yönetimi</h2>
                        <p className="text-sm text-gray-500 mt-1">Sistemdeki tüm yayınevlerini yönetin.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                        + Yeni Yayınevi
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500 font-medium animate-pulse">Yükleniyor...</div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-xs">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Yayınevi Adı</th>
                                    <th className="px-6 py-4">İletişim</th>
                                    <th className="px-6 py-4 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {publishers.length > 0 ? (
                                    publishers.map((publisher) => (
                                        <tr key={publisher.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">#{publisher.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                {publisher.name}
                                                {publisher.website && (
                                                    <a href={publisher.website} target="_blank" rel="noreferrer" className="block text-xs font-normal text-indigo-500 hover:underline">{publisher.website}</a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">{publisher.contactEmail || '-'}</td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <button onClick={() => handleOpenModal(publisher)} className="text-indigo-600 hover:text-indigo-900 font-medium">Düzenle</button>
                                                <button onClick={() => handleDelete(publisher.id, publisher.name)} className="text-red-600 hover:text-red-900 font-medium">Sil</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">Kayıtlı yayınevi bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 px-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">{isEditing ? 'Yayınevini Güncelle' : 'Yeni Yayınevi Ekle'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yayınevi Adı *</label>
                                <input 
                                    type="text" name="name" value={formData.name} onChange={handleChange} required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">İletişim E-Postası</label>
                                <input 
                                    type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
                                <input 
                                    type="text" name="website" value={formData.website} onChange={handleChange} placeholder="ornek.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea 
                                    name="description" value={formData.description} onChange={handleChange} rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublisherManagement;
