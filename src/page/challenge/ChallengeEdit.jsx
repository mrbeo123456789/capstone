import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import {
    useGetChallengeDetailQuery,
    useGetChallengeTypesQuery,
    useUpdateChallengeMutation,
} from "../../service/challengeService.js";
import { editChallengeValidation } from "../../utils/validation.js";
import RichTextEditor from "../ui/RichTextEditor.jsx";
import { IoCloudUploadOutline } from "react-icons/io5";
import { FaWindowClose } from "react-icons/fa";

const ChallengeEdit = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: detail } = useGetChallengeDetailQuery(id);
    const { data: challengeTypes = [] } = useGetChallengeTypesQuery();
    const [updateChallenge, { isLoading: isUpdating }] = useUpdateChallengeMutation();

    const [preview, setPreview] = useState("");
    const [bannerPreview, setBannerPreview] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        trigger,
        formState: { errors },
    } = useForm({
        mode: "onBlur",
        resolver: yupResolver(editChallengeValidation),
    });
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (detail && challengeTypes.length > 0) {
            const matchedType = challengeTypes.find(ct => ct.name === detail.challengeType);
            const challengeTypeId = matchedType?.id ?? "";

            const {
                name, summary, description, picture, banner,
                startDate, endDate, privacy, verificationType,
                participationType, maxParticipants
            } = detail;

            setPreview(picture);
            setBannerPreview(banner);
            setDescription(description); // for TinyMCE
            setValue("description", description); // 👈 sync with react-hook-form
            trigger("description"); // 👈 optional

            reset({
                name,
                summary,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                privacy,
                verificationType,
                participationType,
                challengeTypeId,
                maxParticipants,
            });
        }
    }, [detail, challengeTypes, reset, setValue, trigger]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-CA"); // always safe "YYYY-MM-DD"
    };


    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);

        if (type === "picture") {
            setPreview(url);
            setValue("picture", file, { shouldValidate: true });
        } else {
            setBannerPreview(url);
            setValue("banner", file, { shouldValidate: true });
        }
    };

    const handleClosePreview = (type) => {
        if (type === "picture") {
            setPreview("");
            setValue("picture", null);
        } else {
            setBannerPreview("");
            setValue("banner", null);
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();

        const formattedStartDate = formatDate(data.startDate);
        const formattedEndDate = formatDate(data.endDate);

        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("summary", data.summary);
        formData.append("startDate", formattedStartDate);
        formData.append("endDate", formattedEndDate);
        formData.append("privacy", data.privacy);
        formData.append("verificationType", data.verificationType);
        formData.append("participationType", data.participationType);
        formData.append("challengeTypeId", data.challengeTypeId);
        formData.append("maxParticipants", data.maxParticipants);

        // Handle picture / banner (new file or reuse)
        if (data.picture instanceof File) {
            formData.append("picture", data.picture);
        } else if (preview) {
            formData.append("pictureUrl", preview);
        }

        if (data.banner instanceof File) {
            formData.append("banner", data.banner);
        } else if (bannerPreview) {
            formData.append("bannerUrl", bannerPreview);
        }

        try {
            await updateChallenge({ id, formData });
            toast.success(t("createChallenge.successUpdate"));
            navigate("/challenges/joins");
        } catch (e) {
            toast.error(e?.data?.message || t("createChallenge.fail"));
        }
    };

    const onError = (errorList) => {
        const firstError = Object.values(errorList)[0]?.message;
        toast.error(firstError || t("createChallenge.validationError"));
    };

    return (
        <div className="bg-white p-1 sm:p-6 w-full rounded-xl border-4 border-transparent">
            <form onSubmit={handleSubmit(onSubmit, onError)}>
                <h2 className="text-xl font-bold mb-4">{t("createChallenge.editTitle")}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label>{t("createChallenge.name")}*</label>
                        <input {...register("name")} className="w-full p-2 border rounded"/>
                        <p className="text-red-600">{errors.name?.message}</p>

                        <label>{t("createChallenge.summary")}</label>
                        <input {...register("summary")} className="w-full p-2 border rounded"/>

                        <label>{t("createChallenge.banner")}</label>
                        <label htmlFor="banner-upload"
                               className="relative h-40 border-2 border-dashed rounded bg-gray-100 flex justify-center items-center cursor-pointer">
                            {bannerPreview ? (
                                <>
                                    <img src={bannerPreview} alt="Banner Preview"
                                         className="h-full w-full object-cover rounded"/>
                                    <FaWindowClose onClick={(e) => {
                                        e.stopPropagation(); // tránh trigger mở file khi đóng preview
                                        handleClosePreview("banner");
                                    }} className="absolute top-2 right-2 text-xl text-red-500 cursor-pointer"/>
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <IoCloudUploadOutline className="text-2xl mx-auto mb-2"/>
                                    <p>{t("createChallenge.clickUpload")}</p>
                                </div>
                            )}
                        </label>
                        <input
                            {...register("banner")}
                            id="banner-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "banner")}
                        />

                    </div>

                    <label htmlFor="dropzone-file" className="relative group cursor-pointer md:m-2">
                        <label className="text-sm font-medium">{t("createChallenge.picture")}</label>
                        <span className="text-red-500">*</span>
                        <div className="w-full h-[400px] flex items-center justify-center">
                            {preview && (
                                <FaWindowClose className="text-2xl absolute right-2 top-2 z-10"
                                               onClick={() => handleClosePreview("picture")}/>
                            )}
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover rounded-lg"/>
                            ) : (
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
                    <input
                        {...register("picture")}
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "picture")}
                    />
                </div>
                <div className="bg-gradient-to-r from-red-700 to-blue-600 rounded-lg w-full p-px">
                    <div className="bg-white flex flex-col rounded-lg shadow-md h-full">
                    </div>
                </div>
                {/* Challenge Detail Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div>
                        <label>{t("createChallenge.startDate")}</label>
                        <input type="date" {...register("startDate")} className="w-full p-2 border rounded"/>
                        <p className="text-red-600">{errors.startDate?.message}</p>
                    </div>
                    <div>
                        <label>{t("createChallenge.endDate")}</label>
                        <input type="date" {...register("endDate")} className="w-full p-2 border rounded"/>
                        <p className="text-red-600">{errors.endDate?.message}</p>
                    </div>
                    <div>
                        <label>{t("createChallenge.privacy")}</label>
                        <select {...register("privacy")} className="w-full p-2 border rounded">
                            <option value="PUBLIC">{t("public")}</option>
                            <option value="PRIVATE">{t("private")}</option>
                        </select>
                    </div>
                    <div>
                        <label>{t("createChallenge.maxParticipants")}</label>
                        <input type="number" {...register("maxParticipants")} className="w-full p-2 border rounded"/>
                    </div>
                    <div>
                        <label>{t("createChallenge.verificationType.label")}</label>
                        <select {...register("verificationType")} className="w-full p-2 border rounded">
                            <option value="MEMBER_REVIEW">{t("createChallenge.verificationType.memberReview")}</option>
                            <option value="HOST_REVIEW">{t("createChallenge.verificationType.hostReview")}</option>
                        </select>
                    </div>
                    <div>
                        <label>{t("createChallenge.participationType.label")}</label>
                        <select {...register("participationType")} className="w-full p-2 border rounded">
                            <option value="INDIVIDUAL">{t("createChallenge.participationType.individual")}</option>
                            <option value="GROUP">{t("createChallenge.participationType.group")}</option>
                        </select>
                    </div>
                    <div>
                        <label>{t("createChallenge.challengeType")}</label>
                        <select {...register("challengeTypeId")} className="w-full p-2 border rounded">
                            <option value="">{t("createChallenge.selectChallengeType")}</option>
                            {challengeTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        <p className="text-red-600">{errors.challengeTypeId?.message}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <label>{t("createChallenge.description")}</label>
                    <RichTextEditor
                        value={description}
                        onChange={(val) => {
                            setDescription(val); // update local state
                            setValue("description", val, {shouldValidate: true}); // sync to react-hook-form
                            trigger("description");
                        }}
                    />
                    <input type="hidden" {...register("description")} value={description}/>

                    <p className="text-red-600">{errors.description?.message}</p>
                </div>

                <div className="flex justify-center mt-8 gap-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        disabled={isUpdating}
                    >
                        {isUpdating ? t("createChallenge.updating") : t("createChallenge.update")}
                    </button>
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                        onClick={() => navigate("/challenges/joins")}
                    >
                        {t("createChallenge.cancel")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChallengeEdit;
