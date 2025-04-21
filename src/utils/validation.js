import * as yup from "yup";
import i18n from "i18next";

export const editChallengeValidation = yup.object({
    name: yup
        .string()
        .required(i18n.t("challenge.nameRequired", { ns: "validation" }))
        .min(3, i18n.t("challenge.nameMin", { ns: "validation" })),

    startDate: yup
        .date()
        .required(i18n.t("challenge.startDateRequired", { ns: "validation" }))
        .min(new Date(), i18n.t("challenge.startDateMin", { ns: "validation" })),

    endDate: yup
        .string()
        .required(i18n.t("challenge.endDateRequired", { ns: "validation" }))
        .test("is-after-start", i18n.t("challenge.endDateAfterStart", { ns: "validation" }), function (value) {
            const { startDate } = this.parent;
            return value && new Date(value) > new Date(startDate);
        }),

    maxParticipants: yup
        .number()
        .typeError(i18n.t("challenge.maxParticipantsType", { ns: "validation" }))
        .positive(i18n.t("challenge.maxParticipantsPositive", { ns: "validation" }))
        .integer(i18n.t("challenge.maxParticipantsInteger", { ns: "validation" })),

    description: yup
        .string()
        .required(i18n.t("challenge.descriptionRequired", { ns: "validation" }))
        .min(10, i18n.t("challenge.descriptionMin", { ns: "validation" })),

    picture: yup
        .mixed()
        .notRequired()
        .nullable()
        .test("fileCheck", () => i18n.t("challenge.pictureInvalid", { ns: "validation" }), (value) => {
            if (!value) return true; // Allow null if unchanged
            if (value instanceof File) {
                return value.size <= 50 * 1024 * 1024 &&
                    ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(value.type);
            }
            return true;
        }),


    challengeTypeId: yup
        .string()
        .required(i18n.t("challenge.challengeTypeRequired", { ns: "validation" })),
});

// ✅ Candidate Schema
export const validateCandidate = yup.object({
    fullName: yup
        .string()
        .required(() => i18n.t("candidate.fullNameRequired", { ns: "validation" })),

    dateOfBirth: yup
        .string()
        .required(() => i18n.t("candidate.dobRequired", { ns: "validation" }))
        .test("is-older-than-16", () => i18n.t("candidate.dobInvalid", { ns: "validation" }), function (value) {
            if (!value) return false;
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            const d = today.getDate() - birthDate.getDate();
            return m < 0 || (m === 0 && d < 0) ? age - 1 >= 16 : age >= 16;
        }),

    // gender: yup
    //     .string()
    //     .required(() => i18n.t("candidate.genderRequired", { ns: "validation" })),
});

// ✅ Challenge Schema
export const challengeValidation = yup.object({
    name: yup
        .string()
        .required(() => i18n.t("challenge.nameRequired", { ns: "validation" }))
        .min(3, () => i18n.t("challenge.nameMin", { ns: "validation" })),

    startDate: yup
        .date()
        .required(() => i18n.t("challenge.startDateRequired", { ns: "validation" }))
        .min(new Date(), () => i18n.t("challenge.startDateMin", { ns: "validation" })),

    endDate: yup
        .string()
        .required(() => i18n.t("challenge.endDateRequired", { ns: "validation" }))
        .test("is-after-start", () => i18n.t("challenge.endDateAfterStart", { ns: "validation" }), function (value) {
            const { startDate } = this.parent;
            return value && new Date(value) > new Date(startDate);
        }),

    maxParticipants: yup
        .number()
        .typeError(() => i18n.t("challenge.maxParticipantsType", { ns: "validation" }))
        .positive(() => i18n.t("challenge.maxParticipantsPositive", { ns: "validation" }))
        .integer(() => i18n.t("challenge.maxParticipantsInteger", { ns: "validation" })),

    description: yup
        .string()
        .required(() => i18n.t("challenge.descriptionRequired", { ns: "validation" }))
        .min(10, () => i18n.t("challenge.descriptionMin", { ns: "validation" })),

    picture: yup
        .mixed()
        .required(() => i18n.t("challenge.pictureRequired", { ns: "validation" }))
        .test("fileSize", () => i18n.t("challenge.pictureSize", { ns: "validation" }), (v) => v && v.size <= 50 * 1024 * 1024)
        .test("fileType", () => i18n.t("challenge.pictureType", { ns: "validation" }), (v) =>
            v && ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(v.type)
        ),

    challengeTypeId: yup
        .string()
        .required(() => i18n.t("challenge.challengeTypeRequired", { ns: "validation" })),
});

// ✅ Login Schema
export const loginValidation = yup.object({
    username: yup
        .string()
        .required(() => i18n.t("login.usernameRequired", { ns: "validation" })),

    password: yup
        .string()
        .required(() => i18n.t("login.passwordRequired", { ns: "validation" }))
        .min(8, () => i18n.t("login.passwordMin", { ns: "validation" })),
});

// ✅ Group Schema
export const groupValidation = yup.object({
    name: yup.string().required("Group name is required!"),
    description: yup.string().nullable(),
});