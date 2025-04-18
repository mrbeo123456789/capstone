import React, { useState } from 'react';

const EvidenceDetailModal = ({ evidence, onClose, onAccept, onReject }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Determine if the media is a video or image based on type
    const isVideo = evidence?.type === 'video';

    const handleAccept = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            onAccept(evidence.id);
            setIsLoading(false);
        }, 500);
    };

    const handleReject = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            onReject(evidence.id);
            setIsLoading(false);
        }, 500);
    };

    if (!evidence) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-screen overflow-auto">
                {/* Header */}
                <div className="border-b px-6 py-4 flex justify-between items-center bg-orange-100">
                    <h2 className="text-xl font-semibold text-gray-800">Evidence Detail</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content - Flex container for 2/3 - 1/3 layout */}
                <div className="flex flex-col md:flex-row">
                    {/* Left side - Media (2/3) */}
                    <div className="w-full md:w-2/3 p-6">
                        <div className="border rounded-lg overflow-hidden">
                            {isVideo ? (
                                <video
                                    controls
                                    className="w-full h-auto"
                                    src="/api/placeholder/640/360"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img
                                    src="/api/placeholder/640/360"
                                    alt="Evidence proof"
                                    className="w-full h-auto"
                                />
                            )}
                        </div>
                    </div>

                    {/* Right side - Metadata (1/3) */}
                    <div className="w-full md:w-1/3 p-6 bg-gray-50 border-l">
                        <h3 className="text-lg font-medium mb-4">{evidence.name}</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Challenge:</p>
                                <p className="font-medium">{evidence.challenge}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Member Name:</p>
                                <p className="font-medium">{evidence.addedBy}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Date:</p>
                                <p className="font-medium">{evidence.dateAdded}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Type:</p>
                                <p className="font-medium capitalize">{evidence.type}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Description:</p>
                                <p className="mt-1">This is a detailed description of the {evidence.name.toLowerCase()} for the {evidence.challenge} challenge.</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Current Status:</p>
                                <p className="font-medium capitalize">{evidence.status}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t px-6 py-4 flex justify-end gap-4">
                    <button
                        onClick={handleReject}
                        disabled={isLoading || evidence.status === 'rejected'}
                        className={`px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-md ${
                            evidence.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        Reject Evidence
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={isLoading || evidence.status === 'approved'}
                        className={`px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-md ${
                            evidence.status === 'approved' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        Accept Evidence
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvidenceDetailModal;