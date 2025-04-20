import { useGetUpcomingChallengesQuery } from "../../../service/guestService.js";
import { Link } from "react-router-dom";

const ChallengeCardDisplay = () => {
    const { data, isLoading, isError } = useGetUpcomingChallengesQuery({ page: 0, size: 10 });

    if (isLoading) return <p className="text-center mt-10">Loading challenges...</p>;
    if (isError) return <p className="text-center mt-10 text-red-500">Error loading challenges.</p>;
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-CA"); // e.g. 2025-04-20
    };

    return (
        <div className="relative flex flex-wrap justify-center items-start gap-6">
            {data.content.map((challenge) => (
                <Link
                    key={challenge.id}
                    to={`/challenges/detail/${challenge.id}`}
                    className="group"
                >
                    <div className="w-[320px] h-[340px] flex flex-col justify-start bg-white rounded-2xl shadow-xl shadow-slate-300/60 overflow-hidden">
                        <div className="overflow-hidden h-[200px]">
                            <img
                                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                src={challenge.picture}
                                alt={challenge.name}
                            />
                        </div>
                        <div className="p-3 flex flex-col justify-between flex-1">
                            <div>
                                <small className="text-blue-400 text-xs">{challenge.challengeTypeName}</small>
                                <h1 className="text-lg font-medium text-slate-600 truncate" title={challenge.name}>
                                    {challenge.name}
                                </h1>
                                <p className="text-sm text-slate-400 leading-5 mt-1 line-clamp-2">
                                    {challenge.summary || "No description provided."}
                                </p>
                            </div>
                            <div className="mt-auto text-xs text-gray-400 pt-2">
                                <p>From: {formatDate(challenge.startDate)} → {formatDate(challenge.endDate)}</p>
                                <p>Participation: {challenge.participationType}</p>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ChallengeCardDisplay;
