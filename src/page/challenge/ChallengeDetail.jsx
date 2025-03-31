import { useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { HiUsers } from "react-icons/hi";
import { FaRunning } from "react-icons/fa";
import {useGetChallengeDetailQuery, useJoinChallengeMutation} from "../../service/challengeService";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const ChallengeDetail = () => {
    const [activeTab, setActiveTab] = useState("info");
    const [joinChallenge, { isLoading }] = useJoinChallengeMutation();


    const handleJoin = async () => {
        try {
            await joinChallenge(parseInt(id)).unwrap(); // Pass id from URL
            toast.success("Joined challenge successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to join challenge.");
        }
    };


    return (
        <div className="p-6 flex flex-col items-center h-full w-full">
            {/* Challenge Banner Section */}
            <div className="w-full flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                    src="https://mvpvisuals.com/cdn/shop/articles/mvpvisuals-ultimate-guide-event-branding-for-fun-runs.jpg?v=1689864293"
                    alt="Challenge Banner"
                    className="w-full md:w-2/3 object-cover"
                />
                <div className="bg-gray-100 p-6 md:w-1/3 flex flex-col justify-between">
                    <h2 className="text-xl font-bold text-gray-900">MIỄN PHÍ</h2>
                    <div className="bg-orange-500 text-white font-semibold text-center py-2 mt-2 rounded-lg">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleJoin();
                            }}
                            className="bg-orange-500 text-white px-3 py-1 rounded mt-2 hover:bg-orange-600"
                            disabled={isLoading}
                        >
                            {isLoading ? "Joining..." : "Join Now"}
                        </button>

                    </div>
                    <div className="mt-4 flex items-center">
                        <FaRegClock className="text-gray-500 mr-2"/>
                        <p className="text-gray-700 text-sm">
                        Hạn đăng ký: 18/09/2023 hoặc khi hết suất
                        </p>
                    </div>
                    <div className="mt-4 flex items-center">
                        <FaRunning className="text-gray-500 mr-2" />
                        <p className="text-gray-700 text-sm">Hạng mục: 5 km</p>
                    </div>
                    <h3 className="text-gray-800 font-semibold mt-6">
                        PHẦN THƯỞNG KHI HOÀN THÀNH
                    </h3>
                    <div className="mt-4 flex items-center text-lg font-semibold text-orange-500">
                        <HiUsers className="mr-2" />
                        <p>1019 người đã tham gia</p>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-6 w-full max-w-4xl">
                <div className="flex border-b">
                    {["info", "rules", "team", "individual"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 text-center py-3 font-semibold ${
                                activeTab === tab
                                    ? "text-orange-500 border-b-4 border-orange-500"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            {tab === "info"
                                ? "Thông tin"
                                : tab === "rules"
                                    ? "Quy định"
                                    : tab === "team"
                                        ? "BXH Đội"
                                        : "BXH Cá nhân"}
                        </button>
                    ))}
                </div>
                {/* Tab Content */}
                <div className="p-6 bg-white shadow-md rounded-lg mt-4">
                    {activeTab === "info" && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                21 năm An Phát Holdings
                            </h2>
                            <p className="text-gray-500 mt-2">
                                01/09/2023 (00:00) - 21/09/2023 (23:59)
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                Thử thách: <span className="text-orange-500 font-semibold">Chạy bộ</span> | Được tạo
                                bởi:{" "}
                                <span className="text-blue-500 font-semibold">APH Phạm Thùy Tiên</span>
                            </p>

                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    ĐIỀU LỆ GIẢI CHẠY 21 NĂM AN PHÁT HOLDINGS
                                </h3>
                                <p className="text-gray-700 mt-2">
                                    Tăng tốc - Bứt phá - Làm chủ tương lai
                                </p>
                            </div>
                        </div>
                    )}
                    {activeTab === "rules" && (
                        <p className="text-gray-700">Quy định chi tiết của thử thách sẽ hiển thị tại đây.</p>
                    )}
                    {activeTab === "team" && (
                        <p className="text-gray-700">Bảng xếp hạng đội sẽ hiển thị tại đây.</p>
                    )}
                    {activeTab === "individual" && (
                        <p className="text-gray-700">Bảng xếp hạng cá nhân sẽ hiển thị tại đây.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengeDetail;
