import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useGetMyGroupsQuery, useJoinGroupToChallengeMutation } from "../../../service/groupService.js";

const SelectGroupModal = ({ challengeId, onClose }) => {
    const { t } = useTranslation();
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [page, setPage] = useState(0);

    const { data: groups, isLoading, refetch } = useGetMyGroupsQuery({ keyword: searchKeyword, page, size: 6 });
    const [joinGroupToChallenge, { isLoading: isJoining }] = useJoinGroupToChallengeMutation();

    const handleJoin = async () => {
        if (!selectedGroupId) {
            toast.warn(t("SelectGroupModal.selectGroupFirst"));
            return;
        }
        try {
            await joinGroupToChallenge({ groupId: selectedGroupId, challengeId }).unwrap();
            toast.success(t("SelectGroupModal.joinSuccess"));
            window.location.reload();
        } catch (err) {
            console.error(err);
            toast.error(t("SelectGroupModal.joinFail"));
        }
    };

    const handleSearchChange = (e) => {
        setSearchKeyword(e.target.value);
        setPage(0);
        refetch();
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        refetch();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <h2 className="text-xl font-bold text-center">{t("SelectGroupModal.title")}</h2>

                {/* Search Box */}
                <input
                    type="text"
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    placeholder={t("SelectGroupModal.searchPlaceholder")}
                    className="w-full p-2 border rounded-md mb-4"
                />

                {isLoading ? (
                    <p className="text-center">{t("SelectGroupModal.loading")}</p>
                ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {groups?.content?.map((group) => {
                            const isLeader = group?.memberRole === "OWNER";

                            return (
                                <button
                                    key={group.groupId}
                                    onClick={() => isLeader && setSelectedGroupId(group.groupId)}
                                    className={`w-full p-3 rounded-lg border flex items-center space-x-3 relative transition ${
                                        isLeader
                                            ? selectedGroupId === group.groupId
                                                ? "border-orange-500 bg-orange-100"
                                                : "border-gray-300 hover:border-orange-400"
                                            : "border-gray-200 bg-gray-100 opacity-70 cursor-not-allowed"
                                    }`}
                                    title={!isLeader ? t("SelectGroupModal.notLeaderTooltip") : ""}
                                >
                                    <img
                                        src={group.picture || "https://via.placeholder.com/40"}
                                        alt={group.groupName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="text-left">
                                        <p className="font-semibold">{group.groupName}</p>
                                        <p className="text-sm text-gray-500">
                                            {group.totalMembers} {t("SelectGroupModal.members")}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex justify-center items-center mt-4 space-x-4">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                    >
                        {t("SelectGroupModal.prev")}
                    </button>
                    <span>{page + 1}</span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={groups?.last}
                        className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                    >
                        {t("SelectGroupModal.next")}
                    </button>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                        {t("SelectGroupModal.cancel")}
                    </button>
                    <button
                        onClick={handleJoin}
                        disabled={isJoining}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        {isJoining ? t("SelectGroupModal.joining") : t("SelectGroupModal.join")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectGroupModal;
