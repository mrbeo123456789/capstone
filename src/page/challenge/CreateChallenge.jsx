import { NavLink, useNavigate } from "react-router-dom";
import {IoIosWarning, IoMdHome} from "react-icons/io";
import { GrNext } from "react-icons/gr";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import {FaWindowClose} from "react-icons/fa";

function CreateChallenge() {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isValid } } = useForm({
        mode: "all",
    });
    const navigate = useNavigate();

    const [preview, setPreview] = useState("");

    const handleClosePreview = (e)=>{
        e.stopPropagation()
        setPreview(null);
        setValue("avatar", null,{ shouldValidate: true });
    }

    const handleSubmitData = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });
        if (isValid) {
            const toastId = toast.loading("Creating challenge...");
            try {
                console.log(formData);
                toast.success("Challenge created successfully!", { id: toastId });
                reset();
                setPreview(null);
                navigate("/challenges");
            } catch (err) {
                console.log(err);
                toast.error("Failed to create challenge: " + err?.data, { id: toastId });
            }
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setValue("image", file, { shouldValidate: true });
        setPreview(URL.createObjectURL(file));
    };

    return (
        <div className="block bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4">
                <nav aria-label="Breadcrumb">
                    <ol className="flex items-center">
                        <li className="group flex items-center">
                            <NavLink to="/" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                <IoMdHome className="text-xl" />
                                <span className="m-2">Home</span>
                            </NavLink>
                        </li>
                        <li className="group flex items-center">
                            <GrNext />
                            <NavLink to="/challenges" className="m-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                Challenges
                            </NavLink>
                        </li>
                        <li className="group flex items-center">
                            <GrNext />
                            <span className="m-2 text-sm font-medium text-gray-500 dark:text-gray-400">Create Challenge</span>
                        </li>
                    </ol>
                </nav>
            </div>
            <h3 className="mb-4 text-xl font-bold dark:text-white">Create a Challenge</h3>
            <form onSubmit={handleSubmit(handleSubmitData)}>
                <div className="mb-6 grid grid-cols-3 grid-rows-5 gap-3 md:grid-cols-3">
                    <div>
                        <label className="text-sm font-medium" htmlFor="challengeName">Challenge Name<span
                            className="text-red-500">*</span></label>
                        <input type="text" {...register("challengeName")} className="w-full p-2 border rounded"
                               placeholder="Input your challenge name"/>
                        <p className="text-red-500">{errors?.challengeName?.message}</p>
                    </div>
                    <div
                        className="row-start-1 row-end-5 col-start-3 flex-col items-center justify-center w-full ">
                        {preview ? <label htmlFor="dropzone-file" className="relative">
                                <FaWindowClose className="text-2xl text-red-500 absolute right-0 m-2"
                                               onClick={handleClosePreview}
                                               style={{cursor: 'pointer', backgroundColor: 'white'}}/>
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
                    <div>
                        <label className="text-sm font-medium" htmlFor="type">Type<span
                            className="text-red-500">*</span></label>
                        <select {...register("type")} className="w-full p-2 border rounded">
                            <option value="">Select Type</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium" htmlFor="startTime">Start Time<span
                            className="text-red-500">*</span></label>
                        <input type="date" {...register("startTime")} className="w-full p-2 border rounded"/>
                        <p className="text-red-500">{errors?.startTime?.message}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium" htmlFor="endTime">End Time<span
                            className="text-red-500">*</span></label>
                        <input type="date" {...register("endTime")} className="w-full p-2 border rounded"/>
                        <p className="text-red-500">{errors?.endTime?.message}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium" htmlFor="category">Category<span
                            className="text-red-500">*</span></label>
                        <select {...register("category")} className="w-full p-2 border rounded">
                            <option value="">Select Category</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium" htmlFor="verificationMethod">Verification Method</label>
                        <select {...register("verificationMethod")} className="w-full p-2 border rounded">
                            <option value="Video">Video</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea {...register("description")} className="w-full p-2 border rounded"></textarea>
                    </div>
                </div>
                <div className="mt-4 flex gap-4">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                    <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default CreateChallenge;