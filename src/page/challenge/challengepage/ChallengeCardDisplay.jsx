import { useGetUpcomingChallengesQuery } from "../../../service/guestService.js";
import { Link } from "react-router-dom";

const ChallengeCardDisplay = ({ data, isLoading, isError }) => {
    if (isLoading) return <p className="text-center mt-4">Loading...</p>;
    if (isError) return <p className="text-center mt-4 text-red-500">Error loading challenges.</p>;
    if (!data || !data.content || data.content.length === 0) return <p className="text-center mt-4 text-gray-400">No challenges available.</p>;

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-CA");

    return (
        <div className="flex flex-row justify-center gap-6">
            {data.content.map((challenge) => (
                <Link key={challenge.id} to={`/challenges/detail/${challenge.id}`} className="group">
                    <div className="w-[320px] h-[340px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
                        <div className="h-[200px] overflow-hidden">
                            <img src={challenge.picture} alt={challenge.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="p-3 flex flex-col justify-between flex-1">
                            <div>
                                <small className="text-blue-400 text-xs">{challenge.challengeTypeName}</small>
                                <h1 className="text-lg font-medium text-slate-600 truncate" title={challenge.name}>
                                    {challenge.name}
                                </h1>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                    {challenge.summary || challenge?.description ||""}
                                </p>
                            </div>
                            <div className="mt-auto text-xs text-gray-400">
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
