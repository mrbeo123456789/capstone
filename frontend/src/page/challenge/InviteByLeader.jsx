import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";
import { useSearchAvailableGroupLeadersMutation, useSendInvitationMutation } from "../../service/invitationService"; // ✅ import thêm sendInvitation
import { useTranslation } from "react-i18next";

const InviteByLeader = ({ onClose }) => {
    const { id: challengeId } = useParams();
    const { t } = useTranslation();
    const [keyword, setKeyword] = useState("");
    const [selected, setSelected] = useState([]);
    const [search, { data = [], isLoading }] = useSearchAvailableGroupLeadersMutation();
    const [sendInvitation, { isLoading: isInviting }] = useSendInvitationMutation(); // ✅ hook mutation gửi invite

    const handleSearch = () => {
        if (!keyword.trim()) {
            toast.warning(t("challengeInvite.enterKeyword"));
            return;
        }
        search({ challengeId, keyword });
    };

    const toggleSelect = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleInvite = async () => {
        if (selected.length === 0 || selected.some(id => id == null)) {
            toast.warning(t("challengeInvite.selectAtLeastOne"));
            return;
        }

        try {
            await sendInvitation({
                challengeId: Number(challengeId),
                memberIds: selected.filter(id => id != null),
                type: "LEADER"
            }).unwrap();

            toast.success(t("challengeInvite.inviteSuccess"));
            onClose();
        } catch (err) {
            const message = err?.data?.message || err?.data || "Something went wrong.";
            toast.info(message);
            onClose();
        }
    };


    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex items-center border border-gray-300 rounded-md w-full px-3">
                    <IoSearch className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={t("challengeInvite.searchPlaceholder")}
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

            {/* Result */}
            {isLoading ? (
                <p className="text-center text-gray-500">{t("challengeInvite.loadingLeaders")}</p>
            ) : data.length === 0 ? (
                <p className="text-center text-gray-500">{t("challengeInvite.noLeadersFound")}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {data.map((leader) => (
                        <div
                            key={leader.id}
                            className="flex items-center gap-4 p-4 border rounded-lg shadow-sm bg-white hover:bg-orange-50 transition"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(leader.id)}
                                onChange={() => toggleSelect(leader.id)}
                                className="w-5 h-5 accent-orange-500"
                            />
                            <div className="flex items-center gap-4 w-full">
                                <img
                                    src={leader.avatar || "https://via.placeholder.com/48"}
                                    alt={leader.fullName}
                                    className="w-12 h-12 rounded-full object-cover border"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold">{leader.fullName}</p>
                                    <p className="text-sm text-gray-600">{leader.email}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-between pt-2 border-t mt-4">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    {t("challengeInvite.close")}
                </button>
                <button
                    onClick={handleInvite}
                    disabled={isInviting} // ✅ disable khi đang gửi
                    className={`px-4 py-2 rounded text-white ${isInviting ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"}`}
                >
                    {isInviting ? t("challengeInvite.sending") : `${t("challengeInvite.invite")} (${selected.length})`}
                </button>
            </div>
        </div>
    );
};

export default InviteByLeader;
