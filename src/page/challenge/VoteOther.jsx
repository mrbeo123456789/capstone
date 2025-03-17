import { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

// List of users with their proof videos (thumbnails for display)
const voteItems = [
    { id: 1, user: "User 1", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/men/10.jpg" },
    { id: 2, user: "User 2", proofVideo: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4", thumbnail: "https://randomuser.me/api/portraits/women/11.jpg" },
    { id: 3, user: "User 3", proofVideo: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_3mb.mp4", thumbnail: "https://randomuser.me/api/portraits/men/12.jpg" },
    { id: 4, user: "User 4", proofVideo: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_4mb.mp4", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 4, user: "User 4", proofVideo: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_4mb.mp4", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 4, user: "User 4", proofVideo: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_4mb.mp4", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 4, user: "User 4", proofVideo: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_4mb.mp4", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 4, user: "User 4", proofVideo: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_4mb.mp4", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 4, user: "User 4", proofVideo: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_4mb.mp4", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 4, user: "User 4", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
];

const VoteOther = () => {
    const [votes, setVotes] = useState({});
    const [activeIndex, setActiveIndex] = useState(0); // Track active proof index

    // Function to handle voting actions
    const handleVote = (id, type) => {
        setVotes((prevVotes) => ({ ...prevVotes, [id]: type }));
    };

    // Function to bring clicked card to front
    const handleSelect = (index) => {
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    return (
        <div className="mt-6 mx-auto p-4 relative h-[450px] overflow-hidden w-full sm:w-2/3">
            <h2 className="text-xl font-bold mb-4 text-center">Vote for Others' Proof</h2>
            <div className="relative flex justify-center items-center h-full">
                {voteItems.map((item, index) => {
                    const offset = index - activeIndex;
                    const isActive = index === activeIndex;
                    const scale = isActive ? 1 : Math.max(0.6, 1 - Math.abs(offset) * 0.1);
                    const opacity = isActive ? 1 : Math.max(0.3, 1 - Math.abs(offset) * 0.3);
                    const zIndex = 10 - Math.abs(offset);

                    return (
                        <div
                            key={item.id}
                            className="absolute transition-all duration-500 cursor-pointer"
                            style={{
                                transform: `translateX(${offset * 80}px) scale(${scale})`,
                                opacity: opacity,
                                zIndex: zIndex,
                            }}
                            onClick={() => handleSelect(index)}
                        >
                            <div className="bg-white rounded-lg shadow-lg p-4 w-64">
                                <img src={item.thumbnail} alt={item.user} className="w-full h-40 object-cover rounded-lg" />
                                <p className="text-center font-semibold mt-2">Vote Here</p>
                                <div className="flex justify-center space-x-1 text-yellow-500 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < 4 ? "text-yellow-400" : "text-gray-400"}>★</span>
                                    ))}
                                </div>
                                <p className="text-sm text-center text-gray-700 mt-2">Uploaded by: {item.user}</p>
                                <p className="text-sm text-center text-gray-700">Date: dd/mm/yyyy</p>
                                {isActive && (
                                    <div className="flex justify-center space-x-4 mt-3">
                                        <button onClick={() => handleVote(item.id, "approve")} className="p-2 rounded-full bg-green-500 text-white">
                                            <FaThumbsUp />
                                        </button>
                                        <button onClick={() => handleVote(item.id, "reject")} className="p-2 rounded-full bg-red-500 text-white">
                                            <FaThumbsDown />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VoteOther;
