import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyGetChallengesByStatusQuery } from "../../service/guestService.js";

import TopRankingList from "./Homepage/TopRankingList.jsx";
import TopActivePodium from "./Homepage/TopActivePodium.jsx";
import DaySlider from "./Homepage/DaySlider.jsx";
import ChallengeCard from "./Homepage/ChallengeCard.jsx";

const UserDashBoard = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);

    const [triggerStatusQuery] = useLazyGetChallengesByStatusQuery();

    useEffect(() => {
        const fetchChallenges = async () => {
            let combined = [];

            const upcomingRes = await triggerStatusQuery({ status: "UPCOMING", page: 0, size: 3 }).unwrap();
            combined = [...upcomingRes.content];

            if (combined.length < 3) {
                const ongoingRes = await triggerStatusQuery({ status: "ONGOING", page: 0, size: 3 - combined.length }).unwrap();
                combined = [...combined, ...ongoingRes.content];
            }

            if (combined.length < 3) {
                const allRes = await triggerStatusQuery({ status: null, page: 0, size: 3 - combined.length }).unwrap();
                combined = [...combined, ...allRes.content];
            }

            setChallenges(combined.slice(0, 3)); // đảm bảo tối đa 3 phần tử
        };

        fetchChallenges();
    }, []);

    return (
        <main className="text-gray-800 grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 min-w-0 gap-4">
            <div className="col-span-1 lg:row-span-2">
                <DaySlider />
            </div>
            {challenges.map((c, index) => (
                <div key={index} className="col-span-1 lg:row-span-1">
                    <ChallengeCard challenge={c} />
                </div>
            ))}
            <div className="col-span-1 lg:row-span-2">
                <TopActivePodium />
            </div>
            <div className="col-span-1 lg:col-span-2 row-span-1 overflow-x-auto">
                <TopRankingList />
            </div>
        </main>
    );
};

export default UserDashBoard;