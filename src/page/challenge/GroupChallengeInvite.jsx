import { IoCloseCircle, IoAlbums } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import InviteByLeader from "./InviteByLeader.jsx";

const GroupChallengeInvite = ({ onClose }) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('challengeInvite.inviteGroups')}</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <IoCloseCircle className="text-2xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <InviteByLeader onClose={onClose} />
                </div>
            </div>
        </div>
    );
};

export default GroupChallengeInvite;