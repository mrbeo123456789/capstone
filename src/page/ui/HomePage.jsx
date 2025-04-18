import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetUpcomingChallengesQuery } from "../../service/guestService.js";

import TopRankingList from "./Homepage/TopRankingList.jsx";
import TopActivePodium from "./Homepage/TopActivePodium.jsx";
import DaySlider from "./Homepage/DaySlider.jsx";
import ChallengeCard from "./Homepage/ChallengeCard.jsx";

const HomePage = () => {
    const { data, isLoading, isError } = useGetUpcomingChallengesQuery({ page: 0, size: 3 });
    const navigate = useNavigate();

    const challenges = data?.content || [];

    return (
        <main className="text-gray-800 grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 min-w-0 gap-4">
            <div className="col-span-1 lg:row-span-2">
                <DaySlider/>
            </div>
            <div className="col-span-1 lg:row-span-1">
                <ChallengeCard challenge={challenges[0]}/>
            </div>
            <div className="col-span-1 lg:row-span-1">
                <ChallengeCard challenge={challenges[1]}/>
            </div>
            <div className="col-span-1 lg:row-span-1">
                <ChallengeCard challenge={challenges[2]}/>
            </div>
            <div className="col-span-1 lg:row-span-2">
                <TopActivePodium/>
            </div>
            {/* Leaderboard or Slider */}
            <div className="col-span-1 lg:col-span-2 row-span-1 overflow-x-auto">
                <TopRankingList/>
            </div>

        </main>
    );
};

export default HomePage;
