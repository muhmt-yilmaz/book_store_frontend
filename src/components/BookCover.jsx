import { useState } from 'react';


const BookCover = ({ src, alt, className = '' }) => {
    const [failed, setFailed] = useState(false);

    const fullSrc = src && src.startsWith('http') ? src : src ? `http://localhost:8080${src}` : null;

    if (!fullSrc || failed) {
        return (
            <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
                <span className="text-4xl opacity-40">📚</span>
            </div>
        );
    }

    return (
        <img
            src={fullSrc}
            alt={alt || 'Kitap kapağı'}
            className={className}
            onError={() => setFailed(true)}
        />
    );
};

export default BookCover;
