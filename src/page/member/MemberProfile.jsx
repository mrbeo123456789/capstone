import {NavLink, useNavigate} from "react-router-dom";
import {IoIosWarning, IoMdHome} from "react-icons/io";
import {GrNext} from "react-icons/gr";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {validateCandidate} from "../../utils/validation.js";
import {IoCloudUploadOutline} from "react-icons/io5";
import {useEffect, useState} from "react";
import {FaWindowClose} from "react-icons/fa";
import {FiPhone} from "react-icons/fi";
import useSelectCityAndCountry from "../../hook/useSelectCityAndCountry.jsx";
import {generatePassword, generateUsername} from "../../utils/utils.js";
import toast from "react-hot-toast";
import {useUpdateMemberMutation} from "../../service/memberService.js";
import locationService from "../../service/locationService.js";


function MemberProfile() {
    const [user, setUser] = useState(null);
    const [updateUser, { isLoading, isError, isSuccess, error }] = useUpdateMemberMutation();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");


    const {register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        reset,
        trigger,
        control,
        formState:{ errors, isValid, isDirty}
    } = useForm({mode: "all",
        resolver: yupResolver(validateCandidate)});

    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        const fetchProvinces = async () => {
            const data = await locationService.getProvinces();
            setProvinces(data);
        };
        fetchProvinces();
        if (!token) {
            toast.error("You need to log in first!");
            navigate("/login");
        }
        fetch("http://localhost:8080/api/member/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch user data");
                return res.json();
            })
            .then(data => {
                console.log(data);
                setUser(data);
                // Set values
                setValue("email", data.email || "");
                setValue("username", data.username || "");
                setValue("fullName", data.fullName || "");
                setValue("firstName", data.firstName || "");
                setValue("lastName", data.lastName || "");
                setValue("gender", data.gender || "");
                setValue("phone", data.phone || "");
                setValue("province", data.city || "");
                setValue("district", data.district || "");
                setValue("ward", data.ward || "");
                setValue("dateOfBirth", formatDate(data.dateOfBirth));
                setPreview(data.avatar || "");
                // 👇 Fill province/district/ward IDs
                setValue("province", data.province || "");
                setSelectedProvince(data.province || ""); // For fetching districts

                setValue("district", data.district || "");
                setSelectedDistrict(data.district || ""); // For fetching wards

                setValue("ward", data.ward || "");

                // Load Districts & Wards ngay sau khi có province, district:
                if (data.province) {
                    locationService.getDistricts(data.province).then((districts) => {
                        setDistricts(districts);
                        if (data.district) {
                            locationService.getWards(data.district).then((wards) => {
                                setWards(wards);
                            });
                        }
                    });
                }
            })
            .catch(error => {
                toast.error(error.message);
                console.error(error);
            });
    }, [setValue, trigger]);

    const formatDate = (dateArray) => {
        if (!dateArray) return "";
        const [year, month, day] = dateArray;
        const formattedMonth = month.toString().padStart(2, "0");
        const formattedDay = day.toString().padStart(2, "0");
        return `${year}-${formattedMonth}-${formattedDay}`;
    };

// When province changes -> load districts
    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        const data = await locationService.getDistricts(provinceId);
        setDistricts(data);
        setWards([]); // reset wards
    };

    // When district changes -> load wards
    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        setSelectedDistrict(districtId);
        const data = await locationService.getWards(districtId);
        setWards(data);
    };

    const [preview, setPreview] = useState("");

    const [country, cities, countries, setCountry]= useSelectCityAndCountry();

    const handleSubmitData =  async (data)=>{
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });
        if(isValid){
            const toastId = toast.loading("Add employee processing...!")
            try {
                console.log(formData)
                await updateUser(formData).unwrap();
                toast.success("Employee added successfully!",{ id: toastId });
                reset();
                setPreview(null);
                navigate("/profile");
            } catch (err) {
                console.log(err)
                toast.error("Failed to add employee: " + (err?.data ),{ id: toastId });
            }
        }
    }

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
    const handleChangeCountry = (e) => {
        const country = e.target.value;
        setValue("country", country,{ shouldValidate: true });
        handleGenerateUsername();
        setCountry(country);
    }

    const handleChangeFirstName = (e)=>{
        setValue("firstname", e.target.value,{shouldValidate:true});
        handleGenerateUsername();
    }
    const handleChangeLastName = (e)=>{
        setValue("lastname", e.target.value,{shouldValidate:true});
        handleGenerateUsername();
    }

    const handleGenerateUsername =()=>{
        if(getValues("country") === "Vietnam"){
            let username = getValues("firstname") + generateUsername(watch("lastname"));
            const num = data?.content?.filter(x=> x.username.startsWith(username) && typeof (+x.username.replace(username))==="number" ).length;
            console.log(data,num)
            setValue("username", username+(num+1),{ shouldValidate: true });
        }
        else if(country.length >2) {
            setValue("username", watch("firstname")+watch("lastname"),{ shouldValidate: true });
        }
    }

    return (
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
                                <img className="w-full h-full object-cover rounded-lg" src={preview} alt="Uploaded Avatar"/>
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

                    {/* Email & Username */}
                    <div className="w-full mt-6 flex justify-between grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="px-2 w-full">
                            <label className="text-sm font-medium text-red-500" htmlFor="email">Email</label>
                            <input disabled type="email" {...register("email")} defaultValue={user?.email || ""}
                                   className="w-full text-black"/>
                        </div>
                        <div className="px-2 w-full">
                            <label className="text-sm font-medium text-red-500" htmlFor="username">Username</label>
                            <input disabled type="text" {...register("username")} defaultValue={user?.username || ""}
                                   className="w-full text-black"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section: General Info Form */}
            <div className="bg-white rounded-lg w-full xl:ml-6 p-1">
                <div className="flex flex-col rounded-lg p-6 h-full">
                    <h3 className="mb-4 text-xl font-bold text-red-600">General Information</h3>
                    <form onSubmit={handleSubmit(handleSubmitData)} autoComplete="false">
                        {/* First Name */}
                        <div>
                            <label className="text-sm font-medium text-red-600 block" htmlFor="fullname">Full Name
                                <span className="text-red-900"> *</span>
                            </label>
                            <input type="text" {...register("fullName")} defaultValue={user?.fullName || ""}
                                   className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                   placeholder="John"/>
                            <p className="text-red-500">{errors.name?.message}</p>
                        </div>
                        {/* Date of Birth */}
                        <div>
                            <label className="text-sm font-medium text-red-600 block">Date of Birth
                                <span className="text-red-900"> *</span>
                            </label>
                            <input
                                type="date"
                                {...register("dateOfBirth")} // ✅ Thống nhất camelCase
                                className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <p className="text-red-500">{errors.name?.message}</p>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="text-sm font-medium text-red-600 block">Gender</label>
                            <select {...register("gender")} defaultValue={user?.gender || ""}
                                    className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                <option value="">Choose Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="text-sm font-medium text-red-600 block">Phone</label>
                            <input type="text" {...register("phone")}
                                   className="w-full sm:w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                   placeholder="Phone Number"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Province */}
                            <div>
                                <label className="text-sm font-medium text-red-600 block">Tỉnh/Thành Phố</label>
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
                                            <option value="">Select Province</option>
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
                                <label className="text-sm font-medium text-red-600 block">Quận/Huyện</label>
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
                                            <option value="">Select District</option>
                                            {districts.map((district) => (
                                                <option key={district.id} value={district.id}>
                                                    {district.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </div>
                            {/* Ward */}
                            <div>
                                <label className="text-sm font-medium text-red-600 block">Xã/Thị Trấn</label>
                                <Controller
                                    control={control}
                                    name="ward"
                                    defaultValue={user?.ward || ""}
                                    render={({field}) => (
                                        <select
                                            {...field}
                                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <option value="">Select Ward</option>
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

                        {/* Submit Button */}
                        <button type="submit"
                                className="text-white bg-red-600 px-6 py-2 rounded hover:bg-red-900 mt-2">Update Profile
                        </button>
                    </form>
                </div>
            </div>
        </div>

    );
}

export default MemberProfile;