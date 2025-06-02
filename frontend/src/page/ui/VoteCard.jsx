import React, { useState } from "react";
import {
    FaBirthdayCake,
    FaCheckCircle,
    FaEnvelope,
    FaIdCard,
    FaMapMarkerAlt,
    FaPhone,
    FaStar, FaTimesCircle,
    FaCalendarAlt, FaTrophy,
    FaUser
} from "react-icons/fa";
import {IoCloseCircle} from "react-icons/io5";

const VoteCard = () => {
    const [ratings, setRatings] = useState({
        vote1: 0,
        vote2: 0,
        vote3: 0,
    });

    const handleRating = (voteKey, value) => {
        setRatings({ ...ratings, [voteKey]: value });
    };

    const [showPopup, setShowPopup] = useState(false);
    const openUserDetail = () => {
        console.log("openUserDetail");
        setShowPopup(true);
    };

    const closeUserDetail = () => {
        setShowPopup(false);
    };

    const UserDetailPopup = ({ onClose }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <IoCloseCircle className="text-2xl" />
                        </button>
                    </div>

                    {/* Main Info */}
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200 flex-shrink-0 mb-4 md:mb-0">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/avatar%2FDSC_0092.jpg?alt=media&token=c859d8d9-ca36-4a93-8e31-c55b399c37eb"
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="md:ml-6 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-gray-800">Hello</h3>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaEnvelope className="mr-2" />
                                    <span className="text-sm font-medium">Email</span>
                                </div>
                                <div className="text-gray-800 pl-6">zx@email.com</div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaPhone className="mr-2" />
                                    <span className="text-sm font-medium">Số điện thoại</span>
                                </div>
                                <div className="text-gray-800 pl-6">41231231231</div>
                            </div>
                        </div>

                        {/* Extra Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Star Rating */}
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-yellow-600">
                                    <FaStar className="mr-2" />
                                    <span className="text-sm font-medium">Số lượt vote</span>
                                </div>
                                <div className="text-gray-800 pl-6">⭐ 120 votes</div>
                            </div>

                            {/* Joined Challenges */}
                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-green-600">
                                    <FaTrophy className="mr-2" />
                                    <span className="text-sm font-medium">Thử thách đã tham gia</span>
                                </div>
                                <div className="text-gray-800 pl-6">12 Challenges</div>
                            </div>

                            {/* Joined Date */}
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-blue-600">
                                    <FaCalendarAlt className="mr-2" />
                                    <span className="text-sm font-medium">Ngày tham gia</span>
                                </div>
                                <div className="text-gray-800 pl-6">01/01/2023</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="rounded-lg space-y-4 p-4 justify-items-center">
            <div className="flex w-full p-2">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center"
                     onClick={() => openUserDetail()}>
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/avatar%2FDSC_0092.jpg?alt=media&token=c859d8d9-ca36-4a93-8e31-c55b399c37eb"
                        alt="User"
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                {/* User Info */}
                <h2 className="text-xl font-semibold pl-2">User Name</h2>
            </div>
            <div className="w-full">
                <p className="text-gray-600 text-sm">Uploaded at: hh:mm dd/mm/yyyy</p>
            </div>
            {/* Voting Sections */}
            <div>
                {["Vote For xxxxx", "Vote For xxxxx", "Vote For xxxxx"].map((label, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                        <p className="text-sm">{label}</p>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`text-6xl cursor-pointer ${
                                        ratings[`vote${index + 1}`] >= star ? "text-yellow-500" : "text-gray-300"
                                    }`}
                                    onClick={() => handleRating(`vote${index + 1}`, star)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {/* Buttons */}
            <div className="flex space-x-4 mt-4">
                <button className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700">Report</button>
                <button className="bg-orange-400 text-white px-6 py-2 rounded-full hover:bg-orange-500">Submit</button>
            </div>
            {/* User Detail Popup */}
            {showPopup && (
                <UserDetailPopup
                    onClose={closeUserDetail}
                />
            )}
        </div>

    );
};

export default VoteCard;
