import { useEffect, useState } from "react";
import MediaUpload from "../ui/MediaUpload.jsx";
import { toast } from "react-toastify";
import { FaPlus, FaCheck, FaQuestionCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function ProgressTracking({ challenge, evidence }) {
    // Create map to store evidence by date and status
    const evidenceMap = {};
    const { t } = useTranslation();

    evidence?.forEach((e) => {
        // Use standard ISO format to ensure consistency with ProofUploads
        const date = new Date(e.submittedAt);
        const dateISO = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        evidenceMap[dateISO] = {
            evidence: e,
            status: e.status // Get evidence status (approved or pending)
        };
    });

    // Debug to view evidence data and current date
    console.log("Evidence data:", evidence);
    console.log("Evidence map:", evidenceMap);

    // Get current date and set to start of day
    const today = new Date();
    console.log("Before setting time - Today:", today.toLocaleString());
    today.setHours(0, 0, 0, 0); // Remove time portion
    console.log("After setting time - Today:", today.toLocaleString());

    const challengeId = challenge?.id;
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const isValidDate = (d) => d instanceof Date && !isNaN(d);

    const startDate = isValidDate(new Date(challenge?.startDate)) ? new Date(challenge.startDate) : null;
    const endDate = isValidDate(new Date(challenge?.endDate)) ? new Date(challenge.endDate) : null;

    const getCalendarGrid = () => {
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday

        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;

        const days = [];

        for (let i = 0; i < totalCells; i++) {
            const day = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                i - startDayOfWeek + 1
            );
            days.push(day);
        }
        return days;
    };

    const calendarDays = getCalendarGrid();
    const monthName = currentMonth.toLocaleString("default", { month: "long" });
    const year = currentMonth.getFullYear();

    const goPrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const normalizeDate = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const getLocalISODate = (date) => {
        // Convert date to YYYY-MM-DD string in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Create local ISO date string for today
    const todayLocalISO = getLocalISODate(today);
    console.log("Today local ISO:", todayLocalISO);

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button onClick={goPrevMonth} className="text-gray-700 hover:text-black text-3xl">&lt;</button>
                <div className="flex items-center">
                    <div className="text-lg font-semibold">{monthName} {year}</div>
                    <button
                        onClick={() => setShowHelpModal(true)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                        title={t("ProgressTracking.viewExplanation")}
                    >
                        <FaQuestionCircle />
                    </button>
                </div>
                <button onClick={goNextMonth} className="text-gray-700 hover:text-black text-3xl">&gt;</button>
            </div>

            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 mb-2">
                {[
                    t("ProgressTracking.daysOfWeek.sun"),
                    t("ProgressTracking.daysOfWeek.mon"),
                    t("ProgressTracking.daysOfWeek.tue"),
                    t("ProgressTracking.daysOfWeek.wed"),
                    t("ProgressTracking.daysOfWeek.thu"),
                    t("ProgressTracking.daysOfWeek.fri"),
                    t("ProgressTracking.daysOfWeek.sat")
                ].map(day => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {calendarDays.map((date, idx) => {
                    // Use local ISO format to avoid timezone issues
                    const dateLocalISO = getLocalISODate(date);

                    const isToday = dateLocalISO === todayLocalISO;
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isWithinChallenge = normalizeDate(date) >= normalizeDate(startDate) &&
                        normalizeDate(date) <= normalizeDate(endDate);

                    const evidenceInfo = evidenceMap[dateLocalISO];
                    const hasEvidence = Boolean(evidenceInfo);
                    const isApproved = hasEvidence && (evidenceInfo.status === "APPROVED" || evidenceInfo.evidence.status === "APPROVED");
                    const isRejected = hasEvidence && (evidenceInfo.status === "REJECTED" || evidenceInfo.evidence.status === "REJECTED");

                    const isPast = normalizeDate(date) < normalizeDate(today) && isWithinChallenge;

                    // Determine background color and icon according to rules
                    let bgColor = "";
                    let icon = null;

                    if (hasEvidence) {
                        // Submitted
                        if (isApproved) {
                            // Submitted and APPROVED
                            bgColor = "bg-green-200";
                            icon = <span className="absolute top-0 right-1 text-green-700 text-lg font-bold"><FaCheck /></span>;
                        } else if (isRejected) {
                            // Submitted but REJECTED
                            bgColor = "bg-yellow-200";
                            icon = <span className="absolute top-0 right-1 text-red-600 text-lg font-bold">✕</span>;
                        } else {
                            // Submitted but pending
                            bgColor = "bg-green-200";
                        }
                    } else if (isWithinChallenge) {
                        // Not submitted
                        if (isPast) {
                            // Past date not submitted
                            bgColor = "bg-red-200";
                            icon = <span className="absolute top-0 right-1 text-red-600 text-lg font-bold">✕</span>;
                        } else if (isToday) {
                            // Today not submitted
                            bgColor = "bg-orange-300";
                            icon = <span className="absolute top-0 right-1 text-orange-700 text-lg font-bold"><FaPlus /></span>;
                        } else {
                            // Future date
                            bgColor = "bg-gray-300";
                        }
                    }

                    return (
                        <div
                            key={idx}
                            className={`relative h-10 flex items-center justify-center rounded transition-all
                                ${isCurrentMonth ? "cursor-pointer hover:bg-gray-400 text-gray-800" : "text-gray-400 opacity-70"}
                                ${bgColor}
                                ${isToday && !hasEvidence ? "border-2 border-orange-500" : ""}
                            `}
                            onClick={() => {
                                if (isCurrentMonth) {
                                    const clickedDate = new Date(date);
                                    const todayDate = new Date();
                                    todayDate.setHours(0, 0, 0, 0);

                                    const isSameDate =
                                        clickedDate.getFullYear() === todayDate.getFullYear() &&
                                        clickedDate.getMonth() === todayDate.getMonth() &&
                                        clickedDate.getDate() === todayDate.getDate();

                                    const isInChallengeRange =
                                        normalizeDate(todayDate) >= normalizeDate(startDate) &&
                                        normalizeDate(todayDate) <= normalizeDate(endDate);

                                    if (isSameDate && isInChallengeRange) {
                                        setSelectedDate(date);
                                        setShowModal(true);
                                    } else {
                                        // Determine error message based on time
                                        if (normalizeDate(clickedDate) < normalizeDate(todayDate)) {
                                            toast.error(t("ProgressTracking.errors.pastDeadline"), {
                                                position: "top-right",
                                                autoClose: 2500,
                                            });
                                        } else if (normalizeDate(clickedDate) > normalizeDate(todayDate)) {
                                            toast.error(t("ProgressTracking.errors.futureDate"), {
                                                position: "top-right",
                                                autoClose: 2500,
                                            });
                                        } else {
                                            toast.error(t("ProgressTracking.errors.cannotSubmit"), {
                                                position: "top-right",
                                                autoClose: 2500,
                                            });
                                        }
                                    }
                                }
                            }}
                        >
                            {date.getDate()}
                            {icon}
                        </div>
                    );
                })}
            </div>
            {showModal && (
                <MediaUpload
                    date={selectedDate}
                    challengeId={challengeId}
                    onClose={() => setShowModal(false)}
                />
            )}

            {/* Status Explanation Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
                        <h3 className="text-xl font-bold mb-4">{t("ProgressTracking.modal.title")}</h3>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-200 rounded-md flex items-center justify-center mr-3 relative">
                                    <span className="absolute top-0 right-1 text-green-700 text-lg"><FaCheck /></span>
                                </div>
                                <div>
                                    <p className="font-medium">{t("ProgressTracking.modal.approved.title")}</p>
                                    <p className="text-sm text-gray-600">{t("ProgressTracking.modal.approved.description")}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-200 rounded-md flex items-center justify-center mr-3"></div>
                                <div>
                                    <p className="font-medium">{t("ProgressTracking.modal.pending.title")}</p>
                                    <p className="text-sm text-gray-600">{t("ProgressTracking.modal.pending.description")}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-yellow-200 rounded-md flex items-center justify-center mr-3 relative">
                                    <span className="absolute top-0 right-1 text-red-600 text-lg font-bold">✕</span>
                                </div>
                                <div>
                                    <p className="font-medium">{t("ProgressTracking.modal.rejected.title")}</p>
                                    <p className="text-sm text-gray-600">{t("ProgressTracking.modal.rejected.description")}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-red-200 rounded-md flex items-center justify-center mr-3 relative">
                                    <span className="absolute top-0 right-1 text-red-600 text-lg font-bold">✕</span>
                                </div>
                                <div>
                                    <p className="font-medium">{t("ProgressTracking.modal.missed.title")}</p>
                                    <p className="text-sm text-gray-600">{t("ProgressTracking.modal.missed.description")}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-300 rounded-md flex items-center justify-center mr-3 relative">
                                    <span className="absolute top-0 right-1 text-orange-700 text-lg"><FaPlus /></span>
                                </div>
                                <div>
                                    <p className="font-medium">{t("ProgressTracking.modal.today.title")}</p>
                                    <p className="text-sm text-gray-600">{t("ProgressTracking.modal.today.description")}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-md flex items-center justify-center mr-3"></div>
                                <div>
                                    <p className="font-medium">{t("ProgressTracking.modal.future.title")}</p>
                                    <p className="text-sm text-gray-600">{t("ProgressTracking.modal.future.description")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {t("ProgressTracking.modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}