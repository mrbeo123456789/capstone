import React from "react";
import { FaUsers, FaExchangeAlt, FaExclamationCircle, FaSignOutAlt } from "react-icons/fa";
import {IoCloudUploadOutline} from "react-icons/io5";

const GroupHeader = () => {
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
                        <div className="flex items-center gap-4 mt-2">
                            <FaUsers className="text-xl cursor-pointer hover:text-red-500"/>
                            <FaExchangeAlt className="text-xl cursor-pointer hover:text-yellow-500"/>
                            <FaExclamationCircle className="text-xl cursor-pointer hover:text-orange-500"/>
                            <FaSignOutAlt className="text-xl cursor-pointer hover:text-red-700"/>
                        </div>
                    </div>
                    <div className="w-40 h-40 bg-gray-200 flex items-center justify-center rounded-lg">
                        <IoCloudUploadOutline className="text-gray-500 text-4xl"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupHeader;
