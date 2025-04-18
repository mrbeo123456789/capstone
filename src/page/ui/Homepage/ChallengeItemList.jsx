import React from "react";
import {
    FaBan,
    FaBriefcase,
    FaSpa,
    FaBook,
    FaRunning,
    FaTint,
    FaPaw,
} from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

const iconMap = {
    "Não beba álcool": <FaBan />,
    "Reunião de trabalho": <FaBriefcase />,
    "Meditar": <FaSpa />,
    "Ler um livro": <FaBook />,
    "Correr": <FaRunning />,
    "Beber água": <FaTint />,
    "Passear o cachorro": <FaPaw />,
};

const data = [
    {
        title: "Não beba álcool",
        type: "Hábito",
        time: null,
        quantity: null,
        completed: true,
    },
    {
        title: "Reunião de trabalho",
        type: "Tarefa",
        time: "10:00",
        quantity: null,
        completed: true,
    },
    {
        title: "Meditar",
        type: "Hábito",
        time: "13:00",
        quantity: "15:00",
        completed: false,
    },
    {
        title: "Ler um livro",
        type: "Hábito",
        completed: false,
    },
    {
        title: "Correr",
        type: "Hábito",
        time: "22:30",
        quantity: "3 quilômetros",
        completed: true,
    },
    {
        title: "Beber água",
        type: "Hábito",
        quantity: "7 copos",
        completed: false,
    },
    {
        title: "Passear o cachorro",
        type: "Tarefa",
        time: "20:00",
        completed: true,
    },
];

const getTypeColor = (type) => {
    return type === "Hábito" ? "text-cyan-500" : "text-pink-500";
};

const ChallengeItemList = () => {
    return (
        <div className="w-full max-w-md mx-auto space-y-3 mt-6">
            {data.map((item, idx) => (
                <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3"
                >
                    {/* Left section: Icon */}
                    <div className="flex items-center space-x-4">
                        <div className="bg-gray-100 text-xl p-3 rounded-full text-white"
                             style={{
                                 backgroundColor:
                                     item.type === "Hábito" ? "#7756d6" : "#ef5da8",
                             }}
                        >
                            {iconMap[item.title] || <FaBook />}
                        </div>
                        {/* Title & Meta */}
                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                            <div className="text-xs text-gray-500 flex flex-wrap gap-x-2">
                                {item.quantity && (
                                    <span>{item.quantity}</span>
                                )}
                                {item.time && (
                                    <span className="text-gray-400">⏰ {item.time}</span>
                                )}
                                <span className={getTypeColor(item.type)}>
                                    {item.type}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right section: Status */}
                    {item.completed ? (
                        <div className="text-green-500 text-xl">✔️</div>
                    ) : (
                        <div className="text-gray-400 text-xl">
                            <BsThreeDots />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ChallengeItemList;
