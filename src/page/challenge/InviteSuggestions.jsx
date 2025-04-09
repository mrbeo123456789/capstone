import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSuggestMembersQuery } from "../../service/invitationService.js";
import { IoPersonAdd } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const InviteSuggestions = ({ onClose }) => {
    const { t } = useTranslation();
    const { id: challengeId } = useParams();
    const { data: suggestions = [], isLoading, error } = useSuggestMembersQuery(challengeId);
    const [selected, setSelected] = useState([]);

    const handleCheckboxChange = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleInvite = async () => {
        if (selected.length === 0) {
            toast.warn(t("challengeInvite.selectAtLeastOne"));
            return;
        }
        // Here you should call your invite API if needed
        toast.success(`${t("challengeInvite.inviteSuccess")} (${selected.length})`);
        onClose();
    };

    if (isLoading) return <div className="p-4">Loading suggestions...</div>;
    if (error) return <div className="p-4 text-red-500">Error loading suggestions</div>;

    return (
        <div>
            {/* Suggested Members List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {suggestions.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between bg-orange-50 p-3 rounded-lg shadow-sm"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-300">
                                <img
                                    src={member.avatar || "/default-avatar.png"}
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
                ))}
            </div>

            {/* Footer Invite Button */}
            <div className="flex justify-end mt-6">
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

export default InviteSuggestions;