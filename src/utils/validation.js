import * as yup from "yup";
import i18n from "i18next";

const t = i18n.getFixedT(null, "validation"); // get translator scoped to validation.json

// ✅ Candidate Schema
export const validateCandidate = yup.object({
    fullName: yup.string().required(t("candidate.fullNameRequired")),
    dateOfBirth: yup.string()
        .required(t("candidate.dobRequired"))
        .test("is-older-than-16", t("candidate.dobInvalid"), function (value) {
            if (!value) return false;
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            const d = today.getDate() - birthDate.getDate();
            return m < 0 || (m === 0 && d < 0) ? age - 1 >= 16 : age >= 16;
        }),
    gender: yup.string().required(t("candidate.genderRequired")),
});

// ✅ Challenge Schema
export const challengeValidation = yup.object({
    name: yup.string().required(t("challenge.nameRequired")).min(3, t("challenge.nameMin")),
    startDate: yup.date().required(t("challenge.startDateRequired")).min(new Date(), t("challenge.startDateMin")),
    endDate: yup.string().required(t("challenge.endDateRequired")).test(
        "is-after-start",
        t("challenge.endDateAfterStart"),
        function (value) {
            const { startDate } = this.parent;
            return value && new Date(value) > new Date(startDate);
        }
    ),
    maxParticipants: yup.number()
        .typeError(t("challenge.maxParticipantsType"))
        .positive(t("challenge.maxParticipantsPositive"))
        .integer(t("challenge.maxParticipantsInteger")),
    description: yup.string().required(t("challenge.descriptionRequired")).min(10, t("challenge.descriptionMin")),
    picture: yup.mixed()
        .required(t("challenge.pictureRequired"))
        .test("fileSize", t("challenge.pictureSize"), (v) => v && v.size <= 50 * 1024 * 1024)
        .test("fileType", t("challenge.pictureType"), (v) => v && ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(v.type)),
    challengeTypeId: yup.string().required(t("challenge.challengeTypeRequired"))
});

// ✅ Login Schema
export const loginValidation = yup.object({
    username: yup.string().required(t("login.usernameRequired")),
    password: yup.string().required(t("login.passwordRequired")).min(8, t("login.passwordMin"))
});

// ✅ Validate group (NEW!! từ yêu cầu của bạn)
export const groupValidation = yup.object({
    name: yup.string().required("Group name is required!"),
    description: yup.string().nullable(),
});