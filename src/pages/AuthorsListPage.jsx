import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';


const AuthorsListPage = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await api.get('/authors/all');
                setAuthors(response.data.object || []);
            } catch (error) {
                console.error(error);
                toast.error("Yazarlar yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        fetchAuthors();
    }, []);

    const filteredAuthors = authors.filter((a) =>
        `${a.name} ${a.surname}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900">Yazarlar</h1>
                    <p className="text-gray-500 mt-2">Kataloğumuzdaki tüm yazarları keşfedin.</p>
                </div>

                <div className="max-w-md mx-auto mb-10">
                    <input
                        type="text"
                        placeholder="Yazar ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 animate-pulse py-12">Yazarlar yükleniyor...</div>
                ) : filteredAuthors.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {filteredAuthors.map((author) => (
                            <Link
                                key={author.id}
                                to={`/author/${author.id}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                            >
                                <div className="h-16 w-16 mx-auto rounded-full bg-primary text-white flex items-center justify-center text-xl font-extrabold mb-3">
                                    {author.name?.charAt(0)}{author.surname?.charAt(0)}
                                </div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{author.name} {author.surname}</h3>
                                {author.nationality && <p className="text-xs text-gray-400 mt-1">{author.nationality}</p>}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">Aramanızla eşleşen yazar bulunamadı.</div>
                )}
            </div>
        </div>
    );
};

export default AuthorsListPage;
