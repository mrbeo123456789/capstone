import * as yup from "yup";

// Helper function để parse date & so sánh cho dễ
const today = new Date();
today.setHours(0, 0, 0, 0); // Reset time về 00:00 để tránh lỗi so sánh

// Validate thông tin người dùng
export const validateCandidate = yup.object({
    fullName: yup.string().required("Full name is required!"),
    dateOfBirth: yup
        .string()
        .required("Date of birth is required!")
        .test(
            "is-older-than-16",
            "You must be older than 16 years old!",
            function (value) {
                if (!value) return false;
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                const d = today.getDate() - birthDate.getDate();

                if (m < 0 || (m === 0 && d < 0)) {
                    return age - 1 >= 16;
                }
                return age >= 16;
            }
        ),
    gender: yup.string().required("Gender is required!"),
});

// Validate challenge
export const challengeValidation = yup.object({
    name: yup.string()
        .required("Challenge name is required!")
        .trim()
        .min(3, "Challenge name must be at least 3 characters"),

    startDate: yup.date()
        .required("Start date is required")
        .min(today, "Start date must be in the future"),

    endDate: yup.string()
        .strict(true)
        .required("End date is required")
        .test(
            "is-after-start",
            "End date must be after start date",
            function (value) {
                const { startDate } = this.parent;
                if (!startDate || !value) return false;
                return new Date(value) > new Date(startDate);
            }
        ),

    maxParticipants: yup.number()
        .typeError("Max participants must be a number")
        .positive("Max participants must be greater than 0")
        .integer("Max participants must be an integer"),

    description: yup.string()
        .required("Description is required")
        .trim()
        .min(10, "Description should be at least 10 characters long"),

    picture: yup
        .mixed()
        .required("Picture is required")
        .test(
            "fileSize",
            "Picture size must be less than 50MB",
            (value) => {
                if (!value) return false;
                return value.size <= 50 * 1024 * 1024;
            }
        )
        .test(
            "fileType",
            "Unsupported File Format",
            (value) => {
                if (!value) return false;
                return ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(value.type);
            }
        ),

    challengeTypeId: yup.string()
        .required("Challenge type is required"),
});

// Validate login
export const loginValidation = yup.object({
    username: yup.string().required("Username is required!"),
    password: yup.string().required("Password is required!").min(8, "Password must be at least 8 characters!"),
});

// ✅ Validate group (NEW!! từ yêu cầu của bạn)
export const groupValidation = yup.object({
    name: yup.string().required("Group name is required!"),
    privacy: yup.string().oneOf(["PUBLIC", "PRIVATE"]).required("Privacy setting is required!"),
    description: yup.string().nullable(),
});