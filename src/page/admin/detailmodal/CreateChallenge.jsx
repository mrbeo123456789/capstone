import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import { useCreateChallengeMutation, useGetChallengeTypesQuery } from "../../../service/challengeService.js";
import { FaWindowClose } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { challengeValidation } from "../../../utils/validation.js";
import { yupResolver } from "@hookform/resolvers/yup";
import RichTextEditor from "../../ui/RichTextEditor.jsx";

const ChallengeForm = () => {
    const [createChallenge, {isLoading, error}] = useCreateChallengeMutation();
    const {data: challengeTypes} = useGetChallengeTypesQuery();
    const navigate = useNavigate();
    const [preview, setPreview] = useState("");
    const [bannerPreview, setBannerPreview] = useState("");

    const today = new Date();
    const tomorrow = new Date();
    today.setDate(today.getDate() + 2);
    tomorrow.setDate(today.getDate() + 1);

    const getFormattedDate = (date) => date.toISOString().split('T')[0];

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        trigger,
        watch,
        formState: {errors, isValid}
    } = useForm({
        mode: "all",
        resolver: yupResolver(challengeValidation),
        defaultValues: {
            startDate: getFormattedDate(today),
            endDate: getFormattedDate(tomorrow),
            privacy: "PUBLIC",
            participationType: "INDIVIDUAL",
            isParticipate: true
        }
    });
    const isParticipating = watch("isParticipate", true);

    const onSubmit = async (data) => {
        if (!isValid) {
            const firstError = Object.values(errors)[0]?.message;
            console.log("firstError", firstError);
            toast.error(firstError || "Validation error. Please check your inputs.");
            return;
        }
        const formData = new FormData();
        const formatDate = (d) => {
            const date = new Date(d);
            const offset = date.getTimezoneOffset();
            date.setMinutes(date.getMinutes() - offset);
            return date.toISOString().split('T')[0];
        };
        const processed = {
            ...data,
            challengeTypeId: parseInt(data.challengeTypeId),
            isParticipate: String(data.isParticipate).toUpperCase() === "TRUE",
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
            privacy: "PUBLIC",
            participationType: "INDIVIDUAL",
            maxParticipants: parseInt(data.maxParticipants)
        };

        Object.keys(processed).forEach((key) => {
            const value = processed[key];
            if ((key === "picture" || key === "banner") && value) {
                formData.append(key, value);
            } else {
                formData.append(key, value !== undefined ? value : "");
            }
        });

        if (isValid) {
            try {
                await createChallenge(formData);
                toast.success("Challenge created successfully!");
                reset();
                setPreview(null);
                navigate("/admin/challengemanagement");
            } catch (err) {
                toast.error("Failed to create challenge: " + (err?.data?.message || "Unknown error"));
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setValue("picture", file, {shouldValidate: true});
        setPreview(URL.createObjectURL(file));
    };

    const onError = (errorList) => {
        const firstErrorMessage = Object.values(errorList)[0]?.message;
        if (firstErrorMessage) {
            toast.error(firstErrorMessage);
        } else {
            toast.error("Validation error. Please check your inputs.");
        }
    };

    const handleClosePreview = (e) => {
        e.stopPropagation();
        setPreview(null);
        setValue("avatar", null, {shouldValidate: true});
    };

    return (
        <div className="bg-white p-1 sm:p-6 w-full rounded-xl border-4 border-transparent">
            <div className="p-1 sm:p-6 flex flex-col">
                <h3 className="mb-4 text-xl font-bold">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="w-full mt-6">
                            <label className="text-sm font-medium">Challenge Name</label><span
                            className="text-red-500">*</span>
                            <input {...register("name")} placeholder="Enter challenge name"
                                   className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.name?.message}</p>
                        </div>
                        <div className="w-full mt-6">
                            <label className="text-sm font-medium">Summary</label>
                            <input {...register("summary")} placeholder="Brief summary of your challenge"
                                   className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.summary?.message}</p>
                        </div>
                        <div className="w-full mt-6">
                            <label className="text-sm font-medium">Banner</label>
                            <div className="relative w-full h-40 border-2 border-dashed rounded-lg bg-gray-50">
                                {bannerPreview ? (
                                    <>
                                        <img src={bannerPreview} className="w-full h-full object-cover rounded-lg"
                                             alt="Banner Preview"/>
                                        <button type="button" onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setBannerPreview(null);
                                            setValue("banner", null, {shouldValidate: true});
                                        }}
                                                className="absolute top-1 right-1 text-white bg-black/50 hover:bg-black/80 rounded-full p-1 z-10"
                                                title="Remove banner">
                                            <FaWindowClose className="text-lg"/>
                                        </button>
                                    </>
                                ) : (
                                    <label htmlFor="banner-upload"
                                           className="w-full h-full flex items-center justify-center cursor-pointer text-center text-gray-400">
                                        <div>
                                            <IoCloudUploadOutline className="text-3xl mx-auto mb-2"/>
                                            <p className="text-sm">Click to upload</p>
                                        </div>
                                    </label>
                                )}
                                <input id="banner-upload" type="file" accept="image/*" className="hidden"
                                       onChange={(e) => {
                                           const file = e.target.files[0];
                                           if (file) {
                                               setBannerPreview(URL.createObjectURL(file));
                                               setValue("banner", file, {shouldValidate: true});
                                           }
                                       }}/>
                            </div>
                        </div>
                    </div>
                    <label htmlFor="dropzone-file" className="relative group cursor-pointer md:m-2">
                        <label className="text-sm font-medium">Challenge Picture</label><span
                        className="text-red-500">*</span>
                        <div className="w-full h-[400px] flex items-center justify-center">
                            {preview && <FaWindowClose className="text-2xl absolute right-2 top-2 z-10"
                                                       onClick={handleClosePreview}/>}
                            {preview ? <img src={preview} className="w-full h-full object-cover rounded-lg"/> : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-gray-50">
                                    <IoCloudUploadOutline className="text-2xl"/>
                                    <p className="text-sm text-gray-500">Click to upload</p>
                                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                                </div>
                            )}
                        </div>
                        <p className="text-red-600">{errors.picture?.message}</p>
                    </label>
                    <input {...register("picture")} id="dropzone-file" type="file" className="hidden"
                           onChange={handleFileChange}/>
                </div>
            </div>
            <div className="bg-gradient-to-r from-red-700 to-blue-600 rounded-lg w-full p-px">
                <div className="bg-white flex flex-col rounded-lg shadow-md h-full"/>
            </div>
            <div className="rounded-lg w-full p-6">
                <h3 className="mb-4 text-xl font-bold">Challenge Details</h3>
                <form onSubmit={handleSubmit(onSubmit, onError)}>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Start Date</label><span
                            className="text-red-500">*</span>
                            <input type="date" {...register("startDate")} className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.startDate?.message}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">End Date</label><span
                            className="text-red-500">*</span>
                            <input type="date" {...register("endDate")} className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.endDate?.message}</p>
                        </div>

                        {/* Hidden inputs for privacy and participationType */}
                        <input type="hidden" {...register("privacy")} value="PUBLIC" />
                        <input type="hidden" {...register("participationType")} value="INDIVIDUAL" />

                        <div>
                            <label
                                className="text-sm font-medium block mb-1">Join this challenge?</label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked {...register("isParticipate")} />
                                Join this challenge as soon as it's created
                            </label>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Verification Type</label>
                            <select {...register("verificationType")} className="w-full p-2 border rounded-md">
                                <option value="MEMBER_REVIEW">Member Review</option>
                                <option value="HOST_REVIEW">Host Review</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Challenge Type</label>
                            <select {...register("challengeTypeId", {required: true})}
                                    className="w-full p-2 border rounded-md">
                                <option value="">Select Challenge Type</option>
                                {challengeTypes?.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            <p className="text-red-600">{errors.challengeTypeId?.message}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Maximum Participants</label><span
                            className="text-red-500">*</span>
                            <input type="number" {...register("maxParticipants")}
                                   className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.maxParticipants?.message}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Description</label><span
                        className="text-red-500">*</span>
                        <RichTextEditor onChange={(content) => {
                            setValue("description", content, {shouldValidate: true});
                            trigger("description");
                        }}/>
                        <input type="hidden" {...register("description")} />
                        <p className="text-red-600">{errors.description?.message}</p>
                    </div>

                    <div className="flex justify-center gap-6 mt-6">
                        <button type="submit" className="bg-red-600 px-6 py-2 rounded text-white hover:bg-red-700"
                                disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Challenge"}
                        </button>
                        <button type="button" className="bg-gray-500 px-6 py-2 rounded text-white hover:bg-gray-600"
                                onClick={() => reset()}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ChallengeForm;