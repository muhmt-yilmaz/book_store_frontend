import { useState } from 'react';


const Pagination = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
    const [jumpValue, setJumpValue] = useState('');

    if (totalPages <= 1) return null;

    const handleJump = (e) => {
        e.preventDefault();
        const pageNum = parseInt(jumpValue, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum - 1); 
            setJumpValue('');
        }
    };


    const getPageNumbers = () => {
        const pages = [];
        const delta = 1;
        const range = [];

        for (let i = Math.max(0, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (range[0] > 0) {
            pages.push(0);
            if (range[0] > 1) pages.push('...');
        }
        pages.push(...range);
        if (range[range.length - 1] < totalPages - 1) {
            if (range[range.length - 1] < totalPages - 2) pages.push('...');
            pages.push(totalPages - 1);
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || disabled}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ← Önceki
                </button>

                {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            disabled={disabled}
                            className={`min-w-[2.25rem] px-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                page === currentPage
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {page + 1}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1 || disabled}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Sonraki →
                </button>
            </div>

            {}
            <form onSubmit={handleJump} className="flex items-center gap-2 text-sm text-gray-600">
                <span>Sayfaya git:</span>
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpValue}
                    onChange={(e) => setJumpValue(e.target.value)}
                    placeholder={`${currentPage + 1}`}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center focus:ring-primary focus:border-primary"
                />
                <button
                    type="submit"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                    Git
                </button>
            </form>
        </div>
    );
};

export default Pagination;
