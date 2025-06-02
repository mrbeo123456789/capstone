import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 12;

const ProofUploads = ({ challenge, evidence }) => {
    const { t } = useTranslation();
    const [selectedProof, setSelectedProof] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    if (!challenge || !evidence) return <p>{t("ProofUploads.loading")}</p>;

    // Parse dates and ensure they're treated as UTC to avoid timezone issues
    const parseDate = (dateStr) => {
        const date = new Date(dateStr);
        // Create date in local timezone without time portion
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const startDate = parseDate(challenge.startDate);
    const endDate = parseDate(challenge.endDate);

    // Get today's date without time portion
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Log dates for debugging
    console.log('Start date:', startDate.toLocaleDateString());
    console.log('End date:', endDate.toLocaleDateString());
    console.log('Today:', today.toLocaleDateString());

    // Calculate duration up to today (inclusive) or end date, whichever comes first
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const displayEndDate = todayEnd < endDate ? todayEnd : endDate;
    const duration = Math.floor((displayEndDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Helper function to get consistent date key format (YYYY-MM-DD)
    const getDateKey = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Create map of evidence by date
    const evidenceMap = {};
    evidence?.forEach((e) => {
        if (e.submittedAt) {
            // Parse the submittedAt date, handling timezone consistently
            const parsedDate = parseDate(e.submittedAt);
            // Format to YYYY-MM-DD
            const dateKey = getDateKey(parsedDate);
            if (!evidenceMap[dateKey]) evidenceMap[dateKey] = e;
        }
    });

    // Generate days array
    const days = Array.from({ length: duration }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = getDateKey(date);
        return {
            day: i + 1,
            date,
            evidence: evidenceMap[dateKey],
        };
    });

    // Fixed: Ensure totalPages is at least 1 even when days.length is 0
    const totalPages = Math.max(1, Math.ceil(days.length / ITEMS_PER_PAGE));
    const currentPageDays = days.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="w-full mx-auto p-4">
            <h2 className="text-xl font-bold mb-4 text-center">{t("ProofUploads.viewEvidence")}</h2>

            <div className="grid sm:grid-cols-6 gap-4 justify-center grid-cols-3">
                {currentPageDays.map((dayInfo, index) => {
                    const { date, evidence } = dayInfo;
                    const isUploaded = Boolean(evidence);
                    const isVideo = isUploaded && evidence.evidenceUrl?.includes(".mp4");
                    const isApproved = isUploaded && evidence.status === "APPROVED";

                    // Check if date is today or past
                    const isPast = date < today;
                    const dateLabel = date.toLocaleDateString(); // Use browser's locale
                    let bgClass = "bg-gray-300";
                    let symbol = null;

                    if (isUploaded) {
                        // Submitted
                        if (isApproved) {
                            // Submitted and approved
                            bgClass = "bg-green-300";
                            symbol = <FaCheck className="text-green-700" />;
                        } else {
                            // Submitted but not yet approved
                            bgClass = "bg-green-200";
                            symbol = null;
                        }
                    } else {
                        // Not submitted
                        if (isPast) {
                            // Past date (including today)
                            bgClass = "bg-red-200";
                            symbol = "❌";
                        } else {
                            // Future date
                            symbol = null;
                        }
                    }

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div className="font-medium">{dateLabel}</div>
                            <div
                                className={`w-24 sm:w-4/5 h-24 ${bgClass} flex items-center justify-center rounded-lg shadow-md cursor-pointer relative`}
                                onClick={() => isUploaded && setSelectedProof(evidence)}
                            >
                                {isUploaded ? (
                                    <>
                                        {isVideo ? (
                                            <video
                                                src={evidence.evidenceUrl}
                                                muted
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <img
                                                src={evidence.evidenceUrl}
                                                alt={`${t("ProofUploads.proofOn")} ${dateLabel}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        )}
                                        {isApproved && (
                                            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1">
                                                <FaCheck className="text-green-600" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-3xl text-gray-600">
                                        {symbol}
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-white">
                                {isUploaded ? t("ProofUploads.uploaded") : t("ProofUploads.noEvidence")}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Pagination controls */}
            <div className="mt-4 flex justify-center items-center space-x-4">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                    {t("ProofUploads.previous")}
                </button>
                <span className="text-sm font-semibold">
                    {t("ProofUploads.page")} {currentPage} / {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                    {t("ProofUploads.next")}
                </button>
            </div>

            {/* Modal */}
            {selectedProof && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setSelectedProof(null)}
                >
                    <div
                        className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedProof.evidenceUrl.includes(".mp4") ? (
                            <video
                                src={selectedProof.evidenceUrl}
                                controls
                                autoPlay
                                className="h-full rounded-lg"
                            />
                        ) : (
                            <img
                                src={selectedProof.evidenceUrl}
                                alt={t("ProofUploads.fullEvidence")}
                                className="w-full h-auto rounded-lg"
                            />
                        )}
                        <div className="text-right mt-2">
                            <button
                                onClick={() => setSelectedProof(null)}
                                className="text-blue-500 hover:underline"
                            >
                                {t("ProofUploads.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProofUploads;