import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { mergeGuestCartIntoAccount } from '../services/cartService';
import { getGuestCartItems } from '../utils/guestCart';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const authResponse = await login(email, password); 
            
            
            localStorage.setItem('userName', authResponse.name || 'Kullanıcı');


            const role = (authResponse.role || 'CUSTOMER').replace('ROLE_', '').toUpperCase();
            localStorage.setItem('userRole', role);


            
            
            const hadGuestCart = getGuestCartItems().length > 0;
            if (role === 'CUSTOMER' && hadGuestCart) {
                await mergeGuestCartIntoAccount();
            }

            if (role === 'ADMIN' || role === 'MANAGER') {
                toast.success(`Yönetim Paneline Hoşgeldiniz, ${authResponse.name}!`);
                navigate('/admin/dashboard');
            } else if (hadGuestCart) {
                toast.success("Giriş başarılı! Sepetiniz hesabınıza aktarıldı.");
                navigate('/cart');
            } else {
                toast.success("Giriş Başarılı!");
                navigate('/'); 
            }

        } catch (err) {


            
            
            const status = err.cause?.response?.status;

            if (status === 403) {
                toast.error(err.message);
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-md rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Hoş Geldiniz</h2>
                    <p className="text-gray-500 text-sm">Kitap mağazasına giriş yapmak için bilgilerinizi girin.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1">E-Posta Adresi</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Şifre</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 mt-2"
                    >
                        Giriş Yap
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    Hesabınız yok mu?{' '}
                    <Link to="/register" className="font-semibold text-primary hover:underline">
                        Hemen Kaydolun
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;