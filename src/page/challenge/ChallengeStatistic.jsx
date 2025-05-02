import React from 'react';
import { useGetChallengeStatisticsQuery } from '../../service/challengeService.js';
import {
    UsersIcon,
    GroupIcon,
    FileTextIcon,
    ThumbsUpIcon,
    HourglassIcon,
    BanIcon,
    TrendingUpIcon,
    CalendarDaysIcon,
    CircleDotIcon
} from 'lucide-react';

const ChallengeStatistic = ({ challengeId }) => {
    const { data, isLoading, error } = useGetChallengeStatisticsQuery(challengeId);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-blue-500 font-medium">Loading statistics...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center text-red-600 py-6">
                Failed to load challenge statistics.
            </div>
        );
    }

    // Helper for bar visual
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Challenge Progress Dashboard</h2>

            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InfoCard label="Challenge Name" value={data.challengeName} icon={<FileTextIcon />} />
                <InfoCard label="Total Participants" value={data.totalParticipants} icon={<UsersIcon />} />
                <InfoCard label="Total Groups" value={data.totalGroups} icon={<GroupIcon />} />
            </div>

            {/* Evidence Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InfoCard label="Evidence Submitted" value={data.totalEvidenceSubmitted} icon={<FileTextIcon />} />
                <InfoCard label="Approved Evidence" value={data.approvedEvidence} icon={<ThumbsUpIcon />} />
                <InfoCard label="Pending Evidence" value={data.pendingEvidence} icon={<HourglassIcon />} />
                <InfoCard label="Rejected Evidence" value={data.rejectedEvidence} icon={<BanIcon />} />
            </div>

            {/* Visual Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded shadow">
                    <ProgressBar value={data.participationRate} label="Participation Rate" color="green" />
                    <ProgressBar value={data.completionRate} label="Completion Rate" color="indigo" />
                </div>
                <div className="bg-gray-50 p-4 rounded shadow grid grid-cols-2 gap-4">
                    <InfoCard label="Today" value={data.today} icon={<CalendarDaysIcon />} />
                    <InfoCard label="Submitted Today" value={data.evidenceSubmittedToday} icon={<FileTextIcon />} />
                    <InfoCard label="Pending Review Today" value={data.pendingReviewToday} icon={<CircleDotIcon />} />
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
