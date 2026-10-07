import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';


const getMaxBirthDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);


    
    const getInitialFormData = () => {
        try {
            const saved = sessionStorage.getItem('pendingRegistration');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...parsed, email: '', password: '', confirmPassword: '' };
            }
        } catch {
            
        }
        return {
            name: '', surname: '', email: '', password: '', confirmPassword: '',
            birthDate: '', phoneNumber: '', tc: '', gender: 'MALE'
        };
    };

    const [formData, setFormData] = useState(getInitialFormData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidEmail(formData.email)) {
            toast.error("Lütfen geçerli bir e-posta adresi girin (örn. ornek@site.com).");
            return;
        }

        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Girdiğiniz şifreler birbiriyle uyuşmuyor!");
            return;
        }

        setLoading(true);
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

            await api.post('/auth/register', payload);
            toast.success("Kayıt başarılı! Lütfen e-postanıza gelen doğrulama kodunu girin.");


            sessionStorage.setItem('pendingRegistration', JSON.stringify({ ...formData, password: '', confirmPassword: '' }));

            
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Kayıt olurken bir hata oluştu."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Yeni Hesap Oluştur
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Zaten hesabınız var mı?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Giriş yapın
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                                <input type="text" name="surname" value={formData.surname} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                required
                                max={getMaxBirthDate()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                            <p className="text-xs text-gray-400 mt-1">Kayıt olabilmek için 18 yaşından gün almış olmanız gerekir.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (İsteğe Bağlı)</label>
                                {}
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="90XXXXXXXXXX (12 hane)" maxLength="12" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                                <p className="text-xs text-gray-400 mt-1">Başında ülke kodu (90) ile, boşluksuz 12 hane.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik (İsteğe Bağlı)</label>
                                {}
                                <input type="text" name="tc" value={formData.tc} onChange={handleChange} placeholder="TC Kimlik No" maxLength="11" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                                    <option value="MALE">Erkek</option>
                                    <option value="FEMALE">Kadın</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-sm disabled:bg-gray-400"
                        >
                            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
