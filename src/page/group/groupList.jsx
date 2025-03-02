import React, { useState, useEffect } from "react";
import {
    useGetGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation
} from "../../service/groupService";
import Modal from "../../component/Modal.jsx"; // Import modal popup

const GroupManagement = () => {
    const { data: groups, isLoading, isError, error } = useGetGroupsQuery();
    const [createGroup] = useCreateGroupMutation();
    const [updateGroup] = useUpdateGroupMutation();
    const [deleteGroup] = useDeleteGroupMutation();

    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("add"); // "add" or "edit"
    const [groupId, setGroupId] = useState(null);
    const [groupName, setGroupName] = useState("");
    const [groupDesc, setGroupDesc] = useState("");
    const [creator, setCreator] = useState("");
    const [selectedSport, setSelectedSport] = useState(""); // Môn thể dục
    const [message, setMessage] = useState("");

    // useEffect(() => {
    //     if (user) {
    //         setCreator(user.username); // Gán username vào trường người tạo
    //     }
    // }, [user]);

    const openAddModal = () => {
        setModalType("add");
        setGroupId(null);
        setGroupName("");
        setGroupDesc("");
        setSelectedSport("");
        setIsModalOpen(true);
    };

    const openEditModal = (group) => {
        setModalType("edit");
        setGroupId(group.id);
        setGroupName(group.name);
        setGroupDesc(group.description);
        setSelectedSport(group.sport);
        setIsModalOpen(true);
    };

    const handleSaveGroup = async () => {
        if (!groupName || !selectedSport) {
            setMessage("Group name and sport are required.");
            return;
        }
        try {
            if (modalType === "add") {
                await createGroup({ name: groupName, description: groupDesc, creator, sport: selectedSport }).unwrap();
                setMessage("Group created successfully.");
            } else {
                await updateGroup({ id: groupId, name: groupName, description: groupDesc, sport: selectedSport }).unwrap();
                setMessage("Group updated successfully.");
            }
            setIsModalOpen(false); // Đóng modal sau khi xử lý thành công
        } catch (err) {
            setMessage("Failed to save group.");
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm("Are you sure you want to delete this group?")) {
            try {
                await deleteGroup(id).unwrap();
                setMessage("Group deleted successfully.");
            } catch (err) {
                setMessage("Failed to delete group.");
            }
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Group Management</h1>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    onClick={openAddModal}
                >
                    Add Group
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            {/* Hiển thị danh sách nhóm */}
            <div className="bg-white shadow rounded p-4">
                <h2 className="text-xl font-semibold mb-2">Groups</h2>
                {isLoading ? (
                    <p>Loading groups...</p>
                ) : isError ? (
                    <p>Error: {error.error || error.status}</p>
                ) : (
                    <table className="w-full table-auto">
                        <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2">Creator</th>
                            <th className="px-4 py-2">Sport</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredGroups?.length > 0 ? (
                            filteredGroups.map((group) => (
                                <tr key={group.id} className="border-t">
                                    <td className="px-4 py-2">{group.id}</td>
                                    <td className="px-4 py-2">{group.name}</td>
                                    <td className="px-4 py-2">{group.description}</td>
                                    <td className="px-4 py-2">{group.creator}</td>
                                    <td className="px-4 py-2">{group.sport}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => openEditModal(group)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGroup(group.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">No groups found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Popup thêm / chỉnh sửa nhóm */}
            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h2 className="text-xl font-bold mb-4">{modalType === "add" ? "Add New Group" : "Edit Group"}</h2>
                    {message && <p className="text-green-500">{message}</p>}
                    <input
                        type="text"
                        placeholder="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="p-2 border rounded w-full mb-2"
                    />
                    <textarea
                        placeholder="Description"
                        value={groupDesc}
                        onChange={(e) => setGroupDesc(e.target.value)}
                        className="p-2 border rounded w-full mb-4"
                    />
                    <select
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="p-2 border rounded w-full mb-4"
                    >
                        <option value="">Select Sport</option>
                        <option value="Running">Running</option>
                        <option value="Swimming">Swimming</option>
                        <option value="Cycling">Cycling</option>
                    </select>
                    <button
                        onClick={handleSaveGroup}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        {modalType === "add" ? "Add Group" : "Save Changes"}
                    </button>
                </Modal>
            )}
        </div>
    );
};

export default GroupManagement;
