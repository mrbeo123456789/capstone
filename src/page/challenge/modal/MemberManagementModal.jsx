import { useEffect, useState } from "react";
import {
    FaRegStar, FaStar, FaStarHalfAlt, FaTimes, FaUserSlash
} from "react-icons/fa";
import Toggle from "./Toggle.jsx";
import { toast } from "react-toastify";
import { useGetChallengeStarLeaderboardQuery } from "../../../service/rankingService.js";
import {
    useKickMemberFromChallengeMutation,
    useToggleCoHostMutation
} from "../../../service/challengeService.js";

const DEFAULT_AVATAR = "/default-avatar.png";

const MemberManagementModal = ({ show, onClose, challengeId }) => {
    const [currentPage, setCurrentPage] = useState(0);

    const {
        data: starData = { content: [], totalPages: 0 },
        isLoading,
        refetch, // <-- dùng refetch để làm mới dữ liệu
    } = useGetChallengeStarLeaderboardQuery({ challengeId, page: currentPage, size: 10 });

    const [kickMember] = useKickMemberFromChallengeMutation();
    const [toggleCoHost] = useToggleCoHostMutation();

    const members = starData.content || [];

    useEffect(() => {
        if (show) document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "auto");
    }, [show]);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) stars.push(<FaStar key={i} className="text-yellow-400" />);
            else if (i - 0.5 === rating) stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
            else stars.push(<FaRegStar key={i} className="text-gray-300" />);
        }
        return stars;
    };

    const handleKick = async (memberId) => {
        const response = await kickMember({ challengeId, targetMemberId: memberId });

        if ("data" in response) {
            toast.success(response.data); // ✅ plain string from backend
            refetch(); // refresh the member list
        } else if ("error" in response) {
            toast.error(response.error?.data?.message || "Failed to remove member.");
        }
    };

    const handleToggle = async (memberId) => {
        const response = await toggleCoHost({ challengeId, memberId });

        if ("data" in response) {
            toast.success(response.data); // plain success string
            refetch();
        } else if ("error" in response) {
            toast.error(response.error?.data?.message || "Failed to update role.");
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg w-full max-w-4xl p-6 shadow-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">
                    <FaTimes />
                </button>

                <h2 className="text-xl font-bold mb-4">Member Management</h2>

                {isLoading ? (
                    <p className="text-center py-4">Loading members...</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b">
                            <th className="py-2">Member</th>
                            <th>Stars</th>
                            <th>Co-host</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {members.map((member) => (
                            <tr key={member.memberId} className="border-b hover:bg-gray-100">
                                <td className="py-2 flex items-center space-x-2">
                                    <img
                                        src={member.avatar || DEFAULT_AVATAR}
                                        alt="avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_AVATAR;
                                        }}
                                    />
                                    <span>{member.memberName}</span>
                                </td>
                                <td>
                                    <div className="flex space-x-1">
                                        {renderStars(member.averageStar || 0)}
                                    </div>
                                </td>
                                <td>
                                    <Toggle
                                        checked={member.role === "CO_HOST"}
                                        onChange={() => handleToggle(member.memberId)}
                                    />
                                </td>
                                <td className="flex items-center gap-3 py-2">
                                    <button
                                        onClick={() => handleKick(member.memberId)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaUserSlash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MemberManagementModal;
