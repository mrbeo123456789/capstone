import React from "react";

const ReportsAndMembers = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {/* Reports Table */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-red-400 font-bold text-lg text-center mb-3">List of Reports</h2>
                <div className="overflow-hidden rounded-lg">
                    <table className="w-full text-center">
                        <tbody>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 text-yellow-400">Cheating</td>
                            <td className="p-3 text-green-400">Resolved</td>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3 text-orange-400">Abuse</td>
                            <td className="p-3 text-red-400">Pending</td>
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

            {/* Members Table */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-orange-400 font-bold text-lg text-center mb-3">Members List</h2>
                <div className="overflow-hidden rounded-lg">
                    <table className="w-full text-center">
                        <tbody>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3">John Doe</td>
                            <td className="p-3 text-green-400">Active</td>
                        </tr>
                        <tr className="border-b border-gray-700 text-gray-300">
                            <td className="p-3">Jane Smith</td>
                            <td className="p-3 text-red-400">Banned</td>
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

            {/* Main Challenge Info */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-yellow-400 font-bold text-lg text-center mb-3">Main Challenge Info</h2>
                <div className="overflow-hidden rounded-lg">
                    <table className="w-full text-left text-gray-300">
                        <tbody>
                        <tr className="border-b border-gray-700">
                            <td className="p-3 font-semibold">Name:</td>
                            <td className="p-3">30-Day Running</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="p-3 font-semibold">Type:</td>
                            <td className="p-3">Running</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="p-3 font-semibold">Status:</td>
                            <td className="p-3 text-green-400">Active</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="p-3 font-semibold">Participants:</td>
                            <td className="p-3">320 Members</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="p-3 font-semibold">Start Date:</td>
                            <td className="p-3">March 1, 2025</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-semibold">End Date:</td>
                            <td className="p-3">March 30, 2025</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Create Challenge Button */}
            <button className="fixed bottom-10 right-10 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-700 flex items-center gap-2">
                ➕ <span className="font-semibold">Create Challenge</span>
            </button>
        </div>
    );
};

export default ReportsAndMembers;
