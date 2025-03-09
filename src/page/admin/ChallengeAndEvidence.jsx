import React from "react";

const ChallengeAndEvidence = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {/* Challenges Table */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-yellow-400 font-bold text-lg text-center mb-3">Challenges List</h2>
                <div className="overflow-hidden rounded-lg">
                    <table className="w-full text-center border border-gray-700">
                        <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Date</th>
                            <th className="p-2">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 font-medium">Run 10K</td>
                            <td className="p-3 text-blue-400">Running</td>
                            <td className="p-3">12/04/2025</td>
                            <td className="p-3 text-green-400">Active</td>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 font-medium">Yoga Session</td>
                            <td className="p-3 text-orange-400">Yoga</td>
                            <td className="p-3">15/04/2025</td>
                            <td className="p-3 text-yellow-400">Pending</td>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 font-medium">Cycling Marathon</td>
                            <td className="p-3 text-red-400">Cycling</td>
                            <td className="p-3">20/04/2025</td>
                            <td className="p-3 text-green-400">Active</td>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 font-medium">Strength Training</td>
                            <td className="p-3 text-purple-400">Workout</td>
                            <td className="p-3">22/04/2025</td>
                            <td className="p-3 text-red-400">Cancelled</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                {/* View All Button */}
                <div className="flex justify-center mt-4">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
                        View All
                    </button>
                </div>
            </div>

            {/* Evidence Table */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-red-400 font-bold text-lg text-center mb-3">Evidences</h2>
                <div className="overflow-hidden rounded-lg">
                    <table className="w-full text-center border border-gray-700">
                        <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Challenge ID</th>
                            <th className="p-2">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 font-medium">John's Proof</td>
                            <td className="p-3 text-blue-400">Photo</td>
                            <td className="p-3">CH001</td>
                            <td className="p-3 text-green-400">Verified</td>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 font-medium">Jane's Video</td>
                            <td className="p-3 text-orange-400">Video</td>
                            <td className="p-3">CH002</td>
                            <td className="p-3 text-yellow-400">Pending</td>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 font-medium">Mike's Record</td>
                            <td className="p-3 text-green-400">Audio</td>
                            <td className="p-3">CH003</td>
                            <td className="p-3 text-green-400">Verified</td>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 font-medium">Sophie's Proof</td>
                            <td className="p-3 text-purple-400">Document</td>
                            <td className="p-3">CH004</td>
                            <td className="p-3 text-red-400">Rejected</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                {/* View All Button */}
                <div className="flex justify-center mt-4">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
                        View All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChallengeAndEvidence;
