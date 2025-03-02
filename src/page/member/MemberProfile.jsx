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

function MemberProfile() {
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
    useEffect(() => {
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
                await addEmployee(formData).unwrap();
                toast.success("Employee added successfully!",{ id: toastId });
                reset();
                setPreview(null);
                navigate("/employees");
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
        setValue("password", document.getElementById("password").value);
        setValue("email", document.getElementById("email").value);
        setValue("phone", document.getElementById("phone").value);
        setValue("address", document.getElementById("address").value);
        setValue("city", document.getElementById("city").value);
        setValue("country", document.getElementById("country").value);
        setValue("department", document.getElementById("department").value);
        setValue("role", document.getElementById("role").value);
    }
    return (
        <div
            className="block items-center justify-between bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
            <div className="mb-1 w-full">
                <div className="mb-4">
                    <nav aria-label="Breadcrumb" className="mb-4">
                        <ol className="flex items-center">
                            <li className="group flex items-center">

                                <NavLink to={"/"}
                                         className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                         data-testid="flowbite-breadcrumb-item" href="#">
                                    <div className="flex items-center gap-x-3">
                                        <IoMdHome className="text-xl"/>
                                        <span className="dark:text-white m-2">Home</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="group flex items-center">
                                <GrNext/>
                                <NavLink to={"/employees"}
                                         className="flex items-center text-sm m-2 font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                         data-testid="flowbite-breadcrumb-item">
                                    Employees
                                </NavLink>
                            </li>
                            <li className="group flex items-center">
                                <GrNext/>
                                <span
                                    className="flex items-center m-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                                    data-testid="flowbite-breadcrumb-item ">
                                            Add employee
                                        </span>
                            </li>
                        </ol>
                    </nav>
                </div>
                <div className="flex h-full flex-col justify-center gap-4 p-2"><h3
                    className="mb-4 text-xl font-bold dark:text-white">General Information</h3>
                    <form onSubmit={handleSubmit(handleSubmitData)} autoComplete="false">
                        <div className="mb-6 grid grid-cols-3 grid-rows-5 gap-3 md:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                       htmlFor="firstname">First name <span
                                    className="text-red-500">*</span></label>
                                <div className="flex mt-2">
                                    <div className="relative w-full">
                                        <input type="text" {...register("firstname")}
                                            onChange={handleChangeFirstName}
                                               className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                               id="firstname" placeholder="ex: John"/>

                                    </div>
                                </div>
                                <p className="text-red-500">{errors?.firstname?.message}</p>
                            </div>
                            <div>
                                <label
                                    className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                    htmlFor="lastname">Last name <span className="text-red-500">*</span></label>
                                <div className="flex mt-2">
                                    <div className="relative w-full">
                                        <input type="text" {...register("lastname")}
                                            onChange={handleChangeLastName}
                                               className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                               id="lastname"  placeholder="ex: Smith"/>
                                    </div>
                                </div>
                                <p className="text-red-500">{errors?.lastname?.message}</p>

                            </div>
                            <div><label
                                className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                htmlFor="username">Username <span className="text-red-500">*</span></label>
                                <div className="flex mt-2">
                                    <div className="relative w-full">
                                        <input disabled type="text" {...register("username")}
                                               className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                               id="username" name="username"
                                               placeholder="Username will be auto generated when choose country!"/>

                                    </div>
                                </div>
                                <p className="text-red-500 pt-2 pb-2">{errors?.username?.message}</p>

                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                       htmlFor="password">Password <span className="text-red-500">*</span></label>
                                <div className="mt-2">
                                    <div className="flex w-full">
                                        <span style={{cursor: 'pointer'}}
                                              onClick={()=>setValue("password", generatePassword(),{ shouldValidate: true })}
                                            className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                            Click Generate
                                          </span>
                                        <input type="text" {...register("password")}
                                               className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                               id="password" name="password" placeholder="More than 8 characters"
                                               required=""/>
                                    </div>
                                    <p className="text-red-500 pt-2 pb-2">{errors?.password?.message}</p>

                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                       htmlFor="department">Department <span className="text-red-500">*</span></label>
                                <div className="flex mt-2">
                                    <div className="relative w-full">
                                        <select {...register("department")}
                                                className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                id="department" name="department">
                                            <option value="" defaultValue="">Choose department</option>
                                            {/*{departments?.content?.map((department) =>*/}
                                            {/*    <option key={department?.id}*/}
                                            {/*            value={department?.id}>{department.name}</option>)*/}
                                            {/*}*/}
                                        </select>
                                        <p className="text-red-500 pt-2 pb-2">{errors?.department?.message}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                       htmlFor="role">Role <span className="text-red-500">*</span></label>
                                <div className="flex mt-2">
                                    <div className="relative w-full">
                                        <select {...register("role")}
                                                className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                                id="role" >
                                            <option value="" defaultValue="">Choose department</option>
                                            {/*{roles?.content?.map((role) =>*/}
                                            {/*    <option key={role.roleId}*/}
                                            {/*            value={role.roleId}>{role.name}</option>)*/}
                                            {/*}*/}
                                        </select>
                                        <p className="text-red-500 pt-2 pb-2">{errors?.role?.message}</p>

                                    </div>
                                </div>
                            </div>
                            <div><label
                                className="text-sm font-medium text-gray-900 dark:text-gray-300"
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
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                       htmlFor="email">Email <span className="text-red-500">*</span> </label>
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
                                        <input type="email" {...register("email")}
                                               className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                               id="email" name="email" placeholder="example@gmail.com" required=""/>
                                    </div>
                                    <p className="text-red-500 pt-2 pb-2">{errors?.email?.message}</p>

                                </div>
                            </div>
                            <div>
                                <label
                                    className="text-sm font-medium text-gray-900 dark:text-gray-300"
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
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-300"
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
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-300"
                                       htmlFor="address">Address <span className="text-red-500">*</span> </label>
                                <div className="flex mt-2">
                                    <div className="relative w-full">
                                        <input type="text" {...register("address")}
                                               className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm"
                                               id="address" placeholder="ex: 123 Street" required=""/>
                                        <p className="text-red-500 pt-2 pb-2">{errors?.address?.message}</p>

                                    </div>
                                </div>
                            </div>
                            <div
                                className="row-start-1 row-end-5 col-start-3 flex-col items-center justify-center w-full ">
                                {preview ? <label htmlFor="dropzone-file" className="relative">
                                        <FaWindowClose className="text-2xl text-red-500 absolute right-0 m-2"
                                                       onClick={handleClosePreview} style={{cursor: 'pointer', backgroundColor: 'white'}} />
                                        <img className="h-auto max-w-full rounded-lg"
                                             src={preview} style={{maxHeight: "400px"}}
                                             alt="image description"/></label>
                                    :
                                    <label htmlFor="dropzone-file"
                                           className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <IoCloudUploadOutline className="text-2xl"/>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                                className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF
                                                (MAX.
                                                800x400px)</p>
                                        </div>
                                    </label>}
                                <input {...register("avatar")} id="dropzone-file" type="file" accept="image/*"
                                       className="hidden" onChange={handleFileChange}/>
                                {errors?.avatar &&
                                    <p className="text-red-500 flex justify-center align-middle"><IoIosWarning
                                        className="text-2xl"/>{errors.avatar.message}</p>}
                            </div>

                        </div>

                        <button style={{marginLeft: "30.3%"}}
                                className=" text-white bg-blue-700 pl-4 pr-4 border border-transparent hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 disabled:hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 dark:disabled:hover:bg-blue-600 focus:!ring-2 p-0 font-medium rounded-lg"
                                type="submit">
                            <span className="flex items-center rounded-md text-sm px-3 py-2">Create</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MemberProfile;