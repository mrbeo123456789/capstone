import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { validateCandidate } from "../../utils/validation.js";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { FaWindowClose } from "react-icons/fa";
import { toast, Slide } from "react-toastify";
import { useGetMyProfileQuery, useUpdateMemberMutation } from "../../service/memberService.js";
import locationService from "../../service/locationService.js";
import { useGetMyInterestsQuery, useUpdateMyInterestsMutation } from "../../service/interestService.js";
import { useTranslation } from "react-i18next";

function MemberProfile() {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const { data: userData } = useGetMyProfileQuery();
    const [updateUser, { isLoading }] = useUpdateMemberMutation();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const { data: interestsData = [] } = useGetMyInterestsQuery();
    const [yourInterests, setYourInterests] = useState([]);
    const [availableInterests, setAvailableInterests] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [updateMemberInterests] = useUpdateMyInterestsMutation();
    const [preview, setPreview] = useState("");
    const navigate = useNavigate();
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        control,
        formState: { errors, isValid }
    } = useForm({ mode: "all", resolver: yupResolver(validateCandidate) });

    useEffect(() => {
        if (interestsData) {
            setYourInterests(interestsData?.owned || []);
            setAvailableInterests(interestsData?.notOwned || []);
        }
    }, [interestsData]);

    useEffect(() => {
        if (userData) {
            setUser(userData);
            locationService.getProvinces().then(setProvinces);

            setValue("email", userData.email || "");
            setValue("username", userData.username || "");
            setValue("fullName", userData.fullName || "");
            setValue("firstName", userData.firstName || "");
            setValue("lastName", userData.lastName || "");
            setValue("gender", userData.gender || "");
            setValue("phone", userData.phone || "");
            setValue("province", userData.province || "");
            setValue("district", userData.district || "");
            setValue("ward", userData.ward || "");
            setValue("invitePermission", userData.invitePermission || "");
            setValue("dateOfBirth", formatDate(userData.dateOfBirth));
            setPreview(userData.avatar || "");
            setSelectedProvince(userData.province || "");
            setSelectedDistrict(userData.district || "");

            if (userData.province) {
                locationService.getDistricts(userData.province).then((districtsData) => {
                    setDistricts(districtsData);
                    if (userData.district) {
                        locationService.getWards(userData.district).then(setWards);
                    }
                });
            }
        }
    }, [userData, setValue]);

    const formatDate = (dateArray) => {
        if (!dateArray) return "";
        const [year, month, day] = dateArray;
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    const handleAddInterest = (interest) => {
        const newInterests = [...yourInterests, interest];
        setYourInterests(newInterests);
        setAvailableInterests((prev) => prev.filter((item) => item.id !== interest.id));
        setValue("interests", newInterests.map((i) => i.id), { shouldValidate: true });
    };

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        setLoadingDistricts(true);
        const data = await locationService.getDistricts(provinceId);
        setDistricts(data);
        setWards([]);
        setLoadingDistricts(false);
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        setSelectedDistrict(districtId);
        const data = await locationService.getWards(districtId);
        setWards(data);
    };

    const handleSubmitData = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (key !== "interests") formData.append(key, data[key]);
        });

        if (isValid) {
            try {
                await updateUser(formData);
                await updateMemberInterests(data.interests);
                toast.success(t("profileUpdated"), { transition: Slide });
                reset();
                setPreview(null);
                navigate("/profile");
            } catch (err) {
                console.error(err);
                toast.error(err?.data?.message || t("updateFailed"), { transition: Slide });
            }
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setValue("avatar", file, { shouldValidate: true });
        setPreview(URL.createObjectURL(file));
    };

    const handleClosePreview = (e) => {
        e.stopPropagation();
        setPreview(null);
        setValue("avatar", null, { shouldValidate: true });
    };

    const handleRemoveInterest = (interest) => {
        const newOwned = yourInterests.filter((item) => item.id !== interest.id);
        setYourInterests(newOwned);
        setAvailableInterests((prev) => [...prev, interest]);
        setValue("interests", newOwned.map((i) => i.id), { shouldValidate: true });

        toast((toastInstance) => (
            <span>
                {t('removed')} <b>{interest.name}</b>
                <button
                    className="ml-2 underline text-blue-500"
                    onClick={() => {
                        setYourInterests((prev) => [...prev, interest]);
                        setAvailableInterests((prev) => prev.filter(i => i.id !== interest.id));
                        setValue("interests", [...newOwned.map(i => i.id), interest.id]);
                        toast.dismiss(toastInstance.id);
                    }}
                >
                  {t('undo')}
                </button>
              </span>
                    ), {
                        autoClose: 4000,
                });
    };


    return (
        <form onSubmit={handleSubmit(handleSubmitData)} autoComplete="false" className="flex flex-col items-center">
            <div
                className="p-6 flex flex-col xl:flex-row h-full w-full relative box-border rounded-xl border-4 border-transparent z-[1]">

                {/* Left Section: Avatar & Basic Info */}
                <div className="bg-white rounded-lg shadow-md w-full xl:w-1/3">
                    <div className="p-6 flex flex-col md:m-2">
                        {/* Avatar Upload */}
                        <label htmlFor="dropzone-file"
                               className="relative group cursor-pointer flex items-center justify-center">
                            <div className="w-[300px] h-[400px] flex items-center justify-center relative xl:m-2">
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
                                            <span className="font-semibold">{t('uploadHint')}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">{t('uploadSubHint')}</p>
                                    </div>
                                )}
                                {/* Hover Overlay */}
                                {preview && (
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <span className="text-white font-semibold">{t('changePicture')}</span>
                                    </div>
                                )}
                            </div>
                        </label>
                        <input
                            {...register("avatar")}
                            id="dropzone-file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <p className="text-red-500">{errors.avatar?.message}</p>

                        {/* Email & Username */}
                        <div className="w-full mt-6 flex justify-between grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="px-2 w-full">
                                <label className="text-sm font-medium text-black" htmlFor="email">{t('email')}</label>
                                <input
                                    disabled
                                    type="email"
                                    {...register("email")}
                                    defaultValue={user?.email || ""}
                                    className="w-full text-black"
                                />
                            </div>
                            <div className="px-2 w-full">
                                <label className="text-sm font-medium text-black"
                                       htmlFor="username">{t('username')}</label>
                                <input
                                    disabled
                                    type="text"
                                    {...register("username")}
                                    defaultValue={user?.username || ""}
                                    className="w-full text-black"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: General Info Form */}
                <div className="bg-white rounded-lg w-full xl:ml-6 p-1">
                    <div className="flex flex-col rounded-lg p-6 h-full">
                        <h3 className="mb-4 text-xl font-bold text-orange-600">{t('generalInformation')}</h3>
                        <div>
                            {/* First Name */}
                            <div>
                                <label className="text-sm font-medium text-black block" htmlFor="fullname">{t('fullName')}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input type="text" {...register("fullName")} defaultValue={user?.fullName || ""}
                                       className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                       placeholder="John"/>
                                <p className="text-red-500">{errors.fullName?.message}</p>
                            </div>
                            {/* Date of Birth */}
                            <div>
                                <label className="text-sm font-medium text-black block"> {t('dateOfBirth')}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    {...register("dateOfBirth")} // ✅ Thống nhất camelCase
                                    className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <p className="text-red-500">{errors.dateOfBirth?.message}</p>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="text-sm font-medium text-black block">{t('gender')}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select {...register("gender")} defaultValue={user?.gender || ""}
                                        className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                    <option value="">{t('chooseGender')}</option>
                                    <option value="MALE">{t('male')}</option>
                                    <option value="FEMALE">{t('female')}</option>
                                    <option value="OTHER">{t('other')}</option>
                                </select>
                                <p className="text-red-500">{errors.gender?.message}</p>
                            </div>
                            {/* Phone */}
                            <div>
                                <label className="text-sm font-medium text-black block">{t('phone')}</label>
                                <input type="text" {...register("phone")}
                                       className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                       placeholder={t('phone')}/>
                                <p className="text-red-500">{errors.phone?.message}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Province */}
                                <div>
                                    <label className="text-sm font-medium text-black block">{t('province')}</label>
                                    <Controller
                                        control={control}
                                        name="province"
                                        defaultValue={user?.province || ""}
                                        render={({field}) => (
                                            <select
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e); // update RHF
                                                    handleProvinceChange(e); // fetch districts
                                                }}
                                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <option value="">{t('selectProvince')}</option>
                                                {provinces.map((province) => (
                                                    <option key={province.id} value={province.id}>
                                                        {province.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>
                                {/* District */}
                                <div>
                                    <label className="text-sm font-medium text-black block">{t('district')}</label>
                                    <Controller
                                        control={control}
                                        name="district"
                                        defaultValue={user?.district || ""}
                                        render={({field}) => (
                                            <select
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleDistrictChange(e);
                                                }}
                                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <option value="">{t('selectDistrict')}</option>
                                                {loadingDistricts ? <option>Loading...</option> : (
                                                    districts.map((district) => (
                                                        <option key={district.id} value={district.id}>
                                                            {district.full_name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        )}
                                    />
                                </div>
                                {/* Ward */}
                                <div>
                                    <label className="text-sm font-medium text-black block">{t('ward')}</label>
                                    <Controller
                                        control={control}
                                        name="ward"
                                        defaultValue={user?.ward || ""}
                                        render={({field}) => (
                                            <select
                                                {...field}
                                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <option value="">{t('selectWard')}</option>
                                                {wards.map((ward) => (
                                                    <option key={ward.id} value={ward.id}>
                                                        {ward.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Invite Permission */}
                            <div className="mt-4">
                                <label className="text-sm font-medium text-black block" htmlFor="invitePermission">
                                    {t('invitePermission.select')}
                                </label>
                                <select
                                    {...register("invitePermission")}
                                    defaultValue={user?.invitePermission || ""}
                                    className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="">{t('invitePermission.select')}</option>
                                    <option value="EVERYONE">{t('invitePermission.everyone')}</option>
                                    <option value="NO_ONE">{t('invitePermission.noOne')}</option>
                                    <option value="SAME_GROUP">{t('invitePermission.sameGroup')}</option>
                                </select>
                                <p className="text-red-500">{errors.invitePermission?.message}</p>
                            </div>


                            {/* Interests */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-black block">{t('yourInterest')}</label>
                                <input type="hidden" {...register("interests")} />
                            </div>

                            {/* List Your Interests */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {yourInterests.map((interest) => (
                                    <div
                                        key={interest.id}
                                        onClick={() => handleRemoveInterest(interest)}
                                        className="relative group cursor-pointer p-1.5 bg-red-500 rounded-full"
                                    >
                                        <span className="rounded-full text-sm">
                                          {interest.name}
                                        </span>
                                        {/* Hover Overlay */}
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="text-white text-xs font-bold">{t('move')}</span>
                                        </div>
                                    </div>
                                ))}

                                <button type="button" onClick={() => setShowAll(!showAll)} className="text-red-500">
                                    ➕
                                </button>

                            </div>

                            {/* Expand Available Interests */}
                            {showAll && (
                                <div className="flex flex-wrap gap-2">
                                    {availableInterests.map((interest) => (
                                        <button
                                            type="button"
                                            onClick={() => handleAddInterest(interest)}
                                            className="border px-4 py-2 rounded-full hover:bg-red-100"
                                        >
                                            {interest.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className={`text-white px-6 py-2 rounded mt-2 ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-900"
                }`}
            >
                {isLoading ? t('updating') : t('updateProfile')}
            </button>

        </form>
    );
}

export default MemberProfile;