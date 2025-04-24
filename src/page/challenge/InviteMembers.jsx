import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import {
    useSearchMembersForChallengeInviteMutation,
    useSendInvitationMutation,
    useSuggestMembersQuery,
    useSearchAvailableGroupLeadersMutation,
} from "../../service/invitationService.js";

const InviteMembers = ({ onClose, participationType }) => {
    const PAGE_SIZE = 4;
    const { id: challengeId } = useParams();
    const { t } = useTranslation();

    const [membersData, setMembersData] = useState([]);
    const [selected, setSelected] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [searchMembers] = useSearchMembersForChallengeInviteMutation();
    const [searchGroupLeaders] = useSearchAvailableGroupLeadersMutation();
    const { data: suggestedMembers = [], isLoading } = useSuggestMembersQuery(challengeId);
    const [sendInvitation] = useSendInvitationMutation();

    useEffect(() => {
        if (suggestedMembers?.length) {
            setMembersData(suggestedMembers);
        }
    }, [suggestedMembers]);

    const paginatedMembers = membersData.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleCheckboxChange = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handleInvite = async () => {
        if (selected.length === 0) {
            toast.warn(t("challengeInvite.selectAtLeastOne"));
            return;
        }

        try {
            const inviteType = participationType === "GROUP" ? "LEADER" : "MEMBER";
            await sendInvitation({ challengeId, memberIds: selected, type: inviteType }).unwrap();
            toast.success(t("challengeInvite.inviteSuccess"));
            onClose();
        } catch (err) {
            const message = err?.data?.message || err?.data || "Something went wrong.";
            toast.info(message);
            onClose();
        }
    };

    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            toast.warn(t("challengeInvite.searchPlaceholder"));
            return;
        }

        try {
            setCurrentPage(1);
            if (participationType === "GROUP") {
                const result = await searchGroupLeaders({ challengeId, keyword: searchKeyword }).unwrap();
                setMembersData(result);
            } else {
                const result = await searchMembers({ challengeid: challengeId, keyword: searchKeyword }).unwrap();
                setMembersData(result);
            }
        } catch (error) {
            console.error(error);
            toast.error(t("challengeInvite.searchFailed"));
        }
    };

    return (
        <div className="p-4">
            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder={
                        participationType === "GROUP"
                            ? t("challengeInvite.searchLeaderPlaceholder")
                            : t("challengeInvite.searchPlaceholder")
                    }
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        {t("challengeInvite.search")}
                    </button>
                </div>
            </div>

            {/* Members */}
            <div className="px-4 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                    <p>Loading...</p>
                ) : membersData.length === 0 ? (
                    <p className="text-gray-500">{t("challengeInvite.noResults")}</p>
                ) : (
                    paginatedMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between bg-orange-50 p-3 mb-3 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-300">
                                    <img
                                        src={member?.avatar}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{member.name}</p>
                                    <p className="text-gray-600 text-sm">{member.email}</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={selected.includes(member.id)}
                                onChange={() => handleCheckboxChange(member.id)}
                                className="w-5 h-5 accent-orange-500"
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 my-4">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    disabled={currentPage === 1}
                >
                    {t("challengeInvite.previous")}
                </button>
                <span className="text-gray-700">
                    {t("challengeInvite.page")} {currentPage}
                </span>
                <button
                    onClick={() =>
                        setCurrentPage((prev) =>
                            prev * PAGE_SIZE < membersData.length ? prev + 1 : prev
                        )
                    }
                    className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    disabled={currentPage * PAGE_SIZE >= membersData.length}
                >
                    {t("challengeInvite.next")}
                </button>
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                    {t("challengeInvite.close")}
                </button>
                <button
                    onClick={handleInvite}
                    className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
                >
                    {t("challengeInvite.invite")} ({selected.length})
                </button>
            </div>
        </div>
    );
};

export default InviteMembers;
