import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetChallengeStatisticsQuery } from '../../service/challengeService.js';
import {
    UsersIcon, GroupIcon, FileTextIcon, ThumbsUpIcon,
    HourglassIcon, BanIcon, CalendarDaysIcon, CircleDotIcon
} from 'lucide-react';

const ChallengeStatistic = ({ challengeId }) => {
    const { t } = useTranslation();
    const { data, isLoading, error } = useGetChallengeStatisticsQuery(challengeId);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-blue-500 font-medium">{t("challengeStats.loading")}</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center text-red-600 py-6">
                {t("challengeStats.loadError")}
            </div>
        );
    }

    const ProgressBar = ({ value, label, color = 'blue' }) => (
        <div className="mb-4">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-medium text-gray-700">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full bg-${color}-500`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                📊 {t("challengeStats.dashboardTitle")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InfoCard label={t("challengeStats.challengeName")} value={data.challengeName} icon={<FileTextIcon />} />
                <InfoCard label={t("challengeStats.totalParticipants")} value={data.totalParticipants} icon={<UsersIcon />} />
                <InfoCard label={t("challengeStats.totalGroups")} value={data.totalGroups} icon={<GroupIcon />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InfoCard label={t("challengeStats.evidenceSubmitted")} value={data.totalEvidenceSubmitted} icon={<FileTextIcon />} />
                <InfoCard label={t("challengeStats.approvedEvidence")} value={data.approvedEvidence} icon={<ThumbsUpIcon />} />
                <InfoCard label={t("challengeStats.pendingEvidence")} value={data.pendingEvidence} icon={<HourglassIcon />} />
                <InfoCard label={t("challengeStats.rejectedEvidence")} value={data.rejectedEvidence} icon={<BanIcon />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded shadow">
                    <ProgressBar value={data.participationRate} label={t("challengeStats.participationRate")} color="green" />
                    <ProgressBar value={data.completionRate} label={t("challengeStats.completionRate")} color="indigo" />
                </div>
                <div className="bg-gray-50 p-4 rounded shadow grid grid-cols-2 gap-4">
                    <InfoCard label={t("challengeStats.today")} value={data.today} icon={<CalendarDaysIcon />} />
                    <InfoCard label={t("challengeStats.submittedToday")} value={data.evidenceSubmittedToday} icon={<FileTextIcon />} />
                    <InfoCard label={t("challengeStats.pendingToday")} value={data.pendingReviewToday} icon={<CircleDotIcon />} />
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ label, value, icon }) => (
    <div className="flex items-center bg-blue-50 rounded-lg p-4 shadow-sm space-x-4">
        <div className="text-blue-600">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-semibold text-blue-800">{value}</p>
        </div>
    </div>
);

export default ChallengeStatistic;