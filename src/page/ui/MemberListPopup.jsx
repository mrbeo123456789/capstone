import { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { useSearchMembersMutation, useInviteMembersMutation } from "../../service/groupService.js";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 4;

const MemberListPopup = ({ onClose }) => {
    const { t } = useTranslation();
    const [inviteMembers] = useInviteMembersMutation();
    const [searchMembers] = useSearchMembersMutation();
    const { id: groupId } = useParams();

    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtered, setFiltered] = useState([]);

    const paginatedMembers = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.info(t("groupInvite.enterKeyword"));
            return;
        }

        try {
            const result = await searchMembers({ keyword: searchTerm }).unwrap();
            setFiltered(result);
            setCurrentPage(1);
        } catch (err) {
            toast.error(t("groupInvite.searchFailed"));
        }
    };

    useEffect(() => {
        if (!searchTerm.trim()) setFiltered([]);
    }, [searchTerm]);

    const handleCheckboxChange = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleInvite = async () => {
        if (selected.length === 0) {
            toast.warn(t("groupInvite.selectAtLeastOne"));
            return;
        }

        try {
            await inviteMembers({ groupId, memberIds: selected });
            toast.success(t("groupInvite.inviteSuccess"));
            setSelected([]);
            onClose();
        } catch (err) {
            toast.error(t("groupInvite.inviteFailed"));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t("groupInvite.title")}</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <IoCloseCircle className="text-2xl" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder={t("groupInvite.searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md mb-4 focus:ring-orange-400"
                    />
                    <div className="flex justify-end px-4">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                            {t("groupInvite.search")}
                        </button>
                    </div>
                </div>

                {/* Member List */}
                <div className="px-4 max-h-[400px] overflow-y-auto">
                    {paginatedMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between bg-orange-50 p-3 mb-3 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center space-x-4">
                                <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full border-2 border-orange-300" />
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-gray-600">{member.email}</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={selected.includes(member.id)}
                                onChange={() => handleCheckboxChange(member.id)}
                                className="w-5 h-5 accent-orange-500"
                            />
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-center gap-4 my-4">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            {t("groupInvite.previous")}
                        </button>
                        <span className="text-gray-700">
                            {t("groupInvite.page")} {currentPage}
                        </span>
                        <button
                            onClick={() => {
                                const total = Math.ceil(filtered.length / PAGE_SIZE);
                                if (currentPage < total) setCurrentPage(currentPage + 1);
                            }}
                            disabled={currentPage * PAGE_SIZE >= filtered.length}
                            className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            {t("groupInvite.next")}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-100"
                    >
                        {t("groupInvite.close")}
                    </button>
                    <button
                        onClick={handleInvite}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        {t("groupInvite.invite")} ({selected.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberListPopup;