import PropTypes from "prop-types";
import { useGetGroupDetailQuery, useDeleteGroupMutation } from "../../../service/groupService.js";

const GroupDetailModal = ({ groupId, onClose, onDisbandSuccess }) => {
    // Fetch group details using the received groupId
    const {
        data: group,
        isLoading,
        isError
    } = useGetGroupDetailQuery(groupId);
    console.log(group);

    // Group disband mutation
    const [disbandGroup, { isLoading: isDisbanding }] = useDeleteGroupMutation();

    // Handle toggling ban/disband
    const handleToggleBan = async () => {
        if (window.confirm("Are you sure you want to disband this group?")) {
            try {
                const result = await disbandGroup(groupId).unwrap();
                alert("Group disbanded successfully!");
                onDisbandSuccess(); // Notify parent component to refresh list
                onClose(); // Close modal after success
            } catch (error) {
                console.error("Error disbanding group:", error);
                alert("Failed to disband group.");
            }
        }
    };

    // Format date helper
    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length < 3) return "Invalid date";
        const [year, month, day] = dateArray;
        // Nếu số ngày hoặc tháng chỉ có 1 chữ số, thêm số 0 phía trước
        const dd = day < 10 ? `0${day}` : day;
        const mm = month < 10 ? `0${month}` : month;
        return `${dd}/${mm}/${year}`;
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !group) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                    <p className="text-center text-red-500">Error loading group details.</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Group detail</h2>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200 flex-shrink-0 mb-4 md:mb-0">
                            <img
                                src={group.picture || "/api/placeholder/100/100"}
                                alt={group.name || "Group"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="md:ml-6 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-gray-800">{group.name}</h3>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-blue-100 text-blue-800">
                                {group.currentParticipants || 1}/{group.maxParticipants || 1} Members
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-orange-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm font-medium">Group name</span>
                            </div>
                            <div className="text-gray-800 pl-6">{group.name}</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-orange-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">Created date</span>
                            </div>
                            <div className="text-gray-800 pl-6">{formatDate(group.createdAt)}</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-orange-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-sm font-medium">Current member count</span>
                            </div>
                            <div className="text-gray-800 pl-6">{group.currentParticipants} / {group.maxParticipants}</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-orange-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Group Leader</span>
                            </div>
                            <div className="text-gray-800 pl-6">{(group.createdBy)}</div>
                        </div>
                    </div>
                    <div className={"mt-6"}>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-orange-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Description</span>
                            </div>
                            <div className="text-gray-800 pl-6">{(group.name)}</div>
                        </div></div>

                    {group.members && group.members.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Group Members</h4>
                            <div className="bg-orange-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                                <ul className="divide-y divide-orange-100">
                                    {group.members.map((member, index) => (
                                        <li key={index} className="py-2 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-200 mr-3">
                                                    <img
                                                        src={member.avatar || "/api/placeholder/100/100"}
                                                        alt={member.username || "Member"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="text-gray-800">{member.username || "Unknown"}</span>
                                            </div>
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                                {member.role || "Member"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end items-center border-t border-gray-200 space-x-3">
                    <button
                        onClick={handleToggleBan}
                        className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                        disabled={isDisbanding}
                    >
                        {isDisbanding ? "Disbanding..." : "Disband Group"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

GroupDetailModal.propTypes = {
    groupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onClose: PropTypes.func.isRequired,
    onDisbandSuccess: PropTypes.func.isRequired
};

export default GroupDetailModal;