import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';


const getMaxBirthDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
};

const emptyForm = {
    name: '', surname: '', email: '', password: '',
    birthDate: '', gender: 'MALE', phoneNumber: '', tc: ''
};

const ManagerManagement = () => {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    const fetchManagers = async () => {
        setLoading(true);
        try {
            
            const response = await api.get('/manager/getAll?page=0&size=50&sort=name&type=asc');
            const pageData = response.data.object;
            setManagers(pageData?.content || []);
        } catch (error) {
            console.error(error);
            toast.error("Mağaza yöneticileri yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        
        fetchManagers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenModal = () => {
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            
            const payload = {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                password: formData.password,
                birthDate: formData.birthDate,
                gender: formData.gender,
                ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
                ...(formData.tc && { tc: formData.tc })
            };
            
            await api.post('/manager/save', payload);
            toast.success("Mağaza yöneticisi başarıyla eklendi!");
            setIsModalOpen(false);
            await fetchManagers();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Mağaza yöneticisi eklenirken hata oluştu."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, fullName) => {
        if (!window.confirm(`"${fullName}" adlı mağaza yöneticisi hesabını silmek istediğinize emin misiniz?`)) return;
        try {
            
            await api.delete(`/manager/delete/${id}`);
            toast.success("Mağaza yöneticisi silindi.");
            await fetchManagers();
        } catch (error) {
            console.error(error);
            toast.error("Silme işlemi başarısız.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mağaza Yöneticileri</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Kitap/kategori/yayınevi/sipariş yönetimi yapabilen, ancak personel hesaplarını yönetemeyen mağaza yöneticisi (moderatör) hesaplarını buradan yönetebilirsiniz.
                        </p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="bg-primary hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm whitespace-nowrap"
                    >
                        + Yeni Yönetici Ekle
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500 font-medium animate-pulse">Yükleniyor...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Ad Soyad</th>
                                        <th className="px-6 py-4">E-Posta</th>
                                        <th className="px-6 py-4">Telefon</th>
                                        <th className="px-6 py-4 text-center w-32">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {managers.length > 0 ? (
                                        managers.map((manager) => (
                                            <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{manager.name} {manager.surname}</td>
                                                <td className="px-6 py-4">{manager.email}</td>
                                                <td className="px-6 py-4">{manager.phoneNumber || '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => handleDelete(manager.id, `${manager.name} ${manager.surname}`)} className="text-red-600 hover:text-red-900 font-bold text-sm">
                                                        Sil
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">Henüz kayıtlı mağaza yöneticisi bulunmamaktadır.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 px-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-900">Yeni Mağaza Yöneticisi Ekle</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                                    <input type="text" name="surname" value={formData.surname} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre * (en az 8 karakter)</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="8" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi *</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required max={getMaxBirthDate()} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet *</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                                        <option value="MALE">Erkek</option>
                                        <option value="FEMALE">Kadın</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (İsteğe Bağlı)</label>
                                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="90XXXXXXXXXX" maxLength="12" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik (İsteğe Bağlı)</label>
                                    <input type="text" name="tc" value={formData.tc} onChange={handleChange} maxLength="11" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition-colors">İptal</button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 shadow-sm transition-all disabled:bg-gray-400">
                                    {saving ? 'Kaydediliyor...' : 'Yöneticiyi Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerManagement;
