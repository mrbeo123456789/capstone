import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoPersonAdd } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetGroupsQuery } from "../../service/groupService";
import { useSendGroupInvitationMutation } from "../../service/invitationService";

const InviteGroups = ({ onClose }) => {
    const { t } = useTranslation();
    const { id: challengeId } = useParams();
    const PAGE_SIZE = 5;

    const [selected, setSelected] = useState([]);
    const [inputSearchTerm, setInputSearchTerm] = useState(""); // người dùng đang gõ
    const [searchTerm, setSearchTerm] = useState(""); // từ khoá dùng để lọc
    const [currentPage, setCurrentPage] = useState(1);

    const { data: groupsData = [], isLoading, isError } = useGetGroupsQuery();
    const [sendGroupInvitation] = useSendGroupInvitationMutation();

    const ownerGroups = useMemo(() => {
        return groupsData.filter(
            (group) =>
                group.currentMemberRole === "OWNER" &&
                group.currentParticipants >= 2 &&
                group.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groupsData, searchTerm]);

    const paginatedGroups = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return ownerGroups.slice(start, start + PAGE_SIZE);
    }, [ownerGroups, currentPage]);

    const totalPages = Math.ceil(ownerGroups.length / PAGE_SIZE);

    const handleCheckboxChange = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
        );
    };

    const handleInvite = async () => {
        if (selected.length === 0) {
            toast.warn(t("challengeInvite.selectWarning"));
            return;
        }

        try {
            await sendGroupInvitation({
                challengeId: Number(challengeId),
                groupIds: selected,
            });

            toast.success(`${t("challengeInvite.success")} (${selected.length})`);
            onClose();
        } catch (error) {
            console.error("Error sending group invitation:", error);
            toast.error(t("challengeInvite.inviteFailed"));
        }
    };

    const handleSearch = () => {
        setSearchTerm(inputSearchTerm.trim());
        setCurrentPage(1); // reset trang về đầu
    };

    if (isLoading) return <div className="p-4">{t("challengeInvite.loading")}</div>;
    if (isError) return <div className="p-4 text-red-500">{t("challengeInvite.loadError")}</div>;

    return (
        <div className="p-4">
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder={t("searchPlaceholderGroup")}
                    value={inputSearchTerm}
                    onChange={(e) => setInputSearchTerm(e.target.value)}
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

            {/* Group List */}
            <div className="px-2 max-h-[400px] overflow-y-auto">
                {paginatedGroups.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-1">{t("challengeInvite.noResults")}</p>
                ) : (
                    paginatedGroups.map((group) => (
                        <div
                            key={group.id}
                            className="flex items-center justify-between bg-orange-50 p-3 mb-3 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-300">
                                    <img
                                        src={group.picture || "/default-avatar.png"}
                                        alt={group.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{group.name}</p>
                                    <p className="text-gray-600 text-sm">
                                        {group.currentParticipants} {t("members")}
                                    </p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={selected.includes(group.id)}
                                onChange={() => handleCheckboxChange(group.id)}
                                className="w-5 h-5 accent-orange-500"
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
                                prev < totalPages ? prev + 1 : prev
                            )
                        }
                        className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        disabled={currentPage === totalPages}
                    >
                        {t("challengeInvite.next")}
                    </button>
                </div>
            )}

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
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                    <IoPersonAdd /> {t("challengeInvite.invite")} ({selected.length})
                </button>
            </div>
        </div>
    );
};

export default InviteGroups;
