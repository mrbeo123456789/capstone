import React from "react";
import { Link } from "react-router-dom";

const ChallengeCard = ({ challenge }) => {
    if (!challenge) return null;

    return (
        <Link to={`/challenges/detail/${challenge.id}`} className="group">
            {/*h-[340px]*/}
            <div className="w-full  h-full flex flex-col justify-start bg-white rounded-2xl shadow-xl shadow-slate-300/60 overflow-hidden">
                <div className="overflow-hidden h-[250px]">
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
                            {challenge.summary || "Không có bản tóm tắt cho thử thách này"}
                        </p>
                    </div>
                    <div className="mt-auto text-xs text-gray-400 pt-2">
                        <p>
                            From: {new Date(challenge.startDate).toLocaleDateString()} → {new Date(challenge.endDate).toLocaleDateString()}
                        </p>

                        <p>Participation: {challenge.participationType}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ChallengeCard;