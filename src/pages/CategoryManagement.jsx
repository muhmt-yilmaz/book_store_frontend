import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', categoryName: '' });

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/all');
            setCategories(response.data.object || response.data);
        } catch (error) {
            console.error(error);
            toast.error("Kategoriler yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setIsEditing(true);
            setFormData({ id: category.id, categoryName: category.categoryName });
        } else {
            setIsEditing(false);
            setFormData({ id: '', categoryName: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/categories/${formData.id}`, { categoryName: formData.categoryName });
                toast.success("Kategori başarıyla güncellendi!");
            } else {
                await api.post('/categories', { categoryName: formData.categoryName });
                toast.success("Kategori başarıyla eklendi!");
            }
            setIsModalOpen(false);
            setLoading(true);
            await fetchCategories();
        } catch (error) {
            console.error(error);
            toast.error("İşlem başarısız oldu.");
        }
    };

    const handleDelete = async (id, categoryName) => {
        if (!window.confirm(`"${categoryName}" kategorisini silmek istediğinize emin misiniz?`)) return;
        try {
            await api.delete(`/categories/${id}`);
            toast.success("Kategori başarıyla silindi!");
            setLoading(true);
            await fetchCategories();
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
                        <h2 className="text-2xl font-bold text-gray-800">Kategori Yönetimi</h2>
                        <p className="text-sm text-gray-500 mt-1">Sistemdeki tüm kategorileri yönetin.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                        + Yeni Kategori
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
                                    <th className="px-6 py-4">Kategori Adı</th>
                                    <th className="px-6 py-4 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">#{category.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{category.categoryName}</td>
                                            <td className="px-6 py-4 text-center space-x-4">
                                                <button onClick={() => handleOpenModal(category)} className="text-indigo-600 hover:text-indigo-900 font-medium">Düzenle</button>
                                                <button onClick={() => handleDelete(category.id, category.categoryName)} className="text-red-600 hover:text-red-900 font-medium">Sil</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">Kayıtlı kategori bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">{isEditing ? 'Kategoriyi Güncelle' : 'Yeni Kategori Ekle'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                                <input 
                                    type="text" name="categoryName" value={formData.categoryName} onChange={handleChange} required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
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

export default CategoryManagement;