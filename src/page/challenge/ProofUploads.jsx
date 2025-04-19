import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const ITEMS_PER_PAGE = 12;

const ProofUploads = ({ challenge, evidence }) => {
    if (!challenge || !evidence) return <p>Đang tải dữ liệu...</p>;
    const [selectedProof, setSelectedProof] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // ✅ correct
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);

    const duration = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const evidenceMap = {};
    evidence.forEach((e) => {
        const parsedDate = new Date(e.submittedAt);
        if (!isNaN(parsedDate)) {
            const dateKey = new Date(e.submittedAt).toDateString(); // ✅ Properly parse ISO string
            if (!evidenceMap[dateKey]) evidenceMap[dateKey] = e;
        }
    });


    const days = Array.from({ length: duration }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return {
            day: i + 1,
            date,
            evidence: evidenceMap[date.toDateString()],
        };
    });

    const totalPages = Math.ceil(days.length / ITEMS_PER_PAGE);
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
        <div className="mt-6 w-full mx-auto p-4">
            <h2 className="text-xl font-bold mb-4 text-center">View your proof activity</h2>

            <div className="grid sm:grid-cols-6 gap-4 justify-center grid-cols-3">
                {currentPageDays.map((dayInfo, index) => {
                    const { date, evidence } = dayInfo;
                    const isUploaded = Boolean(evidence);
                    const isVideo = isUploaded && evidence.evidenceUrl?.includes(".mp4");
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // remove time portion
                    const isToday = date.toDateString() === today.toDateString();
                    const isPast = date < today;
                    const dateLabel = date.toLocaleDateString("en-GB"); // format: dd/mm/yyyy
                    let borderClass = "";
                    let bgClass = "bg-gray-300";
                    let symbol = null;

                    if (!isUploaded) {
                        if (isPast) {
                            bgClass = "bg-red-200";
                            symbol = "❌";
                        } else if (isToday) {
                            borderClass = "border-2 border-green-500";
                        }
                    }

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div className="font-medium">{dateLabel}</div>
                            <div
                                className={`w-24 sm:w-4/5 h-24 ${bgClass} flex items-center justify-center rounded-lg shadow-md cursor-pointer ${borderClass}`}
                                onClick={() => isUploaded && setSelectedProof(evidence)}
                            >
                                {isUploaded ? (
                                    isVideo ? (
                                        <video
                                            src={evidence.evidenceUrl}
                                            muted
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <img
                                            src={evidence.evidenceUrl}
                                            alt={`Proof on ${dateLabel}`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    )
                                ) : (
                                    <span className="text-3xl text-gray-600">
                        {symbol ?? <FaPlus />}
                    </span>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-gray-700">
                                {isUploaded ? "Uploaded" : "No proof this day"}
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
                    Previous
                </button>
                <span className="text-sm font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Modal */}
            {selectedProof && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setSelectedProof(null)}
                >
                    <div
                        className="bg-white p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedProof.evidenceUrl.includes(".mp4") ? (
                            <video
                                src={selectedProof.evidenceUrl}
                                controls
                                autoPlay
                                className="w-full h-auto rounded-lg"
                            />
                        ) : (
                            <img
                                src={selectedProof.evidenceUrl}
                                alt="Full Evidence"
                                className="w-full h-auto rounded-lg"
                            />
                        )}
                        <div className="text-right mt-2">
                            <button
                                onClick={() => setSelectedProof(null)}
                                className="text-blue-500 hover:underline"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProofUploads;
