import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import { IoCloudUploadOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { groupValidation } from "../../utils/validation.js";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import {
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useGetGroupDetailQuery,
} from "../../service/groupService.js";

// ... (imports như cũ)
const GroupForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id: groupId } = useParams();
    const isEditing = Boolean(groupId);

    const [preview, setPreview] = useState("");
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(groupValidation),
        context: { isEditing }, // 👈 Truyền context ở đây
    });

    const [createGroup, { isLoading }] = useCreateGroupMutation();
    const [updateGroup, { isLoading: isUpdating }] = useUpdateGroupMutation();
    const { data: groupDetail } = useGetGroupDetailQuery(groupId, { skip: !isEditing });

    useEffect(() => {
        if (isEditing && groupDetail) {
            reset({
                name: groupDetail.name || "",
                description: groupDetail.description || "",
            });

            if (groupDetail.picture) {
                setValue("picture", groupDetail.picture); // 👈 Để validation biết là có ảnh
            }

            setPreview(groupDetail.picture || "");
        }
    }, [isEditing, groupDetail, reset, setValue]);


    const onSubmit = async (data) => {
        try {
            if (isEditing) {
                const formData = new FormData();
                formData.append("id", groupId);
                formData.append("name", data.name);
                formData.append("description", data.description);

                if (data.picture) {
                                    formData.append("picture", data.picture);
                                 }

                await updateGroup(formData);
                toast.success(t("updateSuccess"), { autoClose: 2000 });
                navigate(`/groups/joins/${groupId}`);
            } else {
                const formData = new FormData();
                formData.append("name", data.name);
                formData.append("description", data.description);
                if (data.picture) {
                    formData.append("picture", data.picture);
                }

                const res = await createGroup(formData);
                const message = typeof res === "string" ? res : res.message;
                toast.success(message || t("groupForm.createSuccess"), { autoClose: 2000 });
                navigate("/groups/joins");
            }

            reset();
            setPreview("");
        } catch (err) {
            console.error(err);
            toast.error(
                isEditing ? t("groupForm.updateFailed") : t("groupForm.createFailed"),
                { autoClose: 2000 }
            );
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
                    {/* ✅ Tiêu đề đơn giản hóa */}
                    <h3 className="mb-4 text-xl font-bold text-red-600">
                        {isEditing ? t("groupForm.editTitle") : t("groupForm.title")}
                    </h3>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            {/* Group Name */}
                            <div className="w-full mb-4">
                                <label className="text-sm font-medium text-black">
                                    {t("groupForm.groupName")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className="w-full text-black p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder={t("groupForm.groupNamePlaceholder")}
                                />
                            </div>

                            {/* Description */}
                            <div className="w-full mb-4">
                                <label className="text-sm font-medium text-black">
                                    {t("groupForm.description")} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register("description")}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder={t("groupForm.descriptionPlaceholder")}
                                />
                            </div>
                        </div>

                        {/* Group Image Upload */}
                        <label htmlFor="group-image"
                               className="relative group cursor-pointer flex items-center justify-center">
                            <div className="w-full h-[400px] flex items-center justify-center relative m-2">
                                {preview && (
                                    <FaWindowClose
                                        className="text-2xl text-red-500 absolute right-2 top-2 z-10"
                                        onClick={handleClosePreview}
                                        style={{cursor: "pointer", backgroundColor: "white"}}
                                    />
                                )}
                                {preview ? (
                                    <img className="w-full h-full object-cover rounded-lg" src={preview}
                                         alt="Group Avatar"/>
                                ) : (
                                    <div
                                        className="w-full h-full flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
                                        <IoCloudUploadOutline className="text-2xl"/>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">{t("groupForm.uploadHint")}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">{t("groupForm.uploadSubHint")}</p>
                                    </div>
                                )}
                                {preview && (
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <span className="text-white font-semibold">{t("groupForm.changePicture")}</span>
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
                            className="bg-red-600 px-6 py-2 rounded text-white hover:bg-red-700"
                            disabled={isLoading || isUpdating}
                            onClick={() =>
                                handleSubmit(onSubmit, (formErrors) => {
                                    const firstError = Object.values(formErrors)?.[0];
                                    if (firstError?.message) {
                                        toast.error(firstError.message);
                                    }
                                })()
                            }
                        >
                            {isEditing
                                ? isUpdating
                                    ? t("groupForm.updating")
                                    : t("groupForm.updateButton")
                                : isLoading
                                    ? t("groupForm.creating")
                                    : t("groupForm.createButton")}
                        </button>


                        <button
                            type="button"
                            className="bg-gray-500 px-6 py-2 rounded text-white hover:bg-gray-600"
                            onClick={() => {
                                reset();
                                setPreview("");
                                navigate(isEditing ? `/groups/joins/${groupId}` : "/groups/joins");
                            }}
                        >
                            {t("groupForm.cancelButton")}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );

};

export default GroupForm;
