import React, { useState, useEffect } from 'react';
import { Search, ThumbsUp, ThumbsDown, HourglassIcon } from 'lucide-react';

const EvidenceDetailModal = ({ evidence, onClose, onAccept, onReject }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'approved', 'rejected', 'waiting'];

    // Determine if the media is a video or image based on type
    const isVideo = evidence?.type === 'video';

    useEffect(() => {
        // Mock data for members enrolled in the challenge
        const mockMembers = [
            { id: 1, name: 'John Doe', avatar: null, joinDate: 'Jan 15, 2025', challengeCompletion: 75, totalEvidence: 12, approvedEvidence: 9, pendingEvidence: 2, rejectedEvidence: 1 },
            { id: 2, name: 'Jane Smith', avatar: null, joinDate: 'Feb 3, 2025', challengeCompletion: 60, totalEvidence: 8, approvedEvidence: 5, pendingEvidence: 3, rejectedEvidence: 0 },
            { id: 3, name: 'Michael Johnson', avatar: null, joinDate: 'Dec 10, 2024', challengeCompletion: 90, totalEvidence: 15, approvedEvidence: 13, pendingEvidence: 1, rejectedEvidence: 1 },
            { id: 4, name: 'Sarah Williams', avatar: null, joinDate: 'Jan 22, 2025', challengeCompletion: 40, totalEvidence: 6, approvedEvidence: 3, pendingEvidence: 2, rejectedEvidence: 1 },
            { id: 5, name: 'Robert Martinez', avatar: null, joinDate: 'Feb 15, 2025', challengeCompletion: 25, totalEvidence: 4, approvedEvidence: 1, pendingEvidence: 3, rejectedEvidence: 0 }
        ];

        setMembers(mockMembers);

        // Set the first member as selected by default
        if (mockMembers.length > 0) {
            setSelectedMember(mockMembers[0]);
        }
    }, []);

    // Filter members based on search term and status
    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const handleMemberClick = (member) => {
        setSelectedMember(member);
    };

    const getEvidenceStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <ThumbsUp className="inline mr-2 text-green-600" size={16} />;
            case 'rejected':
                return <ThumbsDown className="inline mr-2 text-red-600" size={16} />;
            case 'waiting':
                return <HourglassIcon className="inline mr-2 text-yellow-600" size={16} />;
            default:
                return null;
        }
    };

    const getEvidenceStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-100 px-2 py-1 rounded-full';
            case 'rejected':
                return 'text-red-600 bg-red-100 px-2 py-1 rounded-full';
            case 'waiting':
                return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full';
            default:
                return '';
        }
    };

    if (!evidence) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-auto">
                {/* Header */}
                <div className="border-b px-6 py-4 flex justify-between items-center bg-orange-100">
                    <h2 className="text-xl font-semibold text-gray-800">Evidence Detail: {evidence.name}</h2>
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
                    {/* Left side - Members enrolled in challenge (2/3) */}
                    <div className="w-full md:w-2/3 p-6">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-orange-100 px-6 py-3 border-b">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">Members Enrolled in {evidence.challenge}</h3>

                                    {/* Search bar moved to the right */}
                                    <div className="relative max-w-md">
                                        <Search
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={18}/>
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-orange-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Member Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Join Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Completion</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Evidence</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredMembers.map((member) => (
                                        <tr
                                            key={member.id}
                                            className={`hover:bg-orange-50 cursor-pointer ${selectedMember?.id === member.id ? 'bg-orange-100' : ''}`}
                                            onClick={() => handleMemberClick(member)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                        {member.avatar ? (
                                                            <img
                                                                src="/api/placeholder/40/40"
                                                                alt={member.name}
                                                                className="rounded-full"
                                                            />
                                                        ) : (
                                                            <span className="text-lg font-bold text-gray-500">
                                                                {member.name.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="font-medium text-gray-900">{member.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.joinDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                                        <div
                                                            className="bg-green-500 h-2.5 rounded-full"
                                                            style={{ width: `${member.challengeCompletion}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{member.challengeCompletion}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.totalEvidence}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {selectedMember && (
                                <div className="p-4 border-t">
                                    <h4 className="font-medium text-lg mb-2">Member Evidence Statistics</h4>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-500 text-sm">Total Evidence</p>
                                            <p className="text-xl font-bold">{selectedMember.totalEvidence}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-500 text-sm">Approved</p>
                                            <p className="text-xl font-bold text-green-600">{selectedMember.approvedEvidence}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-500 text-sm">Pending</p>
                                            <p className="text-xl font-bold text-yellow-600">{selectedMember.pendingEvidence}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-500 text-sm">Rejected</p>
                                            <p className="text-xl font-bold text-red-600">{selectedMember.rejectedEvidence}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Evidence details (1/3) */}
                    <div className="w-full md:w-1/3 p-6">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-orange-100 px-6 py-3 border-b flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">Evidence Details</h3>
                                {evidence && (
                                    <div className="flex items-center">
                                        <span className={getEvidenceStatusColor(evidence.status)}>
                                            {getEvidenceStatusIcon(evidence.status)}
                                            {evidence.status.charAt(0).toUpperCase() + evidence.status.slice(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Evidence Name:</p>
                                    <p className="font-medium">{evidence.name}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Challenge:</p>
                                    <p className="font-medium">{evidence.challenge}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Date Submitted:</p>
                                    <p className="font-medium">{evidence.dateAdded}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Type:</p>
                                    <p className="font-medium capitalize">{evidence.type}</p>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    {isVideo ? (
                                        <video
                                            controls
                                            className="w-full h-auto"
                                            src="/api/placeholder/300/200"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img
                                            src="/api/placeholder/300/200"
                                            alt="Evidence proof"
                                            className="w-full h-auto"
                                        />
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Description:</p>
                                    <p className="mt-1">{evidence.description || `This is a detailed description of the ${evidence.name.toLowerCase()} for the ${evidence.challenge} challenge.`}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Submitted By:</p>
                                    <p className="font-medium">{evidence.addedBy}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Case Number:</p>
                                    <p className="font-medium">{evidence.caseNumber}</p>
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
                </div>
            </div>
        </div>
    );
};

export default EvidenceDetailModal;