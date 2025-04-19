import { useEffect, useState } from "react";
import MediaUpload from "../ui/MediaUpload.jsx";
import {toast} from "react-toastify";


export default function ProgressTracking({ challenge, evidence }) {
    const submittedEvidenceDates = new Set(
        evidence?.map((e) => {
            const date = new Date(e.submittedAt);
            const localDateStr = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, '0');
            return localDateStr;
        })
    );

    const today = new Date();
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
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isWithinChallenge = normalizeDate(date) >= normalizeDate(startDate) &&
                        normalizeDate(date) <= normalizeDate(endDate);
                    const hasEvidence = submittedEvidenceDates.has(dateStr);
                    const isPast = date < today && isWithinChallenge;
                    const showRedX = isPast && !hasEvidence;
                    return (
                        <div
                            key={idx}
                            className={`relative h-10 flex items-center justify-center rounded transition-all
                                            ${isCurrentMonth ? "cursor-pointer hover:bg-gray-400 text-gray-800" : "text-gray-400 opacity-70"}
                                            ${hasEvidence ? "bg-green-200"
                                : showRedX ? "bg-red-200"
                                    : isWithinChallenge ? "bg-gray-300"
                                        : ""}
                                            ${isToday ? "border border-blue-500" : ""}
                                        `}
                            onClick={() => {
                                if (isCurrentMonth) {
                                    const clickedDate = new Date(date);
                                    const todayDate = new Date();
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
                                        toast.error("That day is not the day to upload evidence.", {
                                            position: "top-right",
                                            autoClose: 2500,
                                        });
                                    }
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
