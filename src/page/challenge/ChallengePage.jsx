import { useGetChallengesByStatusQuery } from "../../service/guestService.js";
import ChallengeCardDisplay from "./challengepage/ChallengeCardDisplay.jsx";
import ChallengeSwiper from "../ui/ChallengeSwiper/ChallengeSwiper.jsx";

function ChallengePage() {
    const upcoming = useGetChallengesByStatusQuery({ status: "UPCOMING" });
    const ongoing = useGetChallengesByStatusQuery({ status: "ONGOING" });
    const finished = useGetChallengesByStatusQuery({ status: "FINISHED" });

    return (
        <section id="home" className="home active">
            <ChallengeSwiper/>
            <div className="container-fluid p-4">
                <div className="flex flex-row ">
                    <div className="bg-black/50 rounded-lg w-full h-[10px]">
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold">📅 Upcoming Challenges</h2>
                    </div>
                    <div className="bg-black/50 rounded-lg w-full h-[10px]">
                    </div>
                </div>
                <ChallengeCardDisplay data={upcoming.data} isLoading={upcoming.isLoading} isError={upcoming.isError}/>
                <h2 className="text-2xl font-bold bg-black/50 p-3 rounded-lg">🔥 Ongoing Challenges</h2>
                <ChallengeCardDisplay data={ongoing.data} isLoading={ongoing.isLoading} isError={ongoing.isError}/>
                <h2 className="text-2xl font-bold bg-black/50 p-3 rounded-lg">✅ Finished Challenges</h2>
                <ChallengeCardDisplay data={finished.data} isLoading={finished.isLoading} isError={finished.isError}/>

            </div>
        </section>
    );
}

export default ChallengePage;
