import { useTranslation } from "react-i18next";

const InviteGroups = () => {
    const { t } = useTranslation();

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold text-orange-600 mb-4">{t('challengeInvite.inviteGroups')}</h3>
            <p className="text-gray-600">This feature is under development! 🚧</p>
        </div>
    );
};

export default InviteGroups;
