import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreateChallengeMutation } from "../../service/challengeService.js";
import {FaWindowClose} from "react-icons/fa";
import {IoCloudUploadOutline} from "react-icons/io5";
import {challengeValidation} from "../../utils/validation.js";
import {yupResolver} from "@hookform/resolvers/yup";

const ChallengeForm = () => {
    const [createChallenge, { isLoading }] = useCreateChallengeMutation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("description");
    const [preview, setPreview] = useState("");
    const {register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        reset,
        trigger,
        formState:{ errors, isValid, isDirty}
    } = useForm({
            mode: "all",
            resolver: yupResolver(challengeValidation)});


    const onSubmit = async (data) => {
        try {
            const formattedData = {
                ...data,
                maxParticipants: parseInt(data.maxParticipants),
                challengeTypeId: parseInt(data.challengeTypeId),
            };
            console.log("Formatted Data:", formattedData);
            await createChallenge(formattedData);
            toast.success("Challenge created successfully!");
            reset();
            navigate("/challenges");
        } catch (err) {
            toast.error("Failed to create challenge: " + err.data?.message || "Unknown error");
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setValue("avatar", file,{ shouldValidate: true });// Đặt giá trị cho field avatar
        setPreview(URL.createObjectURL(file));
    };

    const handleClosePreview = (e)=>{
        e.stopPropagation()
        setPreview(null);
        setValue("avatar", null,{ shouldValidate: true });
    }

    return (
        <div className="bg-white p-6 h-full w-full relative box-border rounded-xl border-4 border-transparent z-[1]">
            {/* Left Section: Challenge Image & Basic Info */}
            <div className="rounded-lg w-full p-1">
                <div className="p-6 flex flex-col rounded-lg">
                    <h3 className="mb-4 text-xl font-bold text-red-600">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            {/* Challenge Name */}
                            <div className="w-full mt-6">
                                <label className="text-sm font-medium text-red-500">Challenge Name</label>
                                <input
                                    type="text"
                                    {...register("name", {required: "Challenge name is required"})}
                                    className="w-full text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Give it a short distinct name"
                                />
                                <p className="text-red-500">{errors.name?.message}</p>
                            </div>

                            {/* Privacy Status */}
                            <div>
                                <label className="text-sm font-medium text-red-600">Privacy</label>
                                <select {...register("privacy")} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                </select>
                            </div>

                            {/* Challenge Name */}
                            <div className="w-full mt-6">
                                <label className="text-sm font-medium text-red-500">Summary (Optional)</label>
                                <input
                                    type="text"
                                    {...register("name", {required: "Challenge name is required"})}
                                    className="w-full text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Add a few words under the name of the challenge to inspire guest, e.g ... An unforgettable challenge"
                                />
                                <p className="text-red-500">{errors.name?.message}</p>
                            </div>
                        </div>

                        {/* Challenge Image */}
                        <label htmlFor="dropzone-file"
                               className="relative group cursor-pointer flex items-center justify-center">
                            <div className="w-full h-[400px] flex items-center justify-center relative md:m-2">
                                {/* Close Button */}
                                {preview && (
                                    <FaWindowClose
                                        className="text-2xl text-red-500 absolute right-2 top-2 z-10"
                                        onClick={handleClosePreview}
                                        style={{cursor: "pointer", backgroundColor: "white"}}
                                    />
                                )}
                                {/* Avatar Image OR Placeholder */}
                                {preview ? (
                                    <img className="w-full h-full object-cover rounded-lg" src={preview}
                                         alt="Uploaded Avatar"/>
                                ) : (
                                    <div
                                        className="w-full h-full flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                                        <IoCloudUploadOutline className="text-2xl"/>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">SVG, PNG, JPG, or GIF (MAX. 800x400px)</p>
                                    </div>
                                )}
                                {/* Hover Overlay */}
                                {preview && (
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <span className="text-white font-semibold">Change Picture</span>
                                    </div>
                                )}
                            </div>
                        </label>
                        <input {...register("avatar")} id="dropzone-file" type="file" accept="image/*" className="hidden"
                               onChange={handleFileChange}/>
                    </div>

                </div>
            </div>

            {/* Right Section: Challenge Details Form */}
            <div className="bg-gradient-to-r from-red-700 to-orange-600 rounded-lg w-full p-px">
                <div className="bg-white flex flex-col rounded-lg shadow-md h-full">
                </div>
            </div>
            {/* Below Section: Challenge Details Form */}
            <div className="rounded-lg w-full p-1">
                <div className="flex flex-col rounded-lg p-6 h-full">
                    <h3 className="mb-4 text-xl font-bold text-red-600">Challenge Details</h3>
                    <form onSubmit={handleSubmit(onSubmit)} autoComplete="false">
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start & End Date */}
                            <div>
                                <label className="text-sm font-medium text-red-600">Start Date</label>
                                <input
                                    type="date"
                                    {...register("startDate", {required: "Start date is required"})}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <p className="text-red-500">{errors.startDate?.message}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-red-600">End Date</label>
                                <input
                                    type="date"
                                    {...register("endDate", {required: "End date is required" })}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <p className="text-red-500">{errors.endDate?.message}</p>
                            </div>



                            {/* Verification Type */}
                            <div>
                                <label className="text-sm font-medium text-red-600">Verification Type</label>
                                <select {...register("verificationType")} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                    <option value="PEER_TO_PEER">Peer to Peer</option>
                                    <option value="CROSS_CHECK">Cross Check</option>
                                    <option value="AI_REVIEW">AI Review</option>
                                </select>
                            </div>

                            {/* Verification Method */}
                            <div>
                                <label className="text-sm font-medium text-red-600">Verification Method</label>
                                <select {...register("verificationMethod")} className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                    <option value="UPLOAD_MEDIA">Upload Media</option>
                                    <option value="CHECKMARK">Checkmark</option>
                                </select>
                            </div>

                            {/* Max Participants */}
                            <div>
                                <label className="text-sm font-medium text-red-600">Max Participants</label>
                                <input
                                    type="number"
                                    {...register("maxParticipants", { required: "Enter max participants" })}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <p className="text-red-500">{errors.maxParticipants?.message}</p>
                            </div>

                            {/* Challenge Type ID */}
                            <div>
                                <label className="text-sm font-medium text-red-600">Challenge Type ID</label>
                                <input
                                    type="number"
                                    {...register("challengeTypeId", { required: "Challenge Type ID is required" })}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <p className="text-red-500">{errors.challengeTypeId?.message}</p>
                            </div>
                        </div>

                        {/* Tabs Section */}
                        <div className="flex mt-4 border-b-2 border-gray-600">
                            <button
                                type="button"
                                className={`flex-1 p-2 text-center font-bold ${activeTab === "description" ? "bg-blue-400 text-white" : "hover:bg-gray-600 text-gray-300"}`}
                                onClick={() => setActiveTab("description")}>
                                Description
                            </button>
                            <button
                                type="button"
                                className={`flex-1 p-2 text-center font-bold ${activeTab === "rules" ? "bg-blue-400 text-white" : "hover:bg-gray-600 text-gray-300"}`}
                                onClick={() => setActiveTab("rules")}>
                                Rules
                            </button>
                        </div>

                        {/* Description & Rules Section */}
                        <div className="p-4 text-white rounded-lg mt-4 h-24">
                            {activeTab === "description" ? (
                                <textarea {...register("description")} className="w-full p-2 rounded-lg" placeholder="Enter challenge description..." />
                            ) : (
                                <textarea {...register("rule")} className="w-full-700 p-2 rounded-lg" placeholder="Enter challenge rules..." />
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-6 mt-6">
                            <button type="submit" className="bg-red-600 px-6 py-2 rounded text-white hover:bg-red-700" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create"}
                            </button>
                            <button type="button" className="bg-gray-500 px-6 py-2 rounded text-white hover:bg-gray-600" onClick={() => reset()}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChallengeForm;
