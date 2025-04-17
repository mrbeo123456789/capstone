import React, { useRef, useState, useEffect } from "react";
import dayjs from "dayjs";
import ChallengeItemList from "./ChallengeItemList.jsx";

const DaySlider = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const dayRefs = useRef({}); // store refs for each day

    const generateDays = () => {
        const days = [];
        for (let i = -5; i <= 5; i++) {
            days.push(selectedDate.add(i, "day"));
        }
        return days;
    };

    const scrollToCenter = (dateKey) => {
        const el = dayRefs.current[dateKey];
        if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
    };

    const handleNext = () => {
        const next = selectedDate.add(1, "day");
        setSelectedDate(next);
        scrollToCenter(next.format("YYYY-MM-DD"));
    };

    const handlePrev = () => {
        const prev = selectedDate.subtract(1, "day");
        setSelectedDate(prev);
        scrollToCenter(prev.format("YYYY-MM-DD"));
    };

    const handleSelect = (date) => {
        setSelectedDate(date);
        scrollToCenter(date.format("YYYY-MM-DD"));
    };

    const days = generateDays();

    // Initial scroll to center on mount
    useEffect(() => {
        scrollToCenter(selectedDate.format("YYYY-MM-DD"));
    }, []);

    return (
        <div className="bg-white p-4 rounded-3xl shadow-lg w-full text-center">
            {/* Header */}
            <div className="flex justify-between px-4 mb-4">
                <h2 className="text-xl font-semibold">Hoje</h2>
                <div className="space-x-4 text-xl">
                    <button>🔍</button>
                    <button>☰</button>
                    <button>📅</button>
                    <button>❓</button>
                </div>
            </div>

            {/* Day Picker */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={handlePrev}
                    className="text-lg px-2 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                    ←
                </button>

                <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory w-[90%]">
                    {days.map((day, idx) => {
                        const key = day.format("YYYY-MM-DD");
                        const isSelected = day.isSame(selectedDate, "day");

                        return (
                            <div
                                key={key}
                                ref={(el) => (dayRefs.current[key] = el)}
                                onClick={() => handleSelect(day)}
                                className={`flex-shrink-0 snap-center cursor-pointer text-center px-3 py-2 rounded-xl mx-1 transition-all duration-300 ${
                                    isSelected
                                        ? "bg-rose-500 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                <div className="text-xs font-medium">
                                    {day.format("ddd")}
                                </div>
                                <div className="text-sm font-bold">
                                    {day.format("D")}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handleNext}
                    className="text-lg px-2 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                    →
                </button>

            </div>
            <div className="md:col-span-1 lg:col-span-2 overflow-y-scroll">
                <ChallengeItemList/>
            </div>
        </div>
    );
};

export default DaySlider;
