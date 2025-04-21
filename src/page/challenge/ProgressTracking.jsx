import { useEffect, useState } from "react";
import MediaUpload from "../ui/MediaUpload.jsx";
import { toast } from "react-toastify";
import { FaPlus, FaCheck } from "react-icons/fa";

export default function ProgressTracking({ challenge, evidence }) {
    // Tạo map để lưu trữ bằng chứng theo ngày và trạng thái
    const evidenceMap = {};
    evidence?.forEach((e) => {
        // Sử dụng format ISO chuẩn để đảm bảo tính nhất quán với ProofUploads
        const date = new Date(e.submittedAt);
        const dateISO = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        evidenceMap[dateISO] = {
            evidence: e,
            status: e.status // Lấy trạng thái của bằng chứng (approved hoặc pending)
        };
    });

    // Debug để xem dữ liệu evidence và ngày hiện tại
    console.log("Evidence data:", evidence);
    console.log("Evidence map:", evidenceMap);

    // Lấy ngày hiện tại và đặt về đầu ngày
    const today = new Date();
    console.log("Before setting time - Today:", today.toLocaleString());
    today.setHours(0, 0, 0, 0); // Loại bỏ phần thời gian
    console.log("After setting time - Today:", today.toLocaleString());

    const challengeId = challenge?.id;
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

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
        // Chuyển đổi date thành chuỗi YYYY-MM-DD trong múi giờ cục bộ
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Tạo chuỗi ISO date trong múi giờ cục bộ cho today
    const todayLocalISO = getLocalISODate(today);
    console.log("Today local ISO:", todayLocalISO);

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button onClick={goPrevMonth} className="text-gray-700 hover:text-black text-3xl">&lt;</button>
                <div className="text-lg font-semibold">{monthName} {year}</div>
                <button onClick={goNextMonth} className="text-gray-700 hover:text-black text-3xl">&gt;</button>
            </div>

            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {calendarDays.map((date, idx) => {
                    // Sử dụng format local ISO để tránh vấn đề múi giờ
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

                    // Xác định màu nền và biểu tượng theo quy tắc
                    let bgColor = "";
                    let icon = null;

                    if (hasEvidence) {
                        // Đã nộp
                        if (isApproved) {
                            // Đã nộp và đã được chấm APPROVED
                            bgColor = "bg-green-200";
                            icon = <span className="absolute top-0 right-1 text-green-700 text-lg font-bold"><FaCheck /></span>;
                        } else if (isRejected) {
                            // Đã nộp nhưng bị REJECTED
                            bgColor = "bg-yellow-200";
                            icon = <span className="absolute top-0 right-1 text-red-600 text-lg font-bold">✕</span>;
                        } else {
                            // Đã nộp nhưng chưa được chấm (pending)
                            bgColor = "bg-green-200";
                        }
                    } else if (isWithinChallenge) {
                        // Chưa nộp
                        if (isPast) {
                            // Ngày trong quá khứ chưa nộp
                            bgColor = "bg-red-200";
                            icon = <span className="absolute top-0 right-1 text-red-600 text-lg font-bold">✕</span>;
                        } else if (isToday) {
                            // Ngày hôm nay chưa nộp
                            bgColor = "bg-orange-300";
                            icon = <span className="absolute top-0 right-1 text-orange-700 text-lg font-bold"><FaPlus /></span>;
                        } else {
                            // Ngày trong tương lai
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
                                        // Xác định thông báo lỗi dựa vào thời gian
                                        if (normalizeDate(clickedDate) < normalizeDate(todayDate)) {
                                            toast.error("Đã hết hạn nộp cho ngày đó", {
                                                position: "top-right",
                                                autoClose: 2500,
                                            });
                                        } else if (normalizeDate(clickedDate) > normalizeDate(todayDate)) {
                                            toast.error("Chưa đến ngày nộp bằng chứng", {
                                                position: "top-right",
                                                autoClose: 2500,
                                            });
                                        } else {
                                            toast.error("Không thể nộp bằng chứng cho ngày này", {
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
        </div>
    );
}