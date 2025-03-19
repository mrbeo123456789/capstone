import React from 'react';
import { X, Calendar, Clock, Users, BarChart, MessageSquare } from 'lucide-react';

const ChallengeDetailModal = ({ challenge, isOpen, onClose, onStatusChange }) => {
    if (!isOpen || !challenge) return null;

    // Handle status change
    const handleStatusChange = (newStatus) => {
        onStatusChange(newStatus);
    };

    // Determine status badge style
    const getStatusBadgeClasses = () => {
        switch (challenge.status) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 border-b border-gray-200 p-4 flex justify-between items-center bg-gradient-to-r from-red-50 to-yellow-50">
                    <h2 className="text-xl font-bold text-gray-800">Challenge Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Challenge Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {challenge.name}
                            </h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses()}`}>
                {challenge.status}
              </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                                <Calendar size={18} className="text-orange-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="font-medium">{challenge.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Clock size={18} className="text-orange-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium">{challenge.duration}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Users size={18} className="text-orange-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Participants</p>
                                    <p className="font-medium">{challenge.participantCount || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <BarChart size={18} className="text-orange-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Completion Rate</p>
                                    <p className="font-medium">{challenge.completionRate || 0}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Challenge Type & Description */}
                    <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Challenge Type</h4>
                        <p className="mb-4 bg-orange-50 px-3 py-2 rounded-md inline-block">{challenge.type}</p>

                        <h4 className="text-md font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-gray-700 mb-4">{challenge.description || "No description available."}</p>
                    </div>

                    {/* Comments Section */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <MessageSquare size={18} className="text-orange-500 mr-2" />
                            <h4 className="text-md font-semibold text-gray-700">Comments</h4>
                        </div>

                        {challenge.comments && challenge.comments.length > 0 ? (
                            <div className="space-y-3">
                                {challenge.comments.map((comment, index) => (
                                    <div key={index} className="border-l-2 border-orange-200 pl-4 py-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-gray-800">{comment.user}</span>
                                            <span className="text-xs text-gray-500">{comment.date}</span>
                                        </div>
                                        <p className="text-gray-700">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No comments yet</p>
                        )}
                    </div>
                </div>
                {/* Footer Buttons - Fixed */}
                {challenge.status === 'waiting' && (
                    <div className="border-t border-gray-200 p-4 flex justify-end space-x-3 sticky bottom-0 bg-white z-10">
                        <button
                            onClick={() => handleStatusChange('rejected')}
                            className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => handleStatusChange('accepted')}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-md hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 transition-colors"
                        >
                            Accept
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengeDetailModal;