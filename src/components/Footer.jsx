import { Link } from 'react-router-dom';


const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">📚</span>
                            <span className="font-extrabold text-xl text-white">
                                Book<span className="text-indigo-400">Store</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Binlerce kitap, yazar ve yayınevi arasında aradığınız eseri keşfedin.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Keşfet</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/catalog" className="hover:text-white transition-colors">Katalog</Link></li>
                            <li><Link to="/authors" className="hover:text-white transition-colors">Yazarlar</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Hesabım</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/login" className="hover:text-white transition-colors">Giriş Yap</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">Kayıt Ol</Link></li>
                            <li><Link to="/cart" className="hover:text-white transition-colors">Sepetim</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Bilgi</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>🔒 Güvenli Ödeme (Iyzico)</li>
                            <li>📦 Hızlı Teslimat</li>
                            <li>↩️ Kolay İade</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
                    © {year} BookStore. Tüm hakları saklıdır.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
