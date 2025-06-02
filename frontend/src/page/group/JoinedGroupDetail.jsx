import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import MemberTable from "./MemberTable";
import { FaUsers, FaFire, FaExclamationTriangle } from "react-icons/fa";
import {
    useDeleteGroupMutation,
    useGetGroupDetailQuery,
    useKickMemberMutation,
    useLeaveGroupMutation
} from "../../service/groupService.js";
import MemberListPopup from "../ui/MemberListPopup.jsx";
import { useGetCurrentMemberIdQuery } from "../../service/memberService";
import GroupChallengeHistory from "./GroupChallengeHistory";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center text-red-600 mb-4">
                    <FaExclamationTriangle className="text-2xl mr-2" />
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const JoinedGroupDetail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id: groupId } = useParams();

    const { data: group, isLoading, error, refetch } = useGetGroupDetailQuery(groupId);
    const [kickMember] = useKickMemberMutation();
    const [leaveGroup] = useLeaveGroupMutation();
    const [deleteGroup] = useDeleteGroupMutation();

    const [activeTab, setActiveTab] = useState("members");
    const [menuOpen, setMenuOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [resetTable, setResetTable] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const isOwner = group?.currentMemberRole === "OWNER";
    const { data: currentMemberData } = useGetCurrentMemberIdQuery();
    const currentMemberId = currentMemberData;

    useEffect(() => {
        if (error?.status === 500 || error?.status === 404) {
            toast.error(t("groupDetail.permissionDenied"));
            navigate("/groups/joins");
        }
    }, [error, navigate, t]);

    const handleLeaveGroup = async () => {
        try {
            const res = await leaveGroup(groupId);
            toast.success(res?.data || t("groupDetail.leaveSuccess"));
            setTimeout(() => navigate("/groups/joins"), 1500);
        } catch (err) {
            toast.error(err?.data?.message || t("groupDetail.leaveFailed"));
        }
    };

    const openDeleteConfirmation = () => {
        setShowDeleteConfirmation(true);
        setMenuOpen(false); // Close the menu when opening the confirmation modal
    };

    const closeDeleteConfirmation = () => {
        setShowDeleteConfirmation(false);
    };

    const handleDisbandGroup = async () => {
        try {
            const res = await deleteGroup(groupId);
            toast.success(res?.data || t("groupDetail.disbandSuccess"));
            setShowDeleteConfirmation(false);
            setTimeout(() => navigate("/groups/joins"), 1500);
        } catch (err) {
            toast.error(err?.data?.message || t("groupDetail.disbandFailed"));
            setShowDeleteConfirmation(false);
        }
    };

    const handleKickMember = async (memberId) => {
        // ✅ Không cho kick chính mình
        if (memberId === currentMemberId) {
            toast.warn(t("groupDetail.cannotKickYourself"));
            return;
        }

        try {
            const res = await kickMember({ groupId, memberId });
            toast.success(res?.data || t("groupDetail.kickSuccess"));

            refetch(); // cập nhật lại group
            setResetTable(true); // trigger reset bảng về page 0
        } catch (err) {
            toast.error(err?.data?.message || t("groupDetail.kickFailed"));
        }
    };

    const handleEditGroup = () => {
        navigate(`/groups/${groupId}/edit`);
    };

    const openInvitePopup = () => setShowPopup(true);
    const closeInvitePopup = () => setShowPopup(false);

    const tabItems = [
        { key: "members", label: t("groupDetail.tabs.members"), icon: <FaUsers /> },
        { key: "challenge", label: t("groupDetail.tabs.challenges"), icon: <FaFire /> },
    ];

    if (isLoading) return <p className="text-center">{t("groupDetail.loading")}</p>;
    if (error) return <p className="text-center text-red-500">{t("groupDetail.error")}</p>;

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mx-auto bg-white rounded-lg shadow-lg p-6 m-2">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="w-full md:pr-6 pb-6 md:pb-0">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold text-orange-600">{group?.name}</h2>
                            <div className="relative inline-block text-left mb-4">
                                <button
                                    className="flex flex-col space-y-1 p-2"
                                    onClick={() => setMenuOpen((prev) => !prev)}
                                >
                                    <span className="block w-6 h-1 bg-orange-400"></span>
                                    <span className="block w-6 h-1 bg-orange-400"></span>
                                    <span className="block w-6 h-1 bg-orange-400"></span>
                                </button>

                                {menuOpen && (
                                    <div className="absolute z-10 mt-2 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            {isOwner && (
                                                <button
                                                    onClick={openInvitePopup}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                >
                                                    {t("groupDetail.inviteMembers")}
                                                </button>
                                            )}

                                            {isOwner && (
                                                <button onClick={handleEditGroup} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                                    {t("groupDetail.editGroup")}
                                                </button>
                                            )}
                                            {!isOwner && (
                                                <button onClick={handleLeaveGroup} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                                    {t("groupDetail.leaveGroup")}
                                                </button>
                                            )}
                                            {isOwner && (
                                                <button onClick={openDeleteConfirmation} className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600 font-semibold">
                                                    {t("groupDetail.disbandGroup")}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-500 mt-2">
                            {t("groupDetail.description")}: <span className="font-semibold">{group?.description}</span>
                        </p>
                        <p className="text-gray-500 mt-1">
                            {t("groupDetail.createdAt")}:{" "}
                            {group?.createdAt
                                ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(group.createdAt))
                                : ""}
                        </p>
                    </div>
                    <div className="bg-gray-200 flex items-center justify-center rounded-lg">
                        <img src={group?.picture} alt={group?.name} className="w-[120px] h-[120px] rounded" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
                <div className="rounded-lg flex w-full bg-black text-white text-sm font-semibold">
                    {tabItems.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex flex-col sm:flex-row items-center justify-center px-4 py-3 transition-all
                                ${activeTab === tab.key ? "border-t-4 border-red-500 bg-orange-300 text-black" : "bg-white text-black"}
                                hover:bg-orange-100 hover:text-black`}
                        >
                            <span className="text-lg mr-2">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="shadow-lg rounded-lg w-full mx-auto p-4">
                    {activeTab === "members" && (
                        <MemberTable
                            groupId={groupId}
                            isHost={isOwner}
                            onKick={handleKickMember}
                            resetTable={resetTable}
                            onResetHandled={() => setResetTable(false)}
                            searchTerm={searchKeyword}
                            setSearchTerm={setSearchKeyword}
                        />
                    )}

                    {activeTab === "challenge" && (
                        <GroupChallengeHistory groupId={groupId} />
                    )}
                </div>
            </div>

            {/* Invite Popup */}
            {showPopup && <MemberListPopup onClose={closeInvitePopup} />}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirmation}
                onClose={closeDeleteConfirmation}
                onConfirm={handleDisbandGroup}
                title={t("groupDetail.confirmDelete")}
                message={t("groupDetail.deleteWarning")}
            />
        </div>
    );
};

export default JoinedGroupDetail;