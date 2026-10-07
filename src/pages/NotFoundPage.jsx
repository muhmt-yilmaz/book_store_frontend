import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 font-sans text-center">
            <div className="text-9xl font-extrabold text-primary mb-4 opacity-20">404</div>
            <div className="text-6xl mb-6">🛸</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Uzayda Kaybolmuş Gibisiniz!
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-md">
                Aradığınız sayfayı bulamadık. Sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.
            </p>
            <div className="flex gap-4">
                <Link 
                    to="/" 
                    className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md"
                >
                    Ana Sayfaya Dön
                </Link>
                <Link 
                    to="/catalog" 
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-bold transition-all shadow-sm"
                >
                    Kataloğu İncele
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;