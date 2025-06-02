import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, HourglassIcon } from 'lucide-react';
import { useReviewEvidenceMutation } from '../../../service/evidenceService.js'; // Nhớ điều chỉnh đường dẫn đúng

const EvidenceDetailModal = ({ evidence, onClose, onAccept, onReject }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [reviewEvidence] = useReviewEvidenceMutation();

    // Determine if the media is a video or image based on type
    const isVideo = evidence?.type === 'video';

    // Format date to dd/mm/yyyy
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'N/A';
            }

            // Format date as dd/mm/yyyy
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'N/A';
        }
    };

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            await reviewEvidence({
                evidenceId: evidence.id,
                status: 'APPROVED'
            }).unwrap();

            // Callback to parent component
            onAccept(evidence.id);
        } catch (error) {
            console.error("Error accepting evidence:", error);
            alert("Failed to accept evidence. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await reviewEvidence({
                evidenceId: evidence.id,
                status: 'REJECTED'
            }).unwrap();

            // Callback to parent component
            onReject(evidence.id);
        } catch (error) {
            console.error("Error rejecting evidence:", error);
            alert("Failed to reject evidence. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getEvidenceStatusIcon = (status) => {
        switch (status) {
            case 'approved':
            case 'APPROVED':
                return <ThumbsUp className="inline mr-2 text-green-600" size={16} />;
            case 'rejected':
            case 'REJECTED':
                return <ThumbsDown className="inline mr-2 text-red-600" size={16} />;
            case 'waiting':
            case 'pending':
            case 'PENDING':
                return <HourglassIcon className="inline mr-2 text-yellow-600" size={16} />;
            default:
                return null;
        }
    };

    const getEvidenceStatusColor = (status) => {
        const normalizedStatus = status ? status.toLowerCase() : '';

        switch (normalizedStatus) {
            case 'approved':
                return 'text-green-600 bg-green-100 px-3 py-1.5 rounded-full';
            case 'rejected':
                return 'text-red-600 bg-red-100 px-3 py-1.5 rounded-full';
            case 'waiting':
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 px-3 py-1.5 rounded-full';
            default:
                return '';
        }
    };

    const getStatusDisplay = (status) => {
        if (!status) return 'Unknown';

        // Normalize status to handle different naming conventions
        const normalizedStatus = status.toLowerCase();

        if (normalizedStatus === 'waiting' || normalizedStatus === 'pending') {
            return 'Pending';
        }

        // Capitalize first letter
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    // Check if status is pending (handles both 'waiting' and 'pending' values)
    const isPending = (status) => {
        if (!status) return false;
        const normalizedStatus = status.toLowerCase();
        return normalizedStatus === 'waiting' || normalizedStatus === 'pending';
    };

    if (!evidence) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-4/5 overflow-y-scroll sm:overflow-hidden">
                <div className="sm:hidden border-b px-6 py-4 flex justify-between items-center bg-blue-100">
                    <h2 className="text-xl font-semibold text-gray-800">Evidence Detail</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div className="h-full">
                    <div className="sm:grid grid-cols-3 h-full">
                        {/* Left side - Evidence Media */}
                        <div className="bg-black overflow-hidden justify-items-center col-span-2">
                            {isVideo ? (
                                <video
                                    controls
                                    className="max-h-[400px] sm:max-h-none sm:h-full"
                                    src={evidence.evidenceUrl || "/api/placeholder/800/600"}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img
                                    src={evidence.evidenceUrl || evidence.picture || "/api/placeholder/800/600"}
                                    alt="Evidence proof"
                                    className="w-full h-full"
                                />
                            )}
                        </div>
                        <div className="">
                            {/* Header */}
                            <div className="hidden border-b px-6 py-4 sm:flex justify-between items-center bg-blue-100">
                                <h2 className="text-xl font-semibold text-gray-800">Evidence Detail</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                            {/* Right side - Date, Status and Actions */}
                            <div className="w-full p-6 flex flex-col justify-between">
                                <div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Date Submitted:</p>
                                        <p className="font-medium">{formatDate(evidence.dateAdded || evidence.submittedAt)}</p>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-sm text-gray-500 mb-2">Status:</p>
                                        <div className="flex items-center justify-self-center">
                                        <span className={getEvidenceStatusColor(evidence.status)}>
                                            {getEvidenceStatusIcon(evidence.status)}
                                            {getStatusDisplay(evidence.status)}
                                        </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t pt-4 flex flex-col gap-4">
                                    {/* Show both buttons when pending */}
                                    {isPending(evidence.status) && (
                                        <>
                                            <button
                                                onClick={handleAccept}
                                                disabled={isLoading}
                                                className="px-4 py-3 bg-green-500 text-white hover:bg-green-600 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed justify-items-center"
                                            >
                                                {isLoading ? (
                                                    <span
                                                        className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                                                ) : (
                                                    <ThumbsUp className="mr-2" size={18}/>
                                                )}
                                                Accept Evidence
                                            </button>
                                            <button
                                                onClick={handleReject}
                                                disabled={isLoading}
                                                className="px-4 py-3 border border-red-500 text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed justify-items-center"
                                            >
                                                {isLoading ? (
                                                    <span
                                                        className="inline-block h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin mr-2"></span>
                                                ) : (
                                                    <ThumbsDown className="mr-2" size={18}/>
                                                )}
                                                Reject Evidence
                                            </button>
                                        </>
                                    )}

                                    {/* Show only Accept button when rejected */}
                                    {evidence.status?.toLowerCase() === 'rejected' && (
                                        <button
                                            onClick={handleAccept}
                                            disabled={isLoading}
                                            className="px-4 py-3 bg-green-500 text-white hover:bg-green-600 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed justify-items-center"
                                        >
                                            {isLoading ? (
                                                <span
                                                    className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                                            ) : (
                                                <ThumbsUp className="mr-2" size={18}/>
                                            )}
                                            Accept Evidence
                                        </button>
                                    )}

                                    {/* Show only Reject button when approved */}
                                    {evidence.status?.toLowerCase() === 'approved' && (
                                        <button
                                            onClick={handleReject}
                                            disabled={isLoading}
                                            className="px-4 py-3 border border-red-500 text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed justify-items-center"
                                        >
                                            {isLoading ? (
                                                <span
                                                    className="inline-block h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin mr-2"></span>
                                            ) : (
                                                <ThumbsDown className="mr-2" size={18}/>
                                            )}
                                            Reject Evidence
                                        </button>
                                    )}

                                    {/* Show message when there are no actions available */}
                                    {!isPending(evidence.status) &&
                                        evidence.status?.toLowerCase() !== 'approved' &&
                                        evidence.status?.toLowerCase() !== 'rejected' && (
                                            <p className="text-center text-gray-500 italic">
                                                No actions available for this evidence status.
                                            </p>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EvidenceDetailModal;