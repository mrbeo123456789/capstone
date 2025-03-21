import { IoCloseCircle } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";

const dummyMembers = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
        id: 3,
        name: "Michael Brown",
        email: "michael@example.com",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
        id: 4,
        name: "Emily Johnson",
        email: "emily@example.com",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    },
];

const MemberListPopup = ({ onClose }) => {
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

                {/* Member List */}
                <div className="p-4 max-h-[500px] overflow-y-auto">
                    {dummyMembers.map((member) => (
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
                            <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                                <FaCheckCircle className="mr-2" /> Check
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberListPopup;
