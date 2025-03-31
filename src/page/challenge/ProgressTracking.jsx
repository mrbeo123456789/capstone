import { useEffect, useState } from "react";
import MediaUpload from "../ui/MediaUpload.jsx";

const LOCAL_STORAGE_KEY = "markedDays";

export default function ProgressTracking() {
    const [markedDays, setMarkedDays] = useState({});
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);



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
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startDayOfWeek = startDate.getDay();

        const totalDays = startDayOfWeek + endDate.getDate();
        const totalCells = Math.ceil(totalDays / 7) * 7;

        const days = [];

        for (let i = 0; i < totalCells; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() - startDayOfWeek + i);
            days.push(date);
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

    const startDate = new Date(2025, 3, 1); // April = 3 (0-based index)
    const endDate = new Date(2025, 3, 17);

    const isWithinChallenge = (date) => {
        return date >= startDate && date <= endDate;
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
                    const dateStr = date.toISOString().split("T")[0];
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isMarked = markedDays[dateStr];
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isWithinChallenge = date >= startDate && date <= endDate;

                    return (
                        <div
                            key={idx}
                            className={`relative h-10 flex items-center justify-center rounded transition-all
                                            ${isCurrentMonth ? "cursor-pointer hover:bg-gray-400 text-gray-800" : "text-gray-400 opacity-50"}
                                            ${isMarked ? "bg-red-100" : isWithinChallenge ? "bg-gray-200" : ""}
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
                            {isMarked && (
                                <img
                                    src="https://darebee.com/images/content/x.png"
                                    alt="X"
                                    className="absolute w-4 h-4"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {showModal && (
                <MediaUpload
                    date={selectedDate}
                    onClose={() => setShowModal(false)}
                    onSubmit={(date, file) => {
                        console.log("Submit evidence for:", date);
                        console.log("File:", file);

                        // Later: handle upload logic here

                        setShowModal(false);
                    }}
                />
            )}

        </div>
    );
}
