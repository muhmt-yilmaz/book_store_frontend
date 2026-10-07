import { Link } from 'react-router-dom';

const ForbiddenPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 font-sans text-center">
            <div className="text-9xl font-extrabold text-red-500 mb-4 opacity-20">403</div>
            <div className="text-6xl mb-6">🛑</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Erişim Reddedildi
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-md">
                Bu sayfayı görüntülemek için gerekli yönetici (admin) yetkilerine sahip değilsiniz.
            </p>
            <Link 
                to="/" 
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md"
            >
                Güvenli Bölgeye (Ana Sayfa) Dön
            </Link>
        </div>
    );
};

export default ForbiddenPage;