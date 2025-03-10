import React, { useState } from "react";
import {
    useGetGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation
} from "../../service/groupService";
import Modal from "../../component/Modal.jsx";

const GroupManagement = () => {
    const { data: groups, isLoading, isError, error } = useGetGroupsQuery();
    const [createGroup] = useCreateGroupMutation();
    const [updateGroup] = useUpdateGroupMutation();
    const [deleteGroup] = useDeleteGroupMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("add"); // "add" or "edit"
    const [groupId, setGroupId] = useState(null);
    const [groupName, setGroupName] = useState("");
    const [groupDesc, setGroupDesc] = useState("");
    const [groupRules, setGroupRules] = useState("");
    const [groupImage, setGroupImage] = useState(null);
    const [activeTab, setActiveTab] = useState("description"); // Tabs: Description & Rules
    const [message, setMessage] = useState("");

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGroupImage(URL.createObjectURL(file));
        }
    };

    const openAddModal = () => {
        setModalType("add");
        setGroupId(null);
        setGroupName("");
        setGroupDesc("");
        setGroupRules("");
        setGroupImage(null);
        setActiveTab("description");
        setIsModalOpen(true);
    };

    const openEditModal = (group) => {
        setModalType("edit");
        setGroupId(group.id);
        setGroupName(group.name);
        setGroupDesc(group.description);
        setGroupRules(group.rules || "");
        setGroupImage(group.image || null);
        setActiveTab("description");
        setIsModalOpen(true);
    };

    const handleSaveGroup = async () => {
        if (!groupName) {
            setMessage("Group name is required.");
            return;
        }
        try {
            if (modalType === "add") {
                await createGroup({
                    name: groupName,
                    description: groupDesc,
                    rules: groupRules,
                    image: groupImage
                });
                setMessage("Group created successfully.");
            } else {
                await updateGroup({
                    id: groupId,
                    name: groupName,
                    description: groupDesc,
                    rules: groupRules,
                    image: groupImage
                });
                setMessage("Group updated successfully.");
            }
            setIsModalOpen(false);
        } catch (err) {
            setMessage("Failed to save group.");
        }
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-red-500">Group Management</h1>
                <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    onClick={openAddModal}
                >
                    Add Group
                </button>
            </div>

            <div className="bg-black shadow-lg rounded p-4 border border-red-600">
                <h2 className="text-xl font-semibold text-red-400 mb-2">Groups</h2>
                {isLoading ? (
                    <p>Loading groups...</p>
                ) : isError ? (
                    <p>Error: {error.error || error.status}</p>
                ) : (
                    <table className="w-full table-auto">
                        <thead>
                        <tr className="bg-red-800 text-white">
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Member</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {groups?.length > 0 ? (
                            groups.map((group) => (
                                <tr key={group.id} className="border-t border-gray-700">
                                    <td className="px-4 py-2">{group.id}</td>
                                    <td className="px-4 py-2">{group.name}</td>
                                    <td className="px-4 py-2">{group.members}</td>
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
                                <td colSpan="3" className="text-center py-4">No groups found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <Modal>
                    <div className="bg-black text-white border border-red-600 rounded-lg p-6 shadow-xl relative">
                        <h2 className="text-xl font-bold text-center mb-4 text-red-500">
                            {modalType === "add" ? "Create Group" : "Edit Group"}
                        </h2>

                        <div className="flex items-center space-x-4 mb-3">
                            <label className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer border border-red-600">
                                {groupImage ? (
                                    <img src={groupImage} alt="Group" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <span className="text-red-500">📷</span>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>

                            <input
                                type="text"
                                placeholder="Group Name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full p-3 border border-red-600 bg-gray-900 text-white rounded-md focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="flex mt-4 border-b border-red-600">
                            <button
                                className={`px-4 py-2 ${
                                    activeTab === "description"
                                        ? "border-b-2 border-red-500 text-red-500"
                                        : "text-gray-400"
                                }`}
                                onClick={() => setActiveTab("description")}
                            >
                                Description
                            </button>
                            <button
                                className={`px-4 py-2 ${
                                    activeTab === "rules"
                                        ? "border-b-2 border-red-500 text-red-500"
                                        : "text-gray-400"
                                }`}
                                onClick={() => setActiveTab("rules")}
                            >
                                Rules
                            </button>
                        </div>

                        <textarea
                            placeholder={activeTab === "description" ? "Enter description..." : "Enter rules..."}
                            value={activeTab === "description" ? groupDesc : groupRules}
                            onChange={(e) =>
                                activeTab === "description" ? setGroupDesc(e.target.value) : setGroupRules(e.target.value)
                            }
                            className="w-full p-3 border border-red-600 bg-gray-900 text-white rounded-md focus:ring-2 focus:ring-red-500 mb-3"
                        />

                        {/* Buttons - Căn phải, cùng một dòng */}
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveGroup}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                            >
                                {modalType === "add" ? "Create" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default GroupManagement;
