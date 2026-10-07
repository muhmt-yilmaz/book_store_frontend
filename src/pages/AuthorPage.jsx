import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import BookCover from '../components/BookCover';


const AuthorPage = () => {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthor = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/authors/${id}/books`);
                setAuthor(response.data.object || response.data);
            } catch (error) {
                console.error("Yazar bilgileri yüklenemedi:", error);
                toast.error("Yazar bulunamadı.");
            } finally {
                setLoading(false);
            }
        };

        fetchAuthor();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">Yazar bilgileri yükleniyor...</div>;
    }

    if (!author) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Yazar Bulunamadı</h2>
                <Link to="/catalog" className="text-primary font-medium hover:underline mt-2">Kataloğa Dön</Link>
            </div>
        );
    }

    const fullName = `${author.name} ${author.surname || ''}`.trim();

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10 flex flex-col md:flex-row gap-6 items-start">
                    <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-extrabold flex-shrink-0">
                        {author.name?.charAt(0)}{author.surname?.charAt(0)}
                    </div>
                    <div className="flex-grow">
                        <h1 className="text-3xl font-extrabold text-gray-900">{fullName}</h1>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            {author.nationality && <span>🌍 {author.nationality}</span>}
                            {author.birthDate && <span>🎂 {new Date(author.birthDate).toLocaleDateString('tr-TR')}</span>}
                            {author.websiteUrl && (
                                <a href={author.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                    🔗 Web Sitesi
                                </a>
                            )}
                        </div>
                        {author.biography && (
                            <p className="text-gray-600 mt-4 leading-relaxed">{author.biography}</p>
                        )}
                    </div>
                </div>

                {}
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {fullName} - Kitapları ({author.books?.length || 0})
                </h2>

                {author.books && author.books.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {author.books.map((book) => {
                            const hasDiscount = book.discountPercentage > 0;
                            const finalPrice = hasDiscount
                                ? (book.price * (1 - book.discountPercentage / 100))
                                : book.price;

                            return (
                                <Link key={book.id} to={`/book/${book.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                    <BookCover
                                        src={book.coverImageUrl}
                                        alt={book.title}
                                        className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="p-3">
                                        <span className="text-xs font-semibold text-primary uppercase">{book.categoryName}</span>
                                        <h3 className="text-sm font-bold text-gray-900 leading-tight mt-1 line-clamp-2">{book.title}</h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            {hasDiscount && (
                                                <span className="text-xs text-gray-400 line-through">{book.price?.toFixed(2)} ₺</span>
                                            )}
                                            <span className="text-sm font-extrabold text-gray-900">{finalPrice?.toFixed(2)} ₺</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
                        Bu yazara ait sistemde kayıtlı kitap bulunmuyor.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorPage;
