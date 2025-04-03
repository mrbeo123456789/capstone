import React, {useState} from "react";
import { FaUsers, FaExchangeAlt, FaExclamationCircle, FaSignOutAlt } from "react-icons/fa";
import {IoCloudUploadOutline} from "react-icons/io5";
import MemberListPopup from "../ui/MemberListPopup.jsx";

const GroupHeader = (group) => {
    const [showPopup, setShowPopup] = useState(false);
    console.log("this is group value", group)

    const openMemberList = () => {
        console.log("openUserDetail");
        setShowPopup(true);
    };

    const closeUserDetail = () => {
        setShowPopup(false);
    };

    return (
        <div className="bg-white rounded flex items-center p-4">
            <div className="w-full p-6 m-2">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="md:w-2/3">
                        <h1 className="text-2xl font-bold text-red-600">Group Name</h1>
                        <p className="text-gray-700">Short group description goes here...</p>
                        <div className="mt-4">
                            <p className="text-gray-700">Progress: 60%</p>
                            <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
                                <div
                                    className="bg-blue-500 h-3 rounded-full"
                                    style={{width: `60%`}}
                                ></div>
                            </div>
                        </div>
                        <button className="text-white bg-red-600 px-6 py-2 rounded hover:bg-red-900"
                                onClick={() => openMemberList()}>
                            Invite
                        </button>
                        <div className="flex items-center gap-4 mt-2">
                            <FaUsers className="text-xl cursor-pointer hover:text-red-500"/>
                            <FaExchangeAlt className="text-xl cursor-pointer hover:text-yellow-500"/>
                            <FaExclamationCircle className="text-xl cursor-pointer hover:text-orange-500"/>
                            <FaSignOutAlt className="text-xl cursor-pointer hover:text-red-700"/>
                        </div>
                    </div>
                    <div className="w-40 h-40 bg-gray-200 flex items-center justify-center rounded-lg">
                        {group?.picture ? (
                            <IoCloudUploadOutline className="text-gray-500 text-4xl"/>
                        ): (
                            <img
                                src={group?.picture}
                                className="w-full h-full object-cover rounded"
                            />
                        )}
                    </div>
                </div>
            </div>
            {/* User Detail Popup */}
            {showPopup && (
                <MemberListPopup
                    onClose={closeUserDetail}
                />
            )}
        </div>
    );
};

export default GroupHeader;
