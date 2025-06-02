import TopActivePodium from "./TopActivePodium";
import TopRankingList from "./TopRankingList";

const RankingListDashboard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full mx-auto min-h-[625px]">
            <TopActivePodium />
            <TopRankingList />
        </div>
    );
};

export default RankingListDashboard;