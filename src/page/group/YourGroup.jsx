import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
    useGetGroupsQuery,
    useGetPendingInvitationsQuery,
    useRespondToInvitationMutation
} from "../../service/groupService.js";

const YourGroup = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const {
        data: groupsData,
        isLoading,
        isError,
        refetch: refetchGroups,
    } = useGetGroupsQuery();

    const {
        data: invitationsData = [],
        isLoading: isInvitationsLoading,
        error,
        refetch: refetchInvitations,
    } = useGetPendingInvitationsQuery();

    const [respondToInvitation] = useRespondToInvitationMutation();
    const [activeTab, setActiveTab] = useState("All");

    const handleRespond = async (groupId, status) => {
        try {
            const res = await respondToInvitation({ groupId, status });
            toast.success(res?.data?.message || t("yourGroup.invitationResponseSuccess"));
            refetchInvitations();
            refetchGroups();
        } catch (error) {
            toast.error(error?.data?.message || t("yourGroup.invitationResponseFailed"));
        }
    };

    const filteredGroups = (groupsData || []).filter(group => {
        const matchRole =
            activeTab === "All" ||
            (activeTab === "leader" && (group.currentMemberRole === "HOST" || group.currentMemberRole === "COHOST")) ||
            (activeTab === "member" && group.currentMemberRole === "MEMBER");

        const matchSearch =
            group.name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchRole && matchSearch;
    });


    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Tạo nhóm */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => navigate("/groups/create")}
                >
                    {t("yourGroup.createGroup")}
                </button>
            </div>

            {/* Danh sách lời mời */}
            <div className="border rounded-lg p-4 space-y-4">
                <h2 className="text-lg font-semibold">
                    {t("yourGroup.invitations")} ({invitationsData.length})
                </h2>
                {isInvitationsLoading ? (
                    <div className="h-52 flex items-center justify-center border border-dashed rounded-lg bg-gray-50 text-gray-500">
                        <p>{t("yourGroup.loadingInvitations")}</p>
                    </div>
                ) : invitationsData.length === 0 ? (
                    <div className="h-52 flex items-center justify-center border border-dashed rounded-lg bg-gray-50 text-gray-500">
                        <p className="font-semibold">{t("yourGroup.noInvitations")}</p>
                    </div>
                ) : (
                    <div className="flex gap-6 overflow-x-auto pb-2">
                        {invitationsData.map((invite) => (
                            <div
                                key={invite.id}
                                onClick={() => navigate(`/groups/detail/${invite.id}`)}
                                className="cursor-pointer min-w-[200px] p-4 border rounded-lg space-y-2 flex-shrink-0 hover:shadow-lg transition">
                                <p className="text-sm">
                                    {t("yourGroup.inviteLine", { name: invite.invitedBy})}
                                </p>
                                <div className="h-24 bg-gray-200 rounded">
                                    <img
                                        src={invite.img || "https://via.placeholder.com/300x200"}
                                        alt={invite.name}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                                <p className="font-medium">{invite.groupName}</p>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRespond(invite.groupId, "ACCEPTED");
                                        }}
                                    >
                                        {t("yourGroup.accept")}
                                    </button>
                                    <button
                                        className="border px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRespond(invite.groupId, "REJECTED");
                                        }}
                                    >
                                        {t("yourGroup.decline")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs lọc vai trò */}
            <div className="flex gap-4">
                {["All", "leader", "member"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg ${activeTab === tab ? "bg-blue-600 text-white" : "border"}`}
                    >
                        {t(`yourGroup.tabs.${tab}`)}
                    </button>
                ))}
            </div>

            {/* Danh sách nhóm + ô tìm kiếm */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{t("yourGroup.yourGroups")}</h2>
                    <input
                        type="text"
                        placeholder={t("yourGroup.searchPlaceholder")}
                        className="border rounded-lg px-3 py-2 w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredGroups?.length === 0 ? (
                    <div
                        className="h-52 flex items-center justify-center border border-dashed rounded-lg bg-gray-50 text-gray-500">
                    <p className="font-semibold">{t("yourGroup.noGroups")}</p>
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {filteredGroups.map((group) => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/groups/joins/${group.id}`)}
                                className="cursor-pointer min-w-[150px] border rounded-lg flex flex-col items-center relative flex-shrink-0 hover:shadow-lg transition">
                                <div className="relative w-full h-24 mb-2">
                                    <img
                                        src={group.picture || "https://via.placeholder.com/300x200"}
                                        alt={group.name}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                                <p className="font-medium text-center mb-2">{group.name}</p>
                                <div className="bg-gray-100 text-sm px-2 py-1 rounded mb-1">
                                    {group.currentParticipants || group.members?.length || 0} {t("yourGroup.members")}
                                </div>
                                <div className="border text-sm px-2 py-1 rounded capitalize">
                                    {group.currentMemberRole?.toLowerCase()}
                                </div>
                            </div>
                        ))}
                        {isLoading && <p className="text-center">{t("yourGroup.loadingGroups")}</p>}
                        {isError && <p className="text-center text-red-500">{t("yourGroup.errorGroups")}</p>}
                    </div>
                )}
            </div>
        </div>
    );

};

export default YourGroup;
