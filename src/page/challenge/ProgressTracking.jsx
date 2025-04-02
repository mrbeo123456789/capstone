import { useEffect, useState } from "react";
import MediaUpload from "../ui/MediaUpload.jsx";
import toast from "react-hot-toast";

const LOCAL_STORAGE_KEY = "markedDays";

export default function ProgressTracking({ challenge, evidence }) {
    const [markedDays, setMarkedDays] = useState({});
    const submittedEvidenceDates = new Set(
        evidence?.map((e) => {
            const [year, month, day] = e.submittedAt;
            console.log("Hello" + `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
            return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        })
    );

    const today = new Date();
    const challengeId = challenge?.id;
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

// Convert startDate & endDate from [YYYY, MM, DD] to Date objects
    const startDate = challenge?.startDate
        ? new Date(challenge.startDate[0], challenge.startDate[1] - 1, challenge.startDate[2])
        : null;

    const endDate = challenge?.endDate
        ? new Date(challenge.endDate[0], challenge.endDate[1] - 1, challenge.endDate[2])
        : null;

    // Load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) setMarkedDays(JSON.parse(stored));
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(markedDays));
    }, [markedDays]);

    const toggleDay = (dateStr) => {
        const updated = { ...markedDays, [dateStr]: !markedDays[dateStr] };
        setMarkedDays(updated);
    };

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

    const isWithinChallenge = (date) => {
        return startDate && endDate && date >= startDate && date <= endDate;
    };

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
                    const dateStr = date.toLocaleDateString("sv-SE"); // ✅ returns "YYYY-MM-DD"
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isMarked = markedDays[dateStr];
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isWithinChallenge = date >= startDate && date <= endDate;
                    const hasEvidence = submittedEvidenceDates.has(dateStr);
                    const isPast = date < today && isWithinChallenge;
                    const showRedX = isPast && !hasEvidence;
                    return (
                        <div
                            key={idx}
                            className={`relative h-10 flex items-center justify-center rounded transition-all
                                            ${isCurrentMonth ? "cursor-pointer hover:bg-gray-400 text-gray-800" : "text-gray-400 opacity-50"}
                                            ${hasEvidence ? "bg-green-200"
                                : showRedX ? "bg-red-200"
                                    : isWithinChallenge ? "bg-gray-200"
                                        : ""}
                                            ${isToday ? "border border-blue-500" : ""}
                                        `}
                            onClick={() => {
                                if (isCurrentMonth) {
                                    setSelectedDate(date);
                                    setShowModal(true);
                                }
                            }}
                        >
                            {date.getDate()}
                            {hasEvidence ? (
                                <span className="absolute top-0 right-1 text-green-700 text-lg font-bold">✓</span>
                            ) : showRedX ? (
                                <span className="absolute top-0 right-1 text-red-600 text-lg font-bold">✕</span>
                            ) : null}


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
