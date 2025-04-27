import { useState, useEffect } from "react";
import { FaTimes, FaUserSlash, FaSearch, FaUserCheck, FaExclamationTriangle } from "react-icons/fa";
import Toggle from "./Toggle.jsx";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import {
    useGetChallengeMembersForManagementQuery,
    useKickMemberFromChallengeMutation,
    useToggleCoHostMutation
} from "../../../service/challengeService.js";

const DEFAULT_AVATAR = "/default-avatar.png";

const MemberManagementModal = ({ show, onClose, challengeId }) => {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(0);
    const [keyword, setKeyword] = useState("");
    const [confirmKick, setConfirmKick] = useState({ open: false, memberId: null, fullName: "" });

    const { data = { content: [], totalPages: 0 }, isLoading, refetch } = useGetChallengeMembersForManagementQuery({
        challengeId,
        keyword,
        page: currentPage,
        size: 10
    });

    const [kickMember] = useKickMemberFromChallengeMutation();
    const [toggleCoHost] = useToggleCoHostMutation();
    const members = data.content || [];

    useEffect(() => {
        if (show) document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "auto");
    }, [show]);

    const debouncedSearch = debounce((value) => {
        setCurrentPage(0);
        setKeyword(value);
    }, 500);

    const handleConfirmKick = (memberId, fullName) => {
        setConfirmKick({ open: true, memberId, fullName });
    };

    const handleKick = async () => {
        if (!confirmKick.memberId) return;
        try {
            const response = await kickMember({ challengeId, targetMemberId: confirmKick.memberId });
            console.log(response);
            toast(response?.error?.data || t("MemberManagement.kickSuccess")); // ✅ in đúng chuỗi từ backend nếu có
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || t("MemberManagement.kickFail"));
        } finally {
            setConfirmKick({ open: false, memberId: null, fullName: "" });
        }
    };


    const handleToggle = async (memberId) => {
        try {
            const response = await toggleCoHost({ challengeId, memberId });
            toast(response?.error?.data || t("MemberManagement.toggleSuccess")); // ✅ in đúng chuỗi từ backend nếu có
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || t("MemberManagement.toggleFail"));
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg w-full max-w-5xl p-6 shadow-lg relative animate-scaleIn">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">
                    <FaTimes size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4 text-center">{t("MemberManagement.title")}</h2>

                {/* Search Box */}
                <div className="flex items-center gap-2 mb-4">
                    <FaSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("MemberManagement.searchPlaceholder")}
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400"
                    />
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, idx) => (
                            <div key={idx} className="h-14 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b">
                            <th className="py-2">{t("MemberManagement.member")}</th>
                            <th>{t("MemberManagement.role")}</th>
                            <th>{t("MemberManagement.participate")}</th>
                            <th>{t("MemberManagement.coHost")}</th>
                            <th>{t("MemberManagement.actions")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {members.map((member) => (
                            <tr key={member.memberId} className="border-b hover:bg-gray-100">
                                <td className="flex items-center py-2 gap-3">
                                    <img
                                        src={member.avatar || DEFAULT_AVATAR}
                                        alt="avatar"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_AVATAR;
                                        }}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{member.fullName}</span>
                                            {member.isCurrentMember && (
                                                <span className="text-xs text-orange-500 font-semibold">
                                                    ({t("MemberManagement.me")})
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">{member.email}</p>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-bold ${
                                            member.role === "HOST"
                                                ? "bg-red-100 text-red-600"
                                                : member.role === "CO_HOST"
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        {member.role}
                                    </span>
                                </td>
                                <td className="text-center">
                                    {member.isParticipate ? (
                                        <FaUserCheck className="text-green-500" />
                                    ) : (
                                        <FaTimes className="text-gray-400" />
                                    )}
                                </td>
                                <td className="text-center">
                                    <Toggle
                                        isOn={member.role === "CO_HOST"}
                                        onToggle={() => handleToggle(member.memberId)}
                                        disabled={member.role === "HOST"}
                                    />
                                </td>
                                <td className="flex items-center gap-2 py-2">
                                    {member.role !== "HOST" && (
                                        <button
                                            onClick={() => handleConfirmKick(member.memberId, member.fullName)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaUserSlash />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                        {t("MemberManagement.prev")}
                    </button>
                    <span>{currentPage + 1}</span>
                    <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={data.last}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                        {t("MemberManagement.next")}
                    </button>
                </div>
            </div>

            {/* Confirm Kick Modal */}
            {confirmKick.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg animate-scaleIn max-w-md w-full">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <FaExclamationTriangle className="text-4xl text-red-500" />
                            <h3 className="text-lg font-bold">{t("MemberManagement.confirmKickTitle")}</h3>
                            <p className="text-gray-600">
                                {t("MemberManagement.confirmKickMessage", { name: confirmKick.fullName })}
                            </p>
                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => setConfirmKick({ open: false, memberId: null, fullName: "" })}
                                    className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
                                >
                                    {t("MemberManagement.cancel")}
                                </button>
                                <button
                                    onClick={handleKick}
                                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {t("MemberManagement.confirm")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberManagementModal;
