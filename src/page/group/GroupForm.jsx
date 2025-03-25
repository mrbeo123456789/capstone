import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoPeopleSharp } from "react-icons/io5";
import MemberListPopup from "../ui/MemberListPopup.jsx";
import {useCreateGroupMutation} from "../../service/groupService.js";
import toast from "react-hot-toast";

const GroupForm = () => {
    const [preview, setPreview] = useState("");
    const [showMemberList, setShowMemberList] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        mode: "all",
    });

    const [createGroup, { isLoading }] = useCreateGroupMutation();

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            // Append basic fields
            formData.append("name", data.name);
            formData.append("maxParticipants", parseInt(data.maxParticipants));
            formData.append("privacy", data.privacy);
            formData.append("description", data.description);

            // Append file if exists
            if (data.picture) {
                formData.append("picture", data.picture);
            }

            console.log("Submitting FormData:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }

            // Call API
            await createGroup(formData).unwrap();

            toast.success("Group Created Successfully!");
            reset();
            setPreview("");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create group!");
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setValue("picture", file, { shouldValidate: true });
        setPreview(URL.createObjectURL(file));
    };

    const handleClosePreview = (e) => {
        e.stopPropagation();
        setPreview(null);
        setValue("picture", null, { shouldValidate: true });
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg w-full p-1">
                <div className="p-6 flex flex-col rounded-lg">
                    <h3 className="mb-4 text-xl font-bold text-red-600">Group Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            {/* Group Name */}
                            <div className="w-full mb-4">
                                <label className="text-sm font-medium text-red-500">Group Name</label>
                                <input
                                    type="text"
                                    {...register("name", { required: "Group name is required" })}
                                    className="w-full text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Enter group name"
                                />
                                <p className="text-red-500">{errors.name?.message}</p>
                            </div>

                            {/* Max Participants */}
                            <div className="w-full mb-4">
                                <label className="text-sm font-medium text-red-500">Max Participants</label>
                                <input
                                    type="number"
                                    {...register("maxParticipants", { required: "Max participants required" })}
                                    className="w-full text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Enter max participants"
                                />
                                <p className="text-red-500">{errors.maxParticipants?.message}</p>
                            </div>

                            {/* Privacy */}
                            <div className="w-full mb-4">
                                <label className="text-sm font-medium text-red-500">Privacy</label>
                                <select
                                    {...register("privacy")}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="w-full mb-4">
                                <label className="text-sm font-medium text-red-500">Description</label>
                                <textarea
                                    {...register("description")}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Describe the group"
                                />
                            </div>

                            {/* Member List Button */}
                            <button
                                type="button"
                                onClick={() => setShowMemberList(true)}
                                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                <IoPeopleSharp className="mr-2" /> Add Members
                            </button>
                        </div>

                        {/* Group Image */}
                        <label htmlFor="group-image" className="relative group cursor-pointer flex items-center justify-center">
                            <div className="w-full h-[400px] flex items-center justify-center relative m-2">
                                {preview && (
                                    <FaWindowClose
                                        className="text-2xl text-red-500 absolute right-2 top-2 z-10"
                                        onClick={handleClosePreview}
                                        style={{ cursor: "pointer", backgroundColor: "white" }}
                                    />
                                )}
                                {preview ? (
                                    <img className="w-full h-full object-cover rounded-lg" src={preview} alt="Group Avatar" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                                        <IoCloudUploadOutline className="text-2xl" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">SVG, PNG, JPG, or GIF (MAX. 800x400px)</p>
                                    </div>
                                )}
                                {preview && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <span className="text-white font-semibold">Change Picture</span>
                                    </div>
                                )}
                            </div>
                        </label>
                        <input
                            {...register("picture")}
                            id="group-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-6 mt-6">
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            className="bg-red-600 px-6 py-2 rounded text-white hover:bg-red-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "Create Group"}
                        </button>

                        <button
                            type="button"
                            className="bg-gray-500 px-6 py-2 rounded text-white hover:bg-gray-600"
                            onClick={() => reset()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Member List Popup */}
            {showMemberList && <MemberListPopup onClose={() => setShowMemberList(false)} />}
        </div>
    );
};

export default GroupForm;
