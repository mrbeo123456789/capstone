import { useState } from "react";
import { IoCloseCircle, IoSearch, IoPersonAdd } from "react-icons/io5";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useGetAvailableGroupsQuery } from "../../../service/groupService.js";
import { useGetMaxMembersPerGroupQuery } from "../../../service/challengeService.js";
import {useRespondInvitationMutation} from "../../../service/invitationService.js";
import { useJoinGroupToChallengeMutation } from "../../../service/challengeService.js";
import {useNavigate} from "react-router-dom";

const JoinedGroup = ({ onClose, invitation }) => {
    const { t } = useTranslation();
    const PAGE_SIZE = 5;
    const navigate = useNavigate(); // tạo biến nếu chưa có


    const { challengeId, invitationId } = invitation; // ✅ Lấy challengeId từ invitation truyền vào
    const [respondInvitation] = useRespondInvitationMutation(); // ✅ thêm mutation gửi accept
    const [joinGroupToChallenge] = useJoinGroupToChallengeMutation();
    const { data: availableGroups = [], isLoading, isError } = useGetAvailableGroupsQuery();
    const { data: maxMembers } = useGetMaxMembersPerGroupQuery(challengeId);

    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [inputSearchTerm, setInputSearchTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredGroups = availableGroups.filter((group) =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredGroups.length / PAGE_SIZE);
    const paginatedGroups = filteredGroups.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleSearch = () => {
        setSearchTerm(inputSearchTerm.trim());
        setCurrentPage(1);
    };

    const handleSelectGroup = (groupId) => {
        setSelectedGroupId(groupId);
    };

    const handleAccept = async () => {
        if (!selectedGroupId) {
            toast.warn(t("challengeInvite.selectWarning"));
            return;
        }

        try {
            if (invitation.invitationId === -1) {
                // 👉 Người dùng tự tham gia thử thách nhóm
                await joinGroupToChallenge({ groupId: selectedGroupId, challengeId: invitation.challengeId }).unwrap();
                toast.success(t("challengeInvite.successJoinGroupChallenge"));
                navigate("/challenges/joins"); // ✅ Chuyển hướng đến trang danh sách đã tham gia
            } else {
                // 👉 Người dùng accept lời mời nhóm
                await respondInvitation({
                    invitationId: invitation.invitationId,
                    invitationType: invitation.invitationType,
                    accept: true,
                    groupId: selectedGroupId,
                });
                toast.success(t("challengeInvite.success"));
                window.location.reload(); // ✅ Reload lại trang để cập nhật UI
            }

            onClose();
        } catch (error) {
            const message = error?.data?.message;

            if (message?.startsWith("MEMBER_ALREADY_JOINED:")) {
                const name = message.split(":")[1];
                toast.error(t("challengeInvite.memberAlreadyJoined", { name }));
            } else {
                toast.error(t("challengeInvite.inviteFailed"));
            }
        }
    };

    if (isLoading) return <div className="p-6">{t("challengeInvite.loading")}</div>;
    if (isError) return <div className="p-6 text-red-500">{t("challengeInvite.loadError")}</div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {t("challengeInvite.selectGroup")} {/* ví dụ: "Chọn nhóm tham gia" */}
                    </h2>

                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <IoCloseCircle className="text-2xl"/>
                    </button>
                </div>

                {/* Search & List Content */}
                <div className="p-6 space-y-6">
                {/* Search Bar */}
                    <div className="flex gap-2">
                        <div className="flex items-center border border-gray-300 rounded-md w-full px-3">
                            <IoSearch className="text-gray-500 mr-2" />
                            <input
                                type="text"
                                value={inputSearchTerm}
                                onChange={(e) => setInputSearchTerm(e.target.value)}
                                placeholder={t("searchPlaceholderGroup")}
                                className="w-full outline-none"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-orange-500 text-white px-4 rounded hover:bg-orange-600 transition"
                        >
                            {t("challengeInvite.search")}
                        </button>
                    </div>

                    {/* Group List */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {paginatedGroups.length === 0 ? (
                            <p className="text-sm text-gray-500">{t("challengeInvite.noResults")}</p>
                        ) : (
                            paginatedGroups.map((group) => {
                                const isDisabled = maxMembers != null && group.memberCount > maxMembers;
                                return (
                                    <div
                                        key={group.groupId}
                                        className={`flex items-center justify-between p-4 rounded-lg shadow-sm transition ${
                                            isDisabled ? "bg-gray-200 cursor-not-allowed" : "bg-orange-100 cursor-pointer hover:shadow-md"
                                        } ${selectedGroupId === group.groupId && !isDisabled ? "border-2 border-orange-400" : ""}`}
                                        onClick={() => !isDisabled && handleSelectGroup(group.groupId)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-300 bg-white">
                                                <img
                                                    src={group.groupPicture || "/default-avatar.png"}
                                                    alt={group.groupName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{group.groupName}</p>
                                                <p className="text-gray-600 text-sm">
                                                    {group.memberCount} {t("members")}
                                                    {isDisabled && (
                                                        <span className="ml-2 text-red-500 text-xs">
                                                            ({t("challengeInvite.overLimit")})
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type="radio"
                                            name="selectedGroup"
                                            checked={selectedGroupId === group.groupId}
                                            onChange={() => !isDisabled && handleSelectGroup(group.groupId)}
                                            disabled={isDisabled}
                                            className="w-5 h-5 accent-orange-500"
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={currentPage === 1}
                            >
                                {t("challengeInvite.previous")}
                            </button>
                            <span className="text-gray-700 font-medium">
                                {t("challengeInvite.page")} {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={currentPage === totalPages}
                            >
                                {t("challengeInvite.next")}
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            {t("challengeInvite.close")}
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                        >
                            <IoPersonAdd /> {t("challengeInvite.confirm")} ({selectedGroupId ? 1 : 0})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinedGroup;
