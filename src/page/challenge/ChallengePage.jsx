import { useGetChallengesByStatusQuery } from "../../service/guestService.js";
import ChallengeCardDisplay from "./challengepage/ChallengeCardDisplay.jsx";
import ChallengeSwiper from "../ui/ChallengeSwiper/ChallengeSwiper.jsx";

function ChallengePage() {
    //const upcoming = useGetChallengesByStatusQuery({ status: "UPCOMING" });
    //const ongoing = useGetChallengesByStatusQuery({ status: "ONGOING" });
    //const finished = useGetChallengesByStatusQuery({ status: "FINISHED" });
    const all = useGetChallengesByStatusQuery({status: null});

    return (
        <section id="home" className="home active">
            <ChallengeSwiper/>
            <div className="container-fluid p-4">
                <div className="flex flex-row items-center">
                    <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-2xl font-bold whitespace-nowrap text-white">🔥 Challenges</h2>
                    </div>
                    <div className="bg-white/50 rounded-lg w-full h-[5px]">
                    </div>
                </div>
                <ChallengeCardDisplay data={all.data} isLoading={all.isLoading} isError={all.isError}/>
            </div>
        </section>
    );
}

export default ChallengePage;
