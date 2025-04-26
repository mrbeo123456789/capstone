import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useGetMyGroupsQuery, useJoinGroupToChallengeMutation } from "../../../service/groupService.js";
import { debounce } from "lodash";

const SelectGroupModal = ({ challengeId, onClose, requiredMembers }) => {
    const { t } = useTranslation();
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [page, setPage] = useState(0);
    const [filterExactMember, setFilterExactMember] = useState(false);

    const { data: groups, isLoading, refetch } = useGetMyGroupsQuery({
        keyword: searchKeyword,
        requiredMembers: filterExactMember ? requiredMembers : undefined,
        page,
        size: 5
    });

    const [joinGroupToChallenge, { isLoading: isJoining }] = useJoinGroupToChallengeMutation();

    const debouncedSearch = debounce((value) => {
        setSearchKeyword(value);
        setPage(0);
    }, 400);

    const handleSearchChange = (e) => {
        debouncedSearch(e.target.value);
    };

    const handleCheckboxChange = () => {
        setFilterExactMember((prev) => {
            const newValue = !prev;
            setPage(0);
            setTimeout(() => refetch(), 0);
            return newValue;
        });
    };

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

    const isGroupSelectable = (group) => {
        const isLeader = group.memberRole === "OWNER";
        const isSizeFit = group.totalMembers === requiredMembers;
        return isLeader && isSizeFit;
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 transform animate-scaleIn">
                <h2 className="text-xl font-bold text-center">{t("SelectGroupModal.title")}</h2>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder={t("SelectGroupModal.searchPlaceholder")}
                    onChange={handleSearchChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-300"
                />

                {/* Filter Exact Members */}
                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        checked={filterExactMember}
                        onChange={handleCheckboxChange}
                        className="accent-orange-500"
                    />
                    <label className="text-sm text-gray-700">
                        {t("SelectGroupModal.filterExactMembers", { number: requiredMembers })}
                    </label>
                </div>

                {/* Group List */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, idx) => (
                            <div key={idx} className="w-full h-14 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {groups?.content?.length === 0 ? (
                            <p className="text-center text-gray-500">{t("SelectGroupModal.noGroups")}</p>
                        ) : (
                            groups.content.map((group) => {
                                const selectable = isGroupSelectable(group);
                                const tooltipMessage = !group.memberRole || group.memberRole !== "OWNER"
                                    ? t("SelectGroupModal.notLeaderTooltip")
                                    : (group.totalMembers !== requiredMembers
                                        ? t("SelectGroupModal.notExactMembersTooltip", { number: requiredMembers })
                                        : "");

                                return (
                                    <button
                                        key={group.groupId}
                                        onClick={() => selectable && setSelectedGroupId(group.groupId)}
                                        className={`w-full p-3 rounded-lg border flex items-center space-x-3 relative transition ${
                                            selectable
                                                ? selectedGroupId === group.groupId
                                                    ? "border-orange-500 bg-orange-100"
                                                    : "border-gray-300 hover:border-orange-400"
                                                : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                                        }`}
                                        title={tooltipMessage}
                                    >
                                        <img
                                            src={group.picture || "https://via.placeholder.com/40"}
                                            alt={group.groupName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="text-left">
                                            <p className="font-semibold">{group.name}</p>
                                            <p className="text-xs text-gray-400">
                                                ({t("SelectGroupModal.yourRole")}: {group.memberRole === "OWNER" ? t("SelectGroupModal.owner") : t("SelectGroupModal.member")})
                                            </p>
                                            <p className="text-sm text-gray-500">{group.totalMembers} {t("SelectGroupModal.members")}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex justify-between items-center pt-4">
                    <button
                        onClick={() => setPage(prev => Math.max(0, prev - 1))}
                        disabled={page === 0}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                        {t("SelectGroupModal.prev")}
                    </button>
                    <span>{page + 1}</span>
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={groups?.last}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                        {t("SelectGroupModal.next")}
                    </button>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-6">
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
