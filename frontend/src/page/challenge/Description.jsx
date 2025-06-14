import React, { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import VideoModal from "../ui/VideoModal.jsx";

// List of users with their proof videos (thumbnails for display)
const voteItems = [
    { id: 1, user: "User 1", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/men/10.jpg" },
    { id: 2, user: "User 2", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/women/11.jpg" },
    { id: 3, user: "User 3", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2Fdownload.mp4?alt=media&token=5305f5e0-dbd8-417d-9600-97274f19907a", thumbnail: "https://randomuser.me/api/portraits/men/12.jpg" },
    { id: 4, user: "User 4", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 5, user: "User 5", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/women/14.jpg" },
    { id: 6, user: "User 6", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/men/10.jpg" },
    { id: 7, user: "User 7", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/women/11.jpg" },
    { id: 8, user: "User 8", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/men/12.jpg" },
    { id: 9, user: "User 9", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 10, user: "User 10", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/women/14.jpg" },
    { id: 11, user: "User 11", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/men/10.jpg" },
    { id: 12, user: "User 12", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/women/11.jpg" },
    { id: 13, user: "User 13", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/men/12.jpg" },
    { id: 14, user: "User 14", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 15, user: "User 15", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/women/14.jpg" },
    { id: 16, user: "User 16", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/men/10.jpg" },
    { id: 17, user: "User 17", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1", thumbnail: "https://randomuser.me/api/portraits/women/11.jpg" },
    { id: 18, user: "User 18", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/men/12.jpg" },
    { id: 19, user: "User 19", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d", thumbnail: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 20, user: "User 20", proofVideo: "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2Fdownload.mp4?alt=media&token=5305f5e0-dbd8-417d-9600-97274f19907a", thumbnail: "https://randomuser.me/api/portraits/women/14.jpg" },
];

const Description = ({ content }) => {
    const [votes, setVotes] = useState({});
    const [activeIndex, setActiveIndex] = useState(0); // Track active proof index

    // Function to handle voting actions
    const handleVote = (id, type) => {
        setVotes((prevVotes) => ({ ...prevVotes, [id]: type }));
    };

    const [showModal, setShowModal] = useState(false);
    const [currentVideo, setCurrentVideo] = useState("");

    const handleSelect = (index) => {
        if (index === activeIndex) {
            // Only open modal if proofVideo exists
            if (voteItems[index].proofVideo) {
                setCurrentVideo(voteItems[index].proofVideo);
                setShowModal(true);
            }
        } else {
            setActiveIndex(index);
        }
    };


    return (
        <div className="rounded-2xl">

            <div className="mt-6 mx-auto w-3/4 bg-white rounded-2xl">
                <div>
                    {content?.banner && content.banner.trim() !== "" && (
                        <img src={content.banner} alt={content?.name} className="w-full h-[450px] object-cover"/>
                    )}
                </div>
                <div className="p-10" dangerouslySetInnerHTML={{__html: content?.description}}/>
            </div>
        </div>

    );
};

export default Description;
