import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import { useCreateChallengeMutation, useGetChallengeTypesQuery } from "../../service/challengeService.js";
import { FaWindowClose } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { challengeValidation } from "../../utils/validation.js";
import { yupResolver } from "@hookform/resolvers/yup";
import RichTextEditor from "../ui/RichTextEditor.jsx";
import { useTranslation } from "react-i18next";

const CreateChallenge = () => {
    const { t } = useTranslation();
    const [createChallenge, { isLoading , error}] = useCreateChallengeMutation();
    const { data: challengeTypes } = useGetChallengeTypesQuery();
    const navigate = useNavigate();
    const [preview, setPreview] = useState("");
    const [bannerPreview, setBannerPreview] = useState("");
    const [participationType, setParticipationType] = useState("INDIVIDUAL");

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
        formState: { errors, isValid }
    } = useForm({
        mode: "all",
        resolver: yupResolver(challengeValidation),
        defaultValues: {
            startDate: getFormattedDate(today),
            endDate: getFormattedDate(tomorrow)
        }
    });

    const onSubmit = async (data) => {
        if (!isValid) {
            const firstError = Object.values(errors)[0]?.message;
            console.log("firstError", firstError);
            toast.error(firstError || t("createChallenge.validationError"));
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
            maxParticipants: parseInt(data.maxParticipants),
            challengeTypeId: parseInt(data.challengeTypeId),
            isParticipate: String(data.isParticipate).toUpperCase() === "TRUE",
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate)
        };
        if (participationType === "GROUP") {
            processed.maxGroups = parseInt(data.maxParticipants); // ✅ map correctly for GROUP
            processed.maxMembersPerGroup = parseInt(data.maxMembersPerGroup);
        } else {
            // For INDIVIDUAL keep maxParticipants as is
            processed.maxParticipants = parseInt(data.maxParticipants);
        }
        Object.keys(processed).forEach((key) => {
            if ((key === "picture" || key === "banner") && processed[key]) {
                formData.append(key, processed[key]);
            } else {
                formData.append(key, processed[key] ?? "");
            }
        });

        if (isValid) {
            try {
                await createChallenge(formData);
                console.log("createChallenge created");
                toast.success(t("createChallenge.success"));
                reset();
                setPreview(null);
                navigate("/challenges/joins");
            } catch (error) {
                toast.error(t("createChallenge.fail") + (err?.data?.message || "Unknown error"));
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setValue("picture", file, { shouldValidate: true });
        setPreview(URL.createObjectURL(file));
    };

    const onError = (errorList) => {
        const firstErrorMessage = Object.values(errorList)[0]?.message;
        if (firstErrorMessage) {
            toast.error(firstErrorMessage);
        } else {
            toast.error(t("createChallenge.validationError"));
        }
    };

    const handleClosePreview = (e) => {
        e.stopPropagation();
        setPreview(null);
        setValue("avatar", null, { shouldValidate: true });
    };

    return (
        <div className="bg-white p-1 sm:p-6 w-full rounded-xl border-4 border-transparent">
            <div className="p-1 sm:p-6 flex flex-col">
                <h3 className="mb-4 text-xl font-bold">{t("createChallenge.generalInfo")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="w-full mt-6">
                            <label className="text-sm font-medium">{t("createChallenge.name")}</label><span
                            className="text-red-500">*</span>
                            <input {...register("name")} placeholder={t("createChallenge.namePlaceholder")}
                                   className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.name?.message}</p>
                        </div>
                        <div className="w-full mt-6">
                            <label className="text-sm font-medium">{t("createChallenge.summary")}</label>
                            <input {...register("summary")} placeholder={t("createChallenge.summaryPlaceholder")}
                                   className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.summary?.message}</p>
                        </div>
                        <div className="w-full mt-6">
                            <label className="text-sm font-medium">{t("createChallenge.banner")}</label>
                            <div className="relative w-full h-40 border-2 border-dashed rounded-lg bg-gray-50">
                                {bannerPreview ? (
                                    <>
                                        <img
                                            src={bannerPreview}
                                            className="w-full h-full object-cover rounded-lg"
                                            alt="Banner Preview"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault(); // ✅ quan trọng
                                                setBannerPreview(null);
                                                setValue("banner", null, {shouldValidate: true});
                                            }}
                                            className="absolute top-1 right-1 text-white bg-black/50 hover:bg-black/80 rounded-full p-1 z-10"
                                            title="Remove banner"
                                        >
                                            <FaWindowClose className="text-lg"/>
                                        </button>
                                    </>
                                ) : (
                                    <label
                                        htmlFor="banner-upload"
                                        className="w-full h-full flex items-center justify-center cursor-pointer text-center text-gray-400"
                                    >
                                        <div>
                                            <IoCloudUploadOutline className="text-3xl mx-auto mb-2"/>
                                            <p className="text-sm">{t("createChallenge.clickUpload")}</p>
                                        </div>
                                    </label>
                                )}
                                <input
                                    id="banner-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setBannerPreview(URL.createObjectURL(file));
                                            setValue("banner", file, {shouldValidate: true});
                                        }
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                    <label htmlFor="dropzone-file" className="relative group cursor-pointer md:m-2">
                        <label className="text-sm font-medium">{t("createChallenge.picture")}</label><span
                        className="text-red-500">*</span>
                        <div className="w-full h-[400px] flex items-center justify-center">
                            {preview && <FaWindowClose className="text-2xl absolute right-2 top-2 z-10"
                                                       onClick={handleClosePreview}/>}
                            {preview ? <img src={preview} className="w-full h-full object-cover rounded-lg"/> : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-gray-50">
                                    <IoCloudUploadOutline className="text-2xl"/>
                                    <p className="text-sm text-gray-500">{t("createChallenge.clickUpload")}</p>
                                    <p className="text-xs text-gray-500">{t("createChallenge.pictureNote")}</p>
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
                <div className="bg-white flex flex-col rounded-lg shadow-md h-full">
                </div>
            </div>
            <div className="rounded-lg w-full p-6">
                <h3 className="mb-4 text-xl font-bold">{t("createChallenge.details")}</h3>
                <form onSubmit={handleSubmit(onSubmit, onError)}>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">{t("createChallenge.startDate")}</label><span
                            className="text-red-500">*</span>
                            <input type="date" {...register("startDate")} className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.startDate?.message}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t("createChallenge.endDate")}</label><span
                            className="text-red-500">*</span>
                            <input type="date" {...register("endDate")} className="w-full p-2 border rounded-md"/>
                            <p className="text-red-600">{errors.endDate?.message}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">{t("createChallenge.privacy")}</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="PUBLIC"
                                        {...register("privacy")}
                                        defaultChecked
                                    />
                                    {t("public")}
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value="PRIVATE"
                                        {...register("privacy")}
                                    />
                                    {t("private")}
                                </label>
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium block mb-1">{t("createChallenge.isParticipate")}</label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    {...register("isParticipate")}
                                />
                                {t("createChallenge.joinCheckbox")}
                            </label>
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t("createChallenge.verificationType.label")}</label>
                            <select {...register("verificationType")} className="w-full p-2 border rounded-md">
                                <option
                                    value="MEMBER_REVIEW">{t("createChallenge.verificationType.memberReview")}</option>
                                <option value="HOST_REVIEW">{t("createChallenge.verificationType.hostReview")}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                {t("createChallenge.participationType.label")}
                            </label>
                            <select
                                {...register("participationType")}
                                onChange={(e) => {
                                    setParticipationType(e.target.value);
                                    setValue("participationType", e.target.value, {shouldValidate: true});
                                }}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="INDIVIDUAL">{t("createChallenge.participationType.individual")}</option>
                                <option value="GROUP">{t("createChallenge.participationType.group")}</option>
                            </select>

                        </div>
                        <div>
                            <label className="text-sm font-medium">{t("createChallenge.challengeType")}</label>
                            <select {...register("challengeTypeId", {required: true})}
                                    className="w-full p-2 border rounded-md">
                                <option value="">{t("createChallenge.selectChallengeType")}</option>
                                {challengeTypes?.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            <p className="text-red-600">{errors.challengeTypeId?.message}</p>
                        </div>
                        {participationType === "INDIVIDUAL" && (
                            <div>
                                <label
                                    className="text-sm font-medium">{t("createChallenge.maxParticipants")}</label><span
                                className="text-red-500">*</span>
                                <input
                                    type="number"
                                    {...register("maxParticipants")}
                                    className="w-full p-2 border rounded-md"
                                />
                                <p className="text-red-600">{errors.maxParticipants?.message}</p>
                            </div>
                        )}

                        {participationType === "GROUP" && (
                            <>
                                <div>
                                    <label className="text-sm font-medium">{t("createChallenge.maxGroups")}</label><span
                                    className="text-red-500">*</span>
                                    <input
                                        type="number"
                                        {...register("maxParticipants")}
                                        className="w-full p-2 border rounded-md"
                                    />
                                    <p className="text-red-600">{errors.maxParticipants?.message}</p>
                                </div>
                                <div>
                                    <label
                                        className="text-sm font-medium">{t("createChallenge.maxMembersPerGroup")}</label><span
                                    className="text-red-500">*</span>
                                    <input
                                        type="number"
                                        {...register("maxMembersPerGroup")}
                                        className="w-full p-2 border rounded-md"
                                    />
                                    <p className="text-red-600">{errors.maxMembersPerGroup?.message}</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">{t("createChallenge.description")}</label><span
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
                            {isLoading ? t("createChallenge.creating") : t("createChallenge.create")}
                        </button>
                        <button type="button" className="bg-gray-500 px-6 py-2 rounded text-white hover:bg-gray-600"
                                onClick={() => reset()}>
                            {t("createChallenge.cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChallenge;