import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {useCreateChallengeMutation, useGetChallengeTypesQuery} from "../../../service/challengeService.js";
import {FaWindowClose} from "react-icons/fa";
import {IoCloudUploadOutline} from "react-icons/io5";
import {challengeValidation} from "../../../utils/validation.js";
import {yupResolver} from "@hookform/resolvers/yup";
import RichTextEditor from "../../ui/RichTextEditor.jsx";

const ChallengeForm = () => {
    const [createChallenge, { isLoading }] = useCreateChallengeMutation();
    const { data: challengeTypes, challengeTypeLoading, isError } = useGetChallengeTypesQuery();

    const navigate = useNavigate();
    const [preview, setPreview] = useState("");
    const [bannerPreview, setBannerPreview] = useState("");

    const today = new Date();
    const tomorrow = new Date();
    today.setDate(today.getDate() + 1);
    tomorrow.setDate(today.getDate() + 1);

    const getFormattedDate = (date) => {
        return date.toISOString().split('T')[0]; // get YYYY-MM-DD part
    };

    // Find the "Other" challenge type ID when data is available
    const getOtherChallengeTypeId = () => {
        if (challengeTypes && challengeTypes.length > 0) {
            const otherType = challengeTypes.find(type => type.name === "Other");
            return otherType ? otherType.id.toString() : "";
        }
        return "";
    };

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
        resolver: yupResolver(challengeValidation),
        defaultValues: {
            startDate: getFormattedDate(today),
            endDate: getFormattedDate(tomorrow),
            privacy: "PUBLIC", // Always set default privacy to PUBLIC
            verificationType: "MEMBER_REVIEW", // Setting default verification type
            maxParticipants: "2" // Set minimum participants to 2
        }
    });

    // Set the challenge type to "Other" when data is loaded
    useState(() => {
        if (challengeTypes) {
            const otherTypeId = getOtherChallengeTypeId();
            if (otherTypeId) {
                setValue("challengeTypeId", otherTypeId, { shouldValidate: true });
            }
        }
    }, [challengeTypes]);

    const onSubmit = async (data) => {
        const formData = new FormData();

        // Format date fields
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const offset = date.getTimezoneOffset();
            date.setMinutes(date.getMinutes() - offset);
            return date.toISOString().split('T')[0];
        };

        // Pre-process
        const processedData = {
            ...data,
            privacy: "PUBLIC", // Always use PUBLIC for privacy
            verificationType: "MEMBER_REVIEW", // Always use MEMBER_REVIEW for verification type
            maxParticipants: parseInt(data.maxParticipants),
            challengeTypeId: parseInt(data.challengeTypeId),
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
        };

        // Append all fields dynamically
        Object.keys(processedData).forEach((key) => {
            if (key === "picture" || key === "banner") {
                if (processedData[key]) {
                    formData.append(key, processedData[key]); // File
                }
            } else {
                formData.append(key, processedData[key] ?? ""); // Avoid null/undefined
            }
        });

        if (isValid) {
            const toastId = toast.loading("Creating challenge...");
            try {
                console.log("Submitting FormData...");
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ": ", pair[1]);
                }

                await createChallenge(formData).unwrap();
                toast.success("Challenge created successfully!", { id: toastId });
                reset();
                setPreview(null);
                // Navigate to challenge list page
                navigate("/admin/challengemanagement");
            } catch (err) {
                console.log(err);
                toast.error("Failed to create challenge: " + (err?.data?.message || "Unknown error"), { id: toastId });
            }
        }
    };

    const handleCancel = () => {
        // Navigate to challenge list page when canceling
        console.log("Canceling challenge...");
        navigate(-1);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setValue("picture", file,{ shouldValidate: true });// Set value for picture field
        setPreview(URL.createObjectURL(file));
    };

    const handleClosePreview = (e)=>{
        e.stopPropagation()
        setPreview(null);
        setValue("avatar", null,{ shouldValidate: true });
    }

    const handleEditorChange = (content) => {
        setValue("description", content, { shouldValidate: true });
    };

    return (
        <div className="bg-white p-6 h-full w-full relative box-border rounded-xl border-4 border-transparent z-[1]">
            {/* Left Section: Challenge Image & Basic Info */}
            <div className="rounded-lg w-full p-1">
                <div className="p-6 flex flex-col rounded-lg">
                    <h3 className="mb-4 text-xl font-bold">Challenge's General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            {/* Challenge Name */}
                            <div className="w-full mt-6">
                                <label className="text-sm font-medium">Challenge Name</label>
                                <span className="text-red-500">*</span>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className="w-full text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Give it a short distinct name"
                                />
                                <p className="text-red-600">{errors.name?.message}</p>
                            </div>

                            {/* Challenge Summary */}
                            <div className="w-full mt-6">
                                <label className="text-sm font-medium">Summary (Optional)</label>
                                <input
                                    type="text"
                                    {...register("summary")}
                                    className="w-full text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Add a few words under the name of the challenge to inspire guest, e.g ... An unforgettable challenge"
                                />
                                <p className="text-red-600">{errors.summary?.message}</p>
                            </div>
                            {/* Banner Upload */}
                            <div className="w-full mt-6">
                                <label className="text-sm font-medium">Banner (Optional)</label>
                                <label htmlFor="banner-upload" className="relative group cursor-pointer flex items-center justify-center">
                                    <div className="w-full h-40 flex items-center justify-center relative border-2 border-dashed rounded-lg bg-gray-50">
                                        {bannerPreview ? (
                                            <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <IoCloudUploadOutline className="text-3xl mx-auto mb-2" />
                                                <p className="text-sm">Click to upload Banner Image</p>
                                            </div>
                                        )}
                                    </div>
                                </label>
                                <input
                                    id="banner-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setBannerPreview(URL.createObjectURL(file));
                                            setValue("banner", file, { shouldValidate: true });
                                        }
                                    }}
                                />
                                <input type="hidden" {...register("banner")} />
                            </div>

                        </div>

                        {/* Challenge Image */}
                        <label htmlFor="dropzone-file"
                               className="relative group cursor-pointer items-center justify-center md:m-2">
                            <label className="text-sm font-medium">Add a picture</label>
                            <span className="text-red-500">*</span>
                            <div className="w-full h-[400px] flex items-center justify-center relative">
                                {/* Close Button */}
                                {preview && (
                                    <FaWindowClose
                                        className="text-2xl absolute right-2 top-2 z-10"
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
                            <p className="text-red-600">{errors.picture?.message}</p>
                        </label>
                        <input {...register("picture")} id="dropzone-file" type="file" accept="image/*"
                               className="hidden"
                               onChange={handleFileChange}/>
                    </div>
                </div>
            </div>

            {/* Right Section: Challenge Details Form */}
            <div className="bg-gradient-to-r from-red-700 to-blue-600 rounded-lg w-full p-px">
                <div className="bg-white flex flex-col rounded-lg shadow-md h-full">
                </div>
            </div>
            {/* Below Section: Challenge Details Form */}
            <div className="rounded-lg w-full p-1">
                <div className="flex flex-col rounded-lg p-6 h-full">
                    <h3 className="mb-4 text-xl font-bold">Challenge Details</h3>

                    <form onSubmit={handleSubmit(onSubmit)} autoComplete="false">
                        {/* Hidden input for privacy - always set to PUBLIC */}
                        <input type="hidden" {...register("privacy")} value="PUBLIC" />
                        {/* Hidden input for verification type - always set to MEMBER_REVIEW */}
                        <input type="hidden" {...register("verificationType")} value="MEMBER_REVIEW" />
                        {/* Hidden input for challenge type - set to Other */}
                        <input type="hidden" {...register("challengeTypeId")} value={getOtherChallengeTypeId()} />

                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start & End Date */}
                            <div>
                                <label className="text-sm font-medium">Start Date</label>
                                <span className="text-red-500">*</span>
                                <input
                                    type="date"
                                    {...register("startDate")}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <p className="text-red-600">{errors.startDate?.message}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Date</label>
                                <span className="text-red-500">*</span>
                                <input
                                    type="date"
                                    {...register("endDate")}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <p className="text-red-600">{errors.endDate?.message}</p>
                            </div>

                            {/* Participation Type */}
                            <div>
                                <label className="text-sm font-medium">Participation Type</label>
                                <select {...register("participationType")}
                                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                    <option value="INDIVIDUAL">Individual</option>
                                    <option value="GROUP">Group</option>
                                </select>
                            </div>

                            {/* Max Participants (with min value of 2) */}
                            <div>
                                <label className="text-sm font-medium">Max Participants</label>
                                <span className="text-red-500">*</span>
                                <input
                                    type="number"
                                    min="2"
                                    {...register("maxParticipants")}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <p className="text-red-600">{errors.maxParticipants?.message}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <span className="text-red-500">*</span>
                            <RichTextEditor
                                onChange={(content) => {
                                    setValue("description", content, {shouldValidate: true});
                                    trigger("description"); // Optional: trigger validation
                                }}
                            />
                            <input type="hidden" {...register("description")} />
                            <p className="text-red-600">{errors.description?.message}</p>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-6 mt-6">
                            <button type="submit" className="bg-red-600 px-6 py-2 rounded text-white hover:bg-red-700"
                                    disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create"}
                            </button>
                            <button
                                type="button"
                                className="bg-gray-500 px-6 py-2 rounded text-white hover:bg-gray-600"
                                onClick={handleCancel}>
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