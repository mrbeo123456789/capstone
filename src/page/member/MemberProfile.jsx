import {NavLink, useNavigate} from "react-router-dom";
import {IoIosWarning, IoMdHome} from "react-icons/io";
import {GrNext} from "react-icons/gr";
import {useForm} from "react-hook-form";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function MemberProfile() {
    const [user, setUser] = useState(null);
    const [updateUser, { isLoading, isError, isSuccess, error }] = useUpdateMemberMutation();

    const {register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        reset,
        trigger,
        formState:{ errors, isValid, isDirty}} =
        useForm({
            mode: "all",
        resolver: yupResolver(validateCandidate)
    });
    const navigate = useNavigate();
    useEffect( () => {
        const token = localStorage.getItem("jwt_token");
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
                    setUser(data);
                    // 🔥 Ensure `null` values are replaced with empty strings
                    setValue("userName", data.userName || "");
                    setValue("firstName", data.firstName || "");
                    setValue("lastName", data.lastName || "");
                    setValue("age", data.age || "");
                    setValue("gender", data.gender || "");
                    setValue("phone", data.phone || "");
                    setValue("address", data.address || "");
                    setValue("country", data.country || "");
                    setValue("dateOfBirth", data.dateOfBirth || "");
                    setPreview(data.avatar || ""); // Set existing avatar preview
                }
            )
            .catch(error => {
                toast.error(error.message);
                console.error(error);
            });

        console.log(user);
        window.addEventListener("animationstart", autofillHandler);
        window.addEventListener("input", autofillHandler);
        return () => {
            window.removeEventListener("animationstart", autofillHandler);
            window.removeEventListener("input", autofillHandler);
        }
    },[setValue,trigger]);

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

    const autofillHandler = ()=>{
        setValue("firstname", document.getElementById("firstname").value);
        setValue("lastname", document.getElementById("lastname").value);
        setValue("username", document.getElementById("username").value);
        setValue("email", document.getElementById("email").value);
        setValue("phone", document.getElementById("phone").value);
        setValue("address", document.getElementById("address").value);
        setValue("city", document.getElementById("city").value);
        setValue("country", document.getElementById("country").value);
        setValue("dateofbirth", document.getElementById("dateofbirth").value);
        setValue("role", document.getElementById("role").value);
    }
    return (
        <div className="p-6 flex flex-col items-center h-full w-full relative box-border rounded-xl border-4 border-transparent z-[1]">
            <div className="h-full w-full relative p-1 rounded-lg shadow-md -m-[5px] bg-gradient-to-r from-red-500 to-orange-500 z-[-1]">
                <div className="bg-black flex flex-col rounded-lg shadow-md items-center p-6"
                     style={{borderRadius: "1em"}}>
                    <div className="flex h-full flex-col justify-center gap-4 p-2"><h3
                        className="mb-4 text-xl font-bold text-orange-400 block">General Information</h3>
                        <form onSubmit={handleSubmit(handleSubmitData)} autoComplete="false">
                            <div className="mb-6 grid grid-cols-3 grid-rows-5 gap-3 md:grid-cols-3">
                                <div>
                                    <label className="text-sm font-medium text-orange-400 block"
                                           htmlFor="email">Email</label>
                                    <div className="mt-2">
                                        <div className="flex w-full">
                                        <span
                                            className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                            </svg>
                                          </span>
                                            <input disabled type="email" {...register("email")}
                                                   defaultValue={user?.email || ""}
                                                   className="rounded-none disabled:cursor-not-allowed disabled:opacity-70 rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                   id="email" name="email" placeholder="example@gmail.com" required=""/>
                                        </div>
                                        <p className="text-red-500 pt-2 pb-2">{errors?.email?.message}</p>

                                    </div>
                                </div>
                                <div><label
                                    className="text-sm font-medium text-orange-400 block"
                                    htmlFor="username">Username</label>
                                    <div className="flex mt-2">
                                        <div className="relative w-full">
                                            <input disabled type="text" {...register("username")}
                                                   defaultValue={user?.username || ""} // ✅ Set default value if available
                                                   className="block w-full border disabled:cursor-not-allowed disabled:opacity-70 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                   id="username" name="username"
                                                   placeholder="Username"/>
                                        </div>
                                    </div>
                                    <p className="text-red-500 pt-2 pb-2">{errors?.username?.message}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-orange-400 block"
                                           htmlFor="firstname">First name <span
                                        className="text-red-500">*</span></label>
                                    <div className="flex mt-2">
                                        <div className="relative w-full">
                                            <input type="text" {...register("firstname")}
                                                   defaultValue={user?.firstName || ""} // ✅ Set default value if available
                                                   onChange={handleChangeFirstName}
                                                   className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                   id="firstname" placeholder="ex: John"/>

                                        </div>
                                    </div>
                                    <p className="text-red-500">{errors?.firstname?.message}</p>
                                </div>
                                <div>
                                    <label
                                        className="text-sm font-medium text-orange-400 block"
                                        htmlFor="lastname">Last name <span className="text-red-500">*</span></label>
                                    <div className="flex mt-2">
                                        <div className="relative w-full">
                                            <input type="text" {...register("lastname")}
                                                   defaultValue={user?.lastName || ""} // ✅ Set default value if available
                                                   onChange={handleChangeLastName}
                                                   className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                   id="lastname" placeholder="ex: Smith"/>
                                        </div>
                                    </div>
                                    <p className="text-red-500">{errors?.lastname?.message}</p>

                                </div>


                                <div className="flex flex-col">
                                    <label className="text-orange-400">Date of birth<span
                                        className="text-red-500">*</span></label>
                                    <input type="date" {...register("dateofbirth")}
                                           className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"/>
                                    <p className="text-red-500 pt-2 pb-2">{errors?.dateOfBirth?.message}</p>
                                </div>


                                <div>
                                    <label className="text-sm font-medium text-orange-400 block"
                                           htmlFor="role">Gender <span className="text-red-500">*</span></label>
                                    <div className="flex mt-2">
                                        <div className="relative w-full">
                                            <select {...register("role")}
                                                    className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                    id="role">
                                                <option value="" defaultValue="">Choose Gender</option>
                                                <option key="gender" value="0">Male</option>
                                                <option key="gender" value="1">Female</option>
                                                <option key="gender" value="2">Other</option>
                                            </select>
                                            <p className="text-red-500 pt-2 pb-2">{errors?.role?.message}</p>

                                        </div>
                                    </div>
                                </div>
                                <div><label
                                    className="text-sm font-medium text-orange-400 block"
                                    htmlFor="phone">Phone <span className="text-red-500">*</span></label>
                                    <div className="mt-2">
                                        <div className="flex w-full">
                                        <span
                                            className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            <FiPhone/>
                                        </span>
                                            <input type="text" {...register("phone")}
                                                   className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                   id="phone" name="phone" placeholder="Phone"
                                                   required=""/>
                                        </div>
                                        <p className="text-red-500 pt-2 pb-2">{errors?.phone?.message}</p>

                                    </div>
                                </div>

                                <div>
                                    <label
                                        className="text-sm font-medium text-orange-400 block"
                                        htmlFor="country">Country <span className="text-red-500">*</span></label>
                                    <div className="flex mt-2">
                                        <div className="relative w-full">
                                            <select {...register("country")}
                                                    className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                    id="country"
                                                    onChange={handleChangeCountry}>
                                                <option value="" defaultValue={""}>Choose country</option>
                                                {countries?.map((country, index) => (
                                                    <option key={index} value={country.country_name}>
                                                        ({country.country_short_name}) {country.country_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-red-500 pt-2 pb-2">{errors?.country?.message}</p>

                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-orange-400 block"
                                           htmlFor="city">City <span className="text-red-500">*</span></label>
                                    <div className="flex mt-2">
                                        <div className="relative w-full">
                                            <select {...register("city")}
                                                    className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                    id="city" name="city">
                                                <option value="" defaultValue={""}>Choose city</option>
                                                {
                                                    cities?.map((city, index) =>
                                                        <option key={index} value={city.state_name}>
                                                            {city.state_name}
                                                        </option>
                                                    )
                                                }
                                            </select>
                                            <p className="text-red-500 pt-2 pb-2">{errors?.city?.message}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-orange-400 block"
                                           htmlFor="address">Address</label>
                                    <div className="flex mt-2">
                                        <div className="relative w-full">
                                            <input type="text" {...register("address")}
                                                   className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                   id="address" placeholder="ex: 123 Street" required=""/>
                                            <p className="text-red-500 pt-2 pb-2">{errors?.address?.message}</p>

                                        </div>
                                    </div>
                                </div>
                                <div className="row-start-1 row-end-5 col-start-3 flex flex-col items-center justify-center w-full">
                                    <label htmlFor="dropzone-file"
                                           className="relative group cursor-pointer flex items-center justify-center">
                                        {/* Avatar Container - Fixed Size on All Screens */}
                                        <div
                                            className="w-[300px] h-[400px] sm:w-[250px] sm:h-[350px] md:w-[300px] md:h-[400px] flex items-center justify-center relative">
                                            {/* Close Button */}
                                            {preview && (
                                                <FaWindowClose
                                                    className="text-2xl text-red-500 absolute right-2 top-2 z-10"
                                                    onClick={handleClosePreview}
                                                    style={{cursor: "pointer", backgroundColor: "white",}}
                                                />
                                            )}
                                            {/* Avatar Image OR Placeholder */}
                                            {preview ? (
                                                <img
                                                    className="w-full h-full object-cover rounded-lg"
                                                    src={preview}
                                                    alt="Uploaded Avatar"
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-full flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                                    <IoCloudUploadOutline className="text-2xl"/>
                                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="font-semibold">Click to upload</span> or drag
                                                        and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG,
                                                        JPG, or GIF (MAX. 800x400px)</p>
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
                                    {/* Hidden File Input */}
                                    <input {...register("avatar")} id="dropzone-file" type="file" accept="image/*"
                                           className="hidden" onChange={handleFileChange}/>

                                    {/* Error Message */}
                                    {errors?.avatar && (
                                        <p className="text-red-500 flex justify-center align-middle">
                                            <IoIosWarning className="text-2xl"/>
                                            {errors.avatar.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button style={{marginLeft: "30.3%"}}
                                    className=" text-white bg-blue-700 pl-4 pr-4 border border-transparent hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 disabled:hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 dark:disabled:hover:bg-blue-600 focus:!ring-2 p-0 font-medium rounded-lg"
                                    type="submit">
                                <span className="flex items-center rounded-md text-sm px-3 py-2">Update</span>
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default MemberProfile;