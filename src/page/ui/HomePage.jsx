import React from "react";
import { useGetApprovedChallengesQuery } from "../../service/challengeService.js";
import { useNavigate } from "react-router-dom";
import GameSwiper from "../../heroBanner/GameSwiper.jsx";
import DaySlider from "./Homepage/DaySlider.jsx";
import ChallengeItemList from "./Homepage/ChallengeItemList.jsx";
import RankingList from "../challenge/RankingList.jsx";
import RankingListDashboard from "./Homepage/RankingListDashboard.jsx";
import TopRankingList from "./Homepage/TopRankingList.jsx";
import TopActivePodium from "./Homepage/TopActivePodium.jsx";

const HomePage = () => {
    const { data, isLoading, isError } = useGetApprovedChallengesQuery({ page: 0, size: 6 });
    const navigate = useNavigate();

    return (
        <main className="text-gray-800 grid grid-cols-4 grid-rows-2 grid-flow-col max-h-screen">
            <div className="col-span-2 flex flex-col row-span-1 overflow-hidden">
                <DaySlider/>
            </div>
            <div className="bg-white row-span-1 col-span-2 rounded-2xl p-4">
                <p>HEllo</p>
            </div>
            <div className="col-span-2 sm:col-span-1 md:col-span-2 row-span-2">
                {/* Ongoing Challenges as News */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Ongoing Challenges</h3>
                    <ul className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <li key={i} className="flex gap-3 items-center">
                                <img
                                    src={`https://loremflickr.com/60/60/running?random=${i}`}
                                    alt="Ongoing"
                                    className="w-12 h-12 rounded-lg"
                                />
                                <div className="text-sm">
                                    <p className="font-bold">Challenge {i}</p>
                                    <p className="text-gray-500 text-xs">2024-04-0{i} &nbsp; | &nbsp; <span
                                        className="text-blue-500 cursor-pointer hover:underline">read more</span>
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
                    <TopRankingList/>
                    <TopActivePodium/>
                </div>
            </div>
            {/*<div className="grid grid-cols-12 gap-6">*/}
            {/*/!* Left - Upcoming Challenges (3 large cards) *!/*/}
            {/*    <div className="col-span-7 grid grid-cols-3 gap-4">*/}
            {/*        {data?.content?.slice(0, 3).map((challenge, index) => (*/}
            {/*            <div*/}
            {/*                key={challenge.id}*/}
            {/*                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"*/}
            {/*                onClick={() => navigate(`/challenges/detail/${challenge.id}`)}*/}
            {/*            >*/}
            {/*                <img*/}
            {/*                    src={challenge.picture || `https://loremflickr.com/320/240/fitness?lock=${index}`}*/}
            {/*                    alt="Challenge"*/}
            {/*                    className="w-full h-40 object-cover"*/}
            {/*                />*/}
            {/*                <div className="p-4">*/}
            {/*                    <h3 className="text-lg font-bold">{challenge.name}</h3>*/}
            {/*                    <p className="text-sm text-gray-600">{challenge.summary || "Push your limits!"}</p>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        ))}*/}
            {/*    </div>*/}
            {/*    /!* Right - Calendar & Ongoing Challenges *!/*/}
            {/*    <div className="col-span-5 space-y-6">*/}
            {/*    </div>*/}
            {/*</div>*/}
        </main>
    );
};

export default HomePage;