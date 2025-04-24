import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRegClock, FaSearch, FaRunning } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { HiUsers } from "react-icons/hi";
import { CheckCircle, XCircle, ArrowLeft, Ban, UserX } from "lucide-react";
import toast from "react-hot-toast";
import Footer from "../../../component/footer.jsx";
import { useGetChallengeDetailQuery } from "../../../service/challengeService.js";
import { useReviewChallengeMutation } from "../../../service/adminService.js";
import {
    useGetJoinedMembersWithPendingEvidenceQuery,
    useKickMemberFromChallengeMutation
} from "../../../service/challengeService.js";
import EvidenceList from "../list/EvidenceList.jsx";

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Tabs
    const [activeTab, setActiveTab] = useState("info");

    // Challenge detail
    const {
        data: challenge,
        error,
        isLoading,
        refetch: refetchChallenge
    } = useGetChallengeDetailQuery(id);

    // Admin review
    const [reviewChallenge] = useReviewChallengeMutation();

    // Members + kick
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const {
        data: membersData = { content: [], totalPages: 1 },
        isLoading: isMembersLoading,
        error: membersError,
        refetch: refetchMembers
    } = useGetJoinedMembersWithPendingEvidenceQuery({
        challengeId: id,
        keyword: searchTerm,
        page: currentPage - 1,
        size: 5
    });
    const [kickMember, { isLoading: isKicking }] =
        useKickMemberFromChallengeMutation();

    // Review modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState("");
    const [message, setMessage] = useState("");
    const [actionError, setActionError] = useState("");

    // Navigation
    const goBack = () => navigate(-1);
    const goList = () => navigate("/admin/challengemanagement");

    // Review modal handlers
    const openActionModal = (type) => {
        setActionType(type);
        setMessage("");
        setActionError("");
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    const handleModalSubmit = async () => {
        if (!id || !actionType) return;
        let newStatus = "";
        if (actionType === "confirmed") newStatus = "APPROVED";
        else if (actionType === "rejected") newStatus = "REJECTED";
        else if (actionType === "banned") newStatus = "BANNED";
        else return;

        try {
            setActionError("");
            const payload = { challengeId: id, status: newStatus, adminNote: message };
            const result = await reviewChallenge(payload);
            if (result.error && result.error.originalStatus !== 200) {
                setActionError(`Error: ${result.error.data || "Unknown error"}`);
            } else {
                closeModal();
                refetchChallenge();
            }
        } catch (e) {
            setActionError(`Error: ${e.message}`);
        }
    };

    const getModalTitle = () => {
        if (actionType === "confirmed") return "Approve Challenge";
        if (actionType === "rejected")  return "Reject Challenge";
        if (actionType === "banned")    return "Ban Challenge";
        return "Review Challenge";
    };
    const getMessagePlaceholder = () => {
        if (actionType === "confirmed") return "Enter approval message...";
        if (actionType === "rejected")  return "Enter reason for rejection...";
        if (actionType === "banned")    return "Enter reason for banning...";
        return "";
    };

    // Kick handler
    const handleKick = async (memberId) => {
        // Add validation to prevent undefined memberId
        if (!memberId) {
            toast.error("Invalid member ID");
            return;
        }

        try {
            const result = await kickMember({
                challengeId: id,
                targetMemberId: memberId
            });

            // Check if there's a parsing error but status is 200 (success)
            if (result.error && result.error.status === 'PARSING_ERROR' && result.error.originalStatus === 200) {
                // This is actually a success case with non-JSON response
                toast.success("Member kicked successfully");

                // Refresh both the members list AND the challenge data
                refetchMembers();
                refetchChallenge();
            } else if (result.error) {
                // This is a real error
                throw result.error;
            } else {
                // Normal success case
                toast.success("Member kicked successfully");
                refetchMembers();
                refetchChallenge();
            }
        } catch (err) {
            console.error(err);
            toast.error(err.data || err.error || "Failed to kick member");
        }
    };

    // Filter search
    const filteredMembers = membersData.content.filter((m) =>
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date helper
    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleDateString("en-GB");
    };

    // Simple participation and verification type translators (not using i18n)
    const getParticipationType = (type) => type === "INDIVIDUAL" ? "Individual" : "Group";
    const getVerificationType = (type) => type === "HOST_REVIEW" ? "Host Review" : "Member Review";

    // Loading/Error screens
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"/>
                <p className="mt-4 text-gray-600">Loading challenge...</p>
            </div>
        );
    }
    if (error || !challenge) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-6 rounded shadow-md text-center">
                    <h2 className="text-red-600 text-xl mb-2">Error</h2>
                    <p>Could not load challenge #{id}.</p>
                    <button onClick={goBack} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Determine available tabs based on challenge status
    const isMembersEvidenceHidden =
        challenge.challengeStatus.toLowerCase() === "pending" ||
        challenge.challengeStatus.toLowerCase() === "upcoming";

    // Available tabs based on status (removed "rules" tab)
    const availableTabs = ["info"];
    if (!isMembersEvidenceHidden) {
        availableTabs.push("members", "evidence");
    }

    // Ensure active tab is valid
    if (!availableTabs.includes(activeTab)) {
        setActiveTab("info");
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-yellow-100">
            {/* Header */}
            <div className="p-4">
                <button
                    onClick={goList}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    <ArrowLeft size={18} className="mr-2"/> Return to list
                </button>
            </div>

            {/* Main Content */}
            <div className="p-6 flex flex-col items-center w-full">
                {/* Banner & Info - Redesigned to match shorter version but without multilingual support */}
                <div className="w-full flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
                    {challenge.picture ? (
                        <img
                            src={challenge.picture}
                            alt={challenge.name}
                            className="object-cover w-full md:w-1/2 max-h-[490px]"
                        />
                    ) : (
                        <div className="w-full md:w-1/2 bg-gray-200 h-64"/>
                    )}
                    <div className="bg-gray-100 p-6 w-full flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 line-clamp-2">{challenge.name}</h2>
                            {/* Review buttons moved here for admin */}
                            {(() => {
                                const st = challenge.challengeStatus.toLowerCase();
                                if (st === "pending") {
                                    return (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openActionModal("confirmed")}
                                                className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                                title="Approve"
                                            ><CheckCircle size={18}/></button>
                                            <button
                                                onClick={() => openActionModal("rejected")}
                                                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                title="Reject"
                                            ><XCircle size={18}/></button>
                                        </div>
                                    );
                                }
                                if (st === "ongoing" || st === "upcoming") {
                                    return (
                                        <button
                                            onClick={() => openActionModal("banned")}
                                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                            title="Ban"
                                        ><Ban size={18}/></button>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        <div className="mt-4 flex items-center">
                            <FaRegClock className="text-gray-500 mr-2" />
                            <p className="text-gray-700 text-sm">
                                {formatDate(challenge.startDate)} → {formatDate(challenge.endDate)}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center">
                            <MdOutlineCategory className="text-gray-500 mr-2" />
                            <p className="text-gray-700 text-sm">
                                Category: {challenge.challengeType}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center">
                            <FaRunning className="text-gray-500 mr-2" />
                            <p className="text-gray-700 text-sm">
                                Participation: {getParticipationType(challenge.participationType)}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center">
                            <IoIosPeople className="text-gray-500 mr-2" />
                            <p className="text-gray-700 text-sm">
                                Verification: {getVerificationType(challenge.verificationType)}
                            </p>
                        </div>

                        <h3 className="text-gray-800 font-semibold mt-6">
                            Total Participants
                        </h3>
                        <div className="mt-2 flex items-center text-lg font-semibold text-blue-500">
                            <HiUsers className="mr-2" />
                            <p>{challenge.participantCount} / {challenge.maxParticipants} people joined</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 w-full max-w-4xl">
                    <div className="flex border-b">
                        {availableTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 font-semibold text-center ${
                                    activeTab === tab
                                        ? "text-blue-500 border-b-4 border-blue-500"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab === "info"
                                    ? "Information"
                                    : tab === "members"
                                        ? "Members"
                                        : "Evidence"}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === "info" && (
                        <div className="p-6 bg-white shadow-md rounded">
                            <h2 className="text-2xl font-bold mb-2">{challenge.name}</h2>
                            <p className="text-gray-500 mb-4">
                                {formatDate(challenge.startDate)} – {formatDate(challenge.endDate)}
                            </p>
                            <div
                                className="mt-6 border-t pt-4 text-gray-700"
                                dangerouslySetInnerHTML={{ __html: challenge.description }}
                            ></div>
                        </div>
                    )}

                    {activeTab === "members" && !isMembersEvidenceHidden && (
                        <div className="p-6 bg-white shadow-md rounded">
                            <h2 className="text-2xl font-bold mb-4">Participant Members</h2>

                            {/* Search */}
                            <div className="mb-4 flex items-center border rounded px-2 py-1">
                                <FaSearch className="text-gray-500 mr-2"/>
                                <input
                                    type="text"
                                    placeholder="Search member..."
                                    className="w-full outline-none"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            {/* Member Cards */}
                            <div className="space-y-4">
                                {isMembersLoading ? (
                                    <p className="text-center">Loading members…</p>
                                ) : membersError ? (
                                    <p className="text-center text-red-600">Error loading members</p>
                                ) : filteredMembers.length === 0 ? (
                                    <p className="text-center text-gray-500">No members found</p>
                                ) : (
                                    filteredMembers.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center justify-between bg-gray-50 p-3 rounded shadow-sm"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={m.avatar}
                                                    alt={m.fullName}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <p className="font-semibold">{m.fullName}</p>
                                                    <p className="text-sm text-gray-600">{m.status}</p>
                                                </div>
                                            </div>
                                            <button
                                                key={`kick-${m.id}`}
                                                onClick={() => handleKick(m.id)}
                                                disabled={isKicking}
                                                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                title="Kick member"
                                            >
                                                <UserX size={18}/>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-center mt-6 space-x-1">
                                {Array.from({ length: membersData.totalPages }, (_, i) => (
                                    <button
                                        key={`page-${i+1}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1 rounded ${
                                            currentPage === i + 1
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                {currentPage < membersData.totalPages && (
                                    <button
                                        key="next-page"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                                    >
                                        &gt;
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "evidence" && !isMembersEvidenceHidden && (
                        <div className="mt-4">
                            <EvidenceList challengeId={challenge.id}/>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold text-blue-700">{getModalTitle()}</h3>
                        </div>
                        <div className="p-6">
                            <textarea
                                rows={4}
                                className="w-full border rounded p-3 focus:outline-none"
                                placeholder={getMessagePlaceholder()}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            {actionError && (
                                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                                    {actionError}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end p-4 bg-gray-50 space-x-3">
                            <button
                                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                className={`px-4 py-2 rounded text-white ${
                                    actionType === "confirmed"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                                onClick={handleModalSubmit}
                            >
                                {actionType === "confirmed"
                                    ? "Approve"
                                    : actionType === "rejected"
                                        ? "Reject"
                                        : "Ban"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer/>
        </div>
    );
};

export default ChallengeDetail;