import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NewsDetailModal from './NewsDetail.jsx'; // Import modal component

export default function SportsNewsPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const { t, i18n } = useTranslation();
    // States for modal
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Object chứa các URL RSS theo ngôn ngữ
    const RSS_SOURCES = {
        vi: 'https://vnexpress.net/rss/the-thao.rss',
        en: 'https://www.espn.com/espn/rss/news',
        ja: 'https://www.asahi.com/rss/asahi/newsheadlines.rdf'
    };

    // Lấy ngôn ngữ hiện tại từ i18n
    const currentLanguage = i18n.language || 'vi';

    // Lấy URL RSS dựa theo ngôn ngữ hiện tại - KHÔNG đặt trong dependency array
    const rssUrl = RSS_SOURCES[currentLanguage] || RSS_SOURCES.vi;

    useEffect(() => {
        // Biến cờ để kiểm tra component còn mounted hay không
        let isMounted = true;

        async function fetchData() {
            if (!isMounted) return;

            setLoading(true);
            setError(null);

            try {
                // Log URL để debug
                console.log("Fetching RSS from:", rssUrl);

                // Sử dụng rss2json API
                const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
                const response = await fetch(proxyUrl);

                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }

                const data = await response.json();
                console.log("RSS API response:", data); // Log để debug

                // Kiểm tra xem API có trả về lỗi không
                if (data.status !== 'ok') {
                    throw new Error(data.message || 'Failed to fetch RSS feed');
                }

                // Xử lý kết quả và tìm hình ảnh
                const processedItems = data.items.map(item => {
                    // Debug log để xem cấu trúc của mỗi item
                    console.log("Processing item:", item.title);

                    // Khởi tạo URL hình ảnh là null
                    let imageUrl = null;

                    // Xác định source của RSS để có xử lý phù hợp
                    const isVnExpress = item.link && item.link.includes('vnexpress.net');

                    // 1. Kiểm tra thumbnail từ API
                    if (item.thumbnail && item.thumbnail !== '') {
                        console.log("Found thumbnail in API response:", item.thumbnail);
                        imageUrl = item.thumbnail;
                    }
                    // 2. Tìm trong enclosure (phổ biến trong RSS)
                    else if (item.enclosure && item.enclosure.link) {
                        console.log("Found image in enclosure:", item.enclosure.link);
                        imageUrl = item.enclosure.link;
                    }
                    // 3. Xử lý đặc biệt cho VnExpress
                    else if (isVnExpress) {
                        // VnExpress thường có ảnh trong thẻ <img> trong description hoặc content
                        const contentToCheck = item.description || item.content || '';

                        // Sử dụng regex cụ thể cho VnExpress để lấy URL hình ảnh
                        const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
                        const imgMatch = contentToCheck.match(imgRegex);

                        if (imgMatch && imgMatch[1]) {
                            console.log("Found VnExpress image:", imgMatch[1]);
                            imageUrl = imgMatch[1];

                            // Xử lý trường hợp URL có chứa các ký tự đặc biệt HTML entity
                            if (imageUrl.includes('&amp;')) {
                                imageUrl = imageUrl.replace(/&amp;/g, '&');
                            }
                        }
                    }
                    // 4. Xử lý chung cho các nguồn khác
                    else {
                        // Kiểm tra trong content và description với regex tổng quát
                        const contentToCheck = item.content || '';
                        const descriptionToCheck = item.description || '';

                        // Tìm trong content trước
                        let imgMatch = contentToCheck.match(/<img[^>]+src=["']([^"']+)["']/i);
                        if (imgMatch && imgMatch[1]) {
                            console.log("Found image in content:", imgMatch[1]);
                            imageUrl = imgMatch[1];
                        }
                        // Nếu không tìm thấy, tìm trong description
                        else {
                            imgMatch = descriptionToCheck.match(/<img[^>]+src=["']([^"']+)["']/i);
                            if (imgMatch && imgMatch[1]) {
                                console.log("Found image in description:", imgMatch[1]);
                                imageUrl = imgMatch[1];
                            }
                            // Tìm URL ảnh trực tiếp
                            else {
                                const urlMatch = (contentToCheck + descriptionToCheck).match(/(https?:\/\/[^\s"'<>()]+?\.(jpg|jpeg|png|gif|webp))/i);
                                if (urlMatch && urlMatch[1]) {
                                    console.log("Found direct image URL:", urlMatch[1]);
                                    imageUrl = urlMatch[1];
                                }
                            }
                        }
                    }

                    // Đảm bảo URL hình ảnh là hợp lệ và tuyệt đối (không phải relative)
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        // Nếu là đường dẫn tương đối, chuyển thành tuyệt đối
                        try {
                            const baseUrl = new URL(item.link).origin;
                            imageUrl = new URL(imageUrl, baseUrl).href;
                        } catch (e) {
                            console.error("Error converting relative URL to absolute:", e);
                        }
                    }

                    // Trích xuất văn bản tóm tắt (nếu không có trong item)
                    let summary = '';
                    if (item.content) {
                        // Loại bỏ các thẻ HTML để lấy text thuần túy
                        summary = item.content.replace(/<[^>]*>?/gm, '').trim();
                    } else if (item.description) {
                        summary = item.description.replace(/<[^>]*>?/gm, '').trim();
                    }

                    // Trả về item với hình ảnh đã tìm thấy và tóm tắt
                    return {
                        ...item,
                        thumbnail: imageUrl,
                        summary: summary
                    };
                });

                console.log("Processed items:", processedItems.length);

                if (isMounted) {
                    setArticles(processedItems);
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching RSS:", err);
                if (isMounted) {
                    setError(err.message);
                    // Tạo vài bài viết giả để hiển thị khi lỗi
                    setArticles(generateFallbackArticles());
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        // Cleanup function để tránh memory leak và cập nhật state khi component unmounted
        return () => {
            isMounted = false;
        };
    }, [currentLanguage, t]); // Chỉ chạy lại khi ngôn ngữ thay đổi hoặc hàm t thay đổi

    // Hàm tạo dữ liệu giả để hiển thị khi lỗi
    const generateFallbackArticles = () => {
        const today = new Date().toISOString();

        return [
            {
                title: currentLanguage === 'vi' ? 'Bóng đá Việt Nam' :
                    currentLanguage === 'en' ? 'Football News' : 'サッカーニュース',
                pubDate: today,
                link: '#',
                content: currentLanguage === 'vi' ? 'Tin tức bóng đá mới nhất từ Việt Nam.' :
                    currentLanguage === 'en' ? 'Latest football news.' : 'サッカーの最新ニュース',
                thumbnail: 'https://placehold.co/600x400/orange/white?text=Sports'
            },
            {
                title: currentLanguage === 'vi' ? 'Tin thể thao quốc tế' :
                    currentLanguage === 'en' ? 'International Sports' : '国際スポーツニュース',
                pubDate: today,
                link: '#',
                content: currentLanguage === 'vi' ? 'Cập nhật tin thể thao quốc tế mới nhất.' :
                    currentLanguage === 'en' ? 'Latest international sports updates.' : '国際スポーツの最新情報',
                thumbnail: 'https://placehold.co/600x400/blue/white?text=International'
            }
        ];
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSummary = (content) => {
        if (!content) return '';
        // Nếu đã có summary được xử lý trong item, sử dụng nó
        const text = content.replace(/<[^>]*>?/gm, '');
        return text.length > 120 ? text.substring(0, 120) + '...' : text;
    };

    // Hàm kiểm tra URL hình ảnh hợp lệ
    const isValidImageUrl = (url) => {
        if (!url) return false;
        return true; // Chấp nhận tất cả URL vì hình ảnh có thể đến từ nhiều nguồn khác nhau
    };

    // Xử lý khi người dùng click vào một bài viết
    const handleArticleClick = (e, article) => {
        e.preventDefault(); // Ngăn chặn chuyển hướng mặc định
        setSelectedArticle(article);
        setIsModalOpen(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <header className="mb-6">
                <h1 className="text-3xl font-bold mb-4 text-orange-800">{t('title')}</h1>

                {error && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    {error} {t('errors.usingBackupData')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                onClick={() => setSearchTerm('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="flex space-x-2 self-end">
                        <button
                            className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            {t('viewMode.grid')}
                        </button>
                        <button
                            className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setViewMode('list')}
                        >
                            {t('viewMode.list')}
                        </button>
                    </div>
                </div>
            </header>

            {filteredArticles.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-lg text-gray-600">{t('search.noResults')}</p>
                </div>
            ) : (
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                    {filteredArticles.map((article, index) => (
                        <div
                            key={`${article.link}-${index}`}
                            className={`overflow-hidden bg-white transition-all duration-300 rounded-lg border hover:shadow-lg ${
                                viewMode === 'grid' ? 'flex flex-col' : 'flex items-start'
                            }`}
                        >
                            <a
                                href={article.link}
                                onClick={(e) => handleArticleClick(e, article)}
                                className={`block ${viewMode === 'list' ? 'flex' : 'flex-col'} w-full cursor-pointer`}
                            >
                                <div className={`${viewMode === 'list' ? 'w-40 min-w-40 mr-4' : 'w-full h-48'}`}>
                                    {article.thumbnail && isValidImageUrl(article.thumbnail) ? (
                                        <img
                                            src={article.thumbnail}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://placehold.co/600x400/f3f4f6/a1a1aa?text=${encodeURIComponent(t('images.notAvailable'))}`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400">{t('images.notAvailable')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 flex-1">
                                    <h2 className="font-bold text-lg text-orange-900 hover:text-orange-700 mb-2">
                                        {article.title}
                                    </h2>
                                    <p className="text-sm text-gray-600 mb-2">
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
                                    </p>
                                    {viewMode === 'grid' && (
                                        <p className="text-gray-700 text-sm">{getSummary(article.content || article.summary || '')}</p>
                                    )}
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <NewsDetailModal
                article={selectedArticle}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}