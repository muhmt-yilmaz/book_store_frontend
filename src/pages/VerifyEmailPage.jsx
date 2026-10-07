import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { resendVerificationEmail } from '../services/authService';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHelper';


const CODE_VALID_SECONDS = 3 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    
    const emailFromUrl = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailFromUrl);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);


    const [codeSecondsLeft, setCodeSecondsLeft] = useState(CODE_VALID_SECONDS);
    const [resendSecondsLeft, setResendSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

    useEffect(() => {
        const interval = setInterval(() => {
            setCodeSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
            setResendSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const codeExpired = codeSecondsLeft <= 0;
    const canResend = resendSecondsLeft <= 0;

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            
            await api.post('/auth/verify', { email, code });
            toast.success("E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.");
            sessionStorage.removeItem('pendingRegistration'); 
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Doğrulama kodu hatalı veya süresi dolmuş."));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = useCallback(async () => {
        if (!email) {
            toast.error("Kod gönderebilmemiz için önce e-posta adresinizi girin.");
            return;
        }
        setResending(true);
        try {
            await resendVerificationEmail(email);
            toast.success("Yeni doğrulama kodu e-postanıza gönderildi.");
            
            
            setCodeSecondsLeft(CODE_VALID_SECONDS);
            setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
            setCode('');
        } catch (error) {
            toast.error(error.message || "Kod tekrar gönderilemedi.");
        } finally {
            setResending(false);
        }
    }, [email]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="text-5xl mb-3">✉️</div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                    E-Postanızı Doğrulayın
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Lütfen e-posta adresinize gönderilen doğrulama kodunu aşağıya girin.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10">

                    {}
                    <div className={`mb-6 text-center text-sm font-medium rounded-lg py-2 px-3 ${codeExpired ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-primary'}`}>
                        {codeExpired
                            ? "Kodun süresi doldu. Lütfen yeni bir kod isteyin."
                            : <>Kodun geçerlilik süresi: <span className="font-mono font-bold">{formatTime(codeSecondsLeft)}</span></>
                        }
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
                            <input 
                                type="email" 
                                value={email} 
                                disabled
                                required 
                                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Farklı bir e-posta adresi mi kullanmak istiyorsunuz?{' '}
                                <Link
                                    to="/register"
                                    className="text-primary font-medium hover:underline"
                                >
                                    Kayıt bilgilerinize dönün
                                </Link>
                                {' '}(diğer bilgileriniz korunacak).
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Doğrulama Kodu</label>
                            <input 
                                type="text" 
                                value={code} 
                                onChange={(e) => setCode(e.target.value)} 
                                required 
                                disabled={codeExpired}
                                placeholder="Örn: 123456"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-center tracking-widest text-lg font-mono disabled:bg-gray-100 disabled:text-gray-400"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || codeExpired}
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold hover:bg-opacity-95 transition-colors shadow-sm disabled:bg-gray-400"
                        >
                            {loading ? 'Doğrulanıyor...' : 'Hesabı Doğrula'}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending || !canResend}
                            className="w-full text-primary font-medium text-sm hover:underline disabled:text-gray-400 disabled:no-underline"
                        >
                            {resending
                                ? 'Gönderiliyor...'
                                : canResend
                                    ? 'Kodu Tekrar Gönder'
                                    : `Kodu Tekrar Gönder (${resendSecondsLeft}sn sonra)`
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
