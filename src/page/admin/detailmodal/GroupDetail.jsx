import PropTypes from "prop-types";
import { useGetGroupDetailQuery, useDeleteGroupMutation } from "../../../service/groupService.js";
import { useState } from "react";

const GroupDetailModal = ({ groupId, onClose, onDisbandSuccess }) => {
    // State for confirmation modal
    const [showConfirmation, setShowConfirmation] = useState(false);
    // State for toast notification
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    // Fetch group details using the received groupId
    const {
        data: group,
        isLoading,
        isError
    } = useGetGroupDetailQuery(groupId);

    // Group disband mutation
    const [disbandGroup, { isLoading: isDisbanding }] = useDeleteGroupMutation();

    // Show toast notification
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    // Handle disband confirmation
    const handleToggleBan = () => {
        setShowConfirmation(true);
    };

    const getCreatorName = () => {
        // Tìm thành viên có ID trùng với người tạo
        const creator = group.members.find(member =>
            member.memberId === group.createdBy ||
            member.role === "OWNER"
        );

        // Trả về tên nếu tìm thấy, ngược lại trả về ID
        return creator ? creator.memberName : group.createdBy;
    };

    // Handle actual disband action
    const handleConfirmDisband = async () => {
        try {
            const response = await disbandGroup(groupId);

            // Check if response contains the Vietnamese success message
            const isSuccess =
                response?.data === "Nhóm đã được giải tán." ||
                response?.data?.message === "Nhóm đã được giải tán." ||
                response?.message === "Nhóm đã được giải tán.";

            if (isSuccess || response?.status === 200) {
                showToast("Group disbanded successfully!");

                if (onDisbandSuccess) {
                    onDisbandSuccess(); // Notify parent component to refresh list
                }

                // Close confirmation modal and main modal after success
                setShowConfirmation(false);
                setTimeout(() => onClose(), 1000); // Small delay to let the user see the success message
                return;
            }

            // Handle unexpected success response format
            console.log("API Response:", response);
            showToast("Group disbanded successfully!");

            if (onDisbandSuccess) {
                onDisbandSuccess();
            }

            setShowConfirmation(false);
            setTimeout(() => onClose(), 1000);

        } catch (error) {
            console.error("Error disbanding group:", error);

            // Check if the error actually contains a success message (sometimes APIs return errors with success data)
            if (error?.data === "Nhóm đã được giải tán." ||
                error?.message === "Nhóm đã được giải tán." ||
                (typeof error === 'string' && error.includes("Nhóm đã được giải tán"))) {

                showToast("Group disbanded successfully!");

                if (onDisbandSuccess) {
                    onDisbandSuccess();
                }
            } else {
                showToast("Failed to disband group.", "error");
            }

            setShowConfirmation(false);
        }
    };

    // Format date helper
    const formatDate = (dateValue) => {
        if (!dateValue) return "Invalid date";

        let dateObj;

        // Handle array data format (old format)
        if (Array.isArray(dateValue) && dateValue.length >= 3) {
            const [year, month, day] = dateValue;
            dateObj = new Date(year, month - 1, day);
        }
        // Handle timestamp or date string
        else {
            try {
                dateObj = new Date(dateValue);
            } catch (error) {
                console.error("Error parsing date:", error);
                return "Invalid date";
            }
        }

        // Check if dateObj is a valid date
        if (isNaN(dateObj.getTime())) {
            return "Invalid date";
        }

        // Format as dd/mm/yyyy
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}/${month}/${year}`;
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            {/* Toast notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-xl z-50 flex items-center ${
                    toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                } animate-fadeIn`}>
                    {toast.type === "error" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                    {toast.message}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fadeIn shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="bg-red-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Confirm Group Disbanding</h3>
                            <p className="text-gray-600 mt-2">
                                Are you sure you want to disband the group "{group.name}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex space-x-3 justify-center">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDisband}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white font-medium transition-colors"
                                disabled={isDisbanding}
                            >
                                {isDisbanding ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    "Yes, Disband Group"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal - Now with 90% height of screen */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
                <div className="bg-gradient-to-r from-blue-500 to-red-500 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Group detail</h2>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium"
                    >
                        Close
                    </button>
                </div>

                {/* Using flex-1 to make the content area take up remaining space */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex flex-col md:flex-row items-center mb-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-blue-200 flex-shrink-0 mb-4 md:mb-0">
                            <img
                                src={group.picture || "/api/placeholder/100/100"}
                                alt={group.name || "Group"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="md:ml-6 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-gray-800">{group.name}</h3>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-blue-100 text-blue-800">
                                {group.currentParticipants || 0} Members
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm font-medium">Group name</span>
                            </div>
                            <div className="text-gray-800 pl-6">{group.name}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium">Created date</span>
                            </div>
                            <div className="text-gray-800 pl-6">{formatDate(group.createdAt)}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-sm font-medium">Current member count</span>
                            </div>
                            <div className="text-gray-800 pl-6">{group.members.length}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Group Leader</span>
                            </div>
                            <div className="text-gray-800 pl-6">{getCreatorName()}</div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1 text-blue-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Description</span>
                            </div>
                            <div className="text-gray-800 pl-6">{group.description || group.name}</div>
                        </div>
                    </div>

                    {group.members && group.members.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Group Members</h4>
                            <div className="overflow-hidden bg-blue-50 rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-blue-200">
                                        <thead className="bg-blue-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Avatar</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Member Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Role</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-blue-50 divide-y divide-blue-100">
                                        {group.members.map((member, index) => (
                                            <tr key={index} className="hover:bg-blue-100">
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-200">
                                                        <img
                                                            src={member.avatar || "/api/placeholder/100/100"}
                                                            alt={member.memberName || "Member"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800">
                                                    {member.memberName || "Unknown"}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                            {member.role || "Member"}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
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
                        Disband Group
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
    onDisbandSuccess: PropTypes.func
};

export default GroupDetailModal;