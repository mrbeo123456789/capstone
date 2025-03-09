import * as yup from "yup";

export const validateCandidate = yup.object({
    firstname: yup.string().required("First name is required!"),
    lastname: yup.string().required("Last name is required!"),
    // username: yup.string().required("Username will be auto generated when choose country!")
    //     .min(3, "Username must be greater than 3 characters"),
    // password: yup.string().required("Password is required!")
    //     .min(8, "Password must be at least 8 characters!")
    //     .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //         "Password must be contain uppercase, lowercase, special character and number!"),
    // email: yup.string().required("Email is required!")
    //     .email("Invalid email format!"),
    // phone: yup.string().required("Phone is required!")
    //     .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    // avatar: yup.mixed()
    //     .required("Avatar is required!")
    //     .test("fileType", "File must be an image!", (value)=>{
    //     // console.log(value[0])
    //     return value && value?.type?.startsWith("image/")
    // }).test("fileSize","File size must be less than 10MB", (value) => {
    //     return value && value?.size <= 50 * 1024 * 1024;
    // }),
    address: yup.string().required("Address is required!"),
    // city: yup.string().required("City is required!"),
    // country: yup.string().required("Country is required!"),
    // department: yup.string().required("Department is required!"),
    // role: yup.string().required("Role is required!"),
})

export const loginValidation = yup.object({
    username: yup.string().required("Username is required!"),
    password: yup.string().required("Password is required!")
        .min(8, "Password must be at least 8 characters!")

})