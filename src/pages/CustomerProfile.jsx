import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';

const CustomerProfile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    
    const [readOnlyData, setReadOnlyData] = useState({ email: '', tc: '' });


    
    
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phoneNumber: '',
        birthDate: '',
        gender: 'MALE'
    });

    
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                
                
                const response = await api.get('/customer/profile');
                const data = response.data.object || response.data;

                setReadOnlyData({
                    email: data.email || '',
                    tc: data.tc || ''
                });

                setFormData({
                    name: data.name || '',
                    surname: data.surname || '',
                    phoneNumber: data.phoneNumber || '',
                    birthDate: data.birthDate || '',
                    gender: data.gender || 'MALE'
                });
            } catch (error) {
                console.error(error);
                toast.error("Profil bilgileri yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            
            await api.put('/customer/profile', formData);
            toast.success("Profil bilgileriniz başarıyla güncellendi!");
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Profil güncellenirken bir hata oluştu."));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium animate-pulse">Profiliniz yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-primary px-8 py-6 text-white flex items-center gap-4">
                        <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                            {formData.name.charAt(0)}{formData.surname.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Profilim</h2>
                            <p className="text-indigo-100 text-sm mt-1">Kişisel bilgilerinizi güncelleyin.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adınız</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                />
                            </div>
                            
                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Soyadınız</label>
                                <input 
                                    type="text" 
                                    name="surname" 
                                    value={formData.surname} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
                                <input 
                                    type="email" 
                                    value={readOnlyData.email} 
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">E-posta adresiniz hesabınıza tanımlıdır ve değiştirilemez.</p>
                            </div>

                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
                                <input 
                                    type="text" 
                                    value={readOnlyData.tc || 'Belirtilmemiş'} 
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                                <input 
                                    type="tel" 
                                    name="phoneNumber" 
                                    value={formData.phoneNumber} 
                                    onChange={handleChange}
                                    placeholder="90XXXXXXXXXX (12 hane)"
                                    maxLength="12"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                />
                            </div>

                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                                <input 
                                    type="date" 
                                    name="birthDate" 
                                    value={formData.birthDate} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                />
                            </div>
                        </div>

                        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                            <select 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                            >
                                <option value="MALE">Erkek</option>
                                <option value="FEMALE">Kadın</option>
                            </select>
                        </div>

                        {}
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md disabled:bg-gray-400"
                            >
                                {saving ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default CustomerProfile;
