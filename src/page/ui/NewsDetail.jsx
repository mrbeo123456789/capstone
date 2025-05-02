import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function NewsDetailModal({ article, isOpen, onClose }) {
    const { t, i18n } = useTranslation();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy ngôn ngữ hiện tại từ i18n
    const currentLanguage = i18n.language || 'vi';

    useEffect(() => {
        if (!isOpen || !article) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        async function fetchArticleContent() {
            try {
                // First check if we're dealing with an ESPN article based on the link
                const isESPN = article.link && article.link.includes('espn.com');

                if (isESPN) {
                    // ESPN specific handling - you might want to use a proxy service or special API
                    try {
                        // Example using a hypothetical proxy service to fetch ESPN content
                        const response = await fetch(`/api/proxy-fetch?url=${encodeURIComponent(article.link)}`);

                        if (response.ok) {
                            const data = await response.json();
                            if (data.content && isMounted) {
                                setContent(data.content);
                                return; // Exit early if successful
                            }
                        }
                        // If ESPN specific fetch fails, continue to fallback options
                    } catch (espnError) {
                        console.warn("ESPN specific fetch failed:", espnError);
                        // Continue to fallbacks
                    }
                }

                // Standard handling using the existing content/description
                if (article.content && article.content.length > 100) {
                    // Only use content if it's substantial (more than just a summary)
                    let cleanContent = article.content;
                    cleanContent = cleanContent.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
                    cleanContent = cleanContent.replace(/<img /g, '<img class="max-w-full h-auto mx-auto my-4" ');

                    if (isMounted) {
                        setContent(cleanContent);
                    }
                } else if (article.description) {
                    // Use description as fallback
                    if (isMounted) {
                        setContent(article.description);

                        // Add a note that this is just a summary
                        setContent(prev => `
                            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <p class="text-sm text-yellow-700">${t('onlySummaryAvailable')}</p>
                            </div>
                            ${prev}
                        `);
                    }
                } else {
                    // No content available
                    if (isMounted) {
                        setError(t('errors.noContent'));
                    }
                }
            } catch (err) {
                console.error("Error fetching article content:", err);
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchArticleContent();

        return () => {
            isMounted = false;
        };
    }, [article, isOpen, t]);

    if (!isOpen || !article) return null;

    // Ngăn chặn scroll trên body khi modal mở
    if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
    }

    const handleClose = () => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
        onClose();
    };

    // Xác định nguồn tin
    const getSourceName = () => {
        if (!article.link) return '';
        try {
            const url = new URL(article.link);
            return url.hostname.replace('www.', '');
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-orange-800 truncate">{article.title}</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Article Metadata */}
                <div className="px-4 py-2 bg-gray-50 flex flex-wrap justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center">
                        <span className="mr-2">
                            {new Date(article.pubDate).toLocaleDateString(
                                currentLanguage === 'vi' ? 'vi-VN' :
                                    currentLanguage === 'en' ? 'en-US' : 'ja-JP',
                                {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }
                            )}
                        </span>
                        {article.author && (
                            <>
                                <span className="mx-2">|</span>
                                <span>{article.author}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center mt-1 sm:mt-0">
                        <span>{getSourceName()}</span>
                        <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-orange-600 hover:text-orange-800"
                            aria-label={t('openOriginal')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Article Content */}
                <div className="p-4 overflow-y-auto flex-grow">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">{error}</p>
                                    <p className="mt-2">
                                        <a
                                            href={article.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-yellow-700 font-medium hover:text-yellow-600"
                                        >
                                            {t('openOriginalSite')}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Featured Image */}
                            {article.thumbnail && (
                                <div className="mb-6">
                                    <img
                                        src={article.thumbnail}
                                        alt={article.title}
                                        className="max-w-full h-auto mx-auto rounded"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://placehold.co/600x400/f3f4f6/a1a1aa?text=${encodeURIComponent(t('images.notAvailable'))}`;
                                        }}
                                    />
                                </div>
                            )}

                            {/* Main Content */}
                            <div
                                className="prose max-w-none article-content"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="border-t p-4 flex justify-between">
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                    >
                        {t('readOriginal')}
                    </a>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
}