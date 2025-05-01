// src/constants/achievementIconMap.js
import {
    FaTrophy, FaMountain, FaBullseye, FaStar, FaRocket, FaFire, FaClock,
    FaMedal, FaChess, FaGem, FaLightbulb, FaAward, FaCrown,
    FaChartLine, FaGlobe, FaBrain, FaPuzzlePiece, FaEye, FaUserPlus,
    FaSun, FaMoon, FaRoad, FaArrowUp, FaPen, FaUsers
} from "react-icons/fa";

export const achievementIconMap = {
    FIRST_TRY: <FaRocket className="text-5xl text-red-500" />,
    DAILY_WARRIOR: <FaFire className="text-5xl text-orange-500" />,
    PROFILE_MASTER: <FaLightbulb className="text-5xl text-yellow-400" />,
    INVITER: <FaUserPlus className="text-5xl text-blue-500" />,
    REVIEWER: <FaEye className="text-5xl text-teal-500" />,
    PERFECT_ACCURACY: <FaBullseye className="text-5xl text-indigo-500" />,
    COMEBACK_SUBMITTER: <FaArrowUp className="text-5xl text-gray-500" />,
    RISING_STAR: <FaStar className="text-5xl text-yellow-500" />,
    ACTIVE_VOTER: <FaPen className="text-5xl text-purple-500" />,
    GROUP_HERO: <FaUsers className="text-5xl text-green-500" />,
    CONTRIBUTOR: <FaTrophy className="text-5xl text-blue-400" />,
    STREAK_TRIPLE: <FaChess className="text-5xl text-gray-700" />,
    STREAK_MASTER: <FaClock className="text-5xl text-blue-700" />,
    NIGHT_OWL: <FaMoon className="text-5xl text-indigo-600" />,
    EARLY_BIRD: <FaSun className="text-5xl text-yellow-400" />,
    LONG_HAUL: <FaRoad className="text-5xl text-stone-600" />,
    FITNESS_CHAMPION: <FaTrophy className="text-5xl text-green-500" />,
    GROUP_LEGEND: <FaCrown className="text-5xl text-yellow-600" />,
    CONSISTENT_TOPPER: <FaMedal className="text-5xl text-pink-500" />,
    UNDERDOG: <FaArrowUp className="text-5xl text-red-400" />,
};
