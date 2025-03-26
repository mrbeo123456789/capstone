import {useEffect, useState} from "react";
import { IoCloseCircle } from "react-icons/io5";
import { useSearchMembersMutation, useInviteMembersMutation } from "../../service/groupService.js";
import { useParams } from "react-router-dom";

const dummyMembers = [
    { id: 1, name: "John Doe", email: "john@example.com", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
    { id: 3, name: "Michael Brown", email: "michael@example.com", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
    { id: 4, name: "Emily Johnson", email: "emily@example.com", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
    { id: 5, name: "Alex Lee", email: "alex@example.com", avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
    { id: 6, name: "Sara Kim", email: "sara@example.com", avatar: "https://randomuser.me/api/portraits/women/5.jpg" },
];

const PAGE_SIZE = 4;

const MemberListPopup = ({ onClose}) => {
    const [inviteMembers] = useInviteMembersMutation();
    const [searchMembers, { data, isLoading }] = useSearchMembersMutation();
    const { id: groupId } = useParams(); // assuming your route is defined like /groups/joins/:id
    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filtered, setFiltered] = useState(null);
    const displayMembers = filtered || dummyMembers;

    const paginatedMembers = displayMembers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const handleSearch = async () => {
        const payload = {
            keyword: searchTerm,
        };

        try {
            const result = await searchMembers(payload).unwrap();
            setFiltered(result); // New state to display the result
            setCurrentPage(1);   // Reset pagination to first page
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') setFiltered(null);
    }, [searchTerm]);

    const filteredMembers = dummyMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // const paginatedMembers = filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleCheckboxChange = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleInvite = async () => {
        const memberIds = selected;
        if (memberIds.length === 0) {
            alert("Please select at least one member.");
            return;
        }

        const payload = {
            groupId: groupId,
            memberIds: memberIds
        };

        try {
            const res = await inviteMembers(payload).unwrap();
            alert(res); // e.g., "Lời mời đã được gửi đến các thành viên!"
            setSelected([]);
            onClose(); // close popup
        } catch (error) {
            console.error("Invite failed:", error);
            alert("Gửi lời mời thất bại.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Danh sách thành viên</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                        <IoCloseCircle className="text-2xl" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="flex justify-end px-4">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Member List */}
                <div className="px-4 max-h-[400px] overflow-y-auto">
                    {paginatedMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between bg-orange-50 p-3 mb-3 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-300">
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{member.name}</p>
                                    <p className="text-gray-600 text-sm">{member.email}</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={selected.includes(member.id)}
                                onChange={() => handleCheckboxChange(member.id)}
                                className="w-5 h-5 accent-orange-500"
                            />
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-center gap-4 my-4">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">Page {currentPage}</span>
                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    prev * PAGE_SIZE < filteredMembers.length ? prev + 1 : prev
                                )
                            }
                            className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            disabled={currentPage * PAGE_SIZE >= filteredMembers.length}
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleInvite}
                        className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
                    >
                        Invite ({selected.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberListPopup;
