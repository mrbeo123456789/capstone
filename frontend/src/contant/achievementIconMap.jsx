import {
    FaTrophy, FaStar, FaRocket,  FaClock,
    FaCrown, FaChartLine,  FaPen, FaMoon
} from "react-icons/fa";

export const achievementIconMap = {
    FIRST_TRY: <FaRocket className="text-5xl text-red-500" />,
    PROFILE_MASTER: <FaChartLine className="text-5xl text-blue-500" />,

    ACTIVE_VOTER: <FaPen className="text-5xl text-purple-500" />,
    CONTRIBUTOR: <FaTrophy className="text-5xl text-orange-500" />,
    RISING_STAR: <FaStar className="text-5xl text-yellow-400" />,

    STREAK_MASTER: <FaClock className="text-5xl text-blue-700" />,
    NIGHT_OWL: <FaMoon className="text-5xl text-indigo-600" />,

    FITNESS_CHAMPION: <FaTrophy className="text-5xl text-green-600" />,
    GROUP_LEGEND: <FaCrown className="text-5xl text-yellow-600" />,
};
