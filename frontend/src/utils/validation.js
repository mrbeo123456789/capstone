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

    participationType: yup.string().oneOf(["INDIVIDUAL", "GROUP"]).required(),

    maxParticipants: yup
        .number()
        .typeError(() => i18n.t("challenge.maxParticipantsType", { ns: "validation" }))
        .integer(() => i18n.t("challenge.maxParticipantsInteger", { ns: "validation" }))
        .when("participationType", {
            is: "INDIVIDUAL",
            then: (schema) =>
                schema
                    .required(() => i18n.t("challenge.maxParticipantsRequired", { ns: "validation" }))
                    .min(2, () => i18n.t("challenge.minParticipantsIndividual", { ns: "validation" })),
            otherwise: (schema) => schema.notRequired().strip() // ❗ Loại bỏ nếu không dùng
        }),


    maxGroups: yup
        .number()
        .typeError(() => i18n.t("challenge.maxGroupsType", { ns: "validation" }))
        .integer(() => i18n.t("challenge.maxGroupsInteger", { ns: "validation" }))
        .when("participationType", {
            is: "GROUP",
            then: (schema) =>
                schema
                    .required(() => i18n.t("challenge.maxGroupsRequired", { ns: "validation" }))
                    .min(2, () => i18n.t("challenge.minGroups", { ns: "validation" })),
            otherwise: (schema) => schema.notRequired().strip()
        }),


    maxMembersPerGroup: yup
        .number()
        .transform((value, originalValue) =>
            originalValue === "" ? undefined : value
        )
        .typeError(() => i18n.t("challenge.maxMembersPerGroupType", { ns: "validation" }))
        .positive(() => i18n.t("challenge.maxMembersPerGroupPositive", { ns: "validation" }))
        .integer(() => i18n.t("challenge.maxMembersPerGroupInteger", { ns: "validation" }))
        .min(2, () => i18n.t("challenge.groupMinMember", { ns: "validation" }))
        .when("participationType", {
            is: "GROUP",
            then: (schema) =>
                schema.required(() =>
                    i18n.t("challenge.maxMembersPerGroupRequired", { ns: "validation" })
                ),
            otherwise: (schema) => schema.notRequired(),
        }),

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


export const groupValidation = yup.object().shape({
    name: yup
        .string()
        .required(i18n.t("group.nameRequired", { ns: "validation" })),

    description: yup
        .string()
        .required(i18n.t("group.descriptionRequired", { ns: "validation" })),

    picture: yup
        .mixed()
        .test("required-image", function (value) {
            const { isEditing } = this?.options?.context || {};
            const hasFile = value instanceof File;

            // Nếu đang edit, bỏ qua validate ảnh
            if (isEditing) return true;

            // Nếu tạo mới, bắt buộc phải có ảnh (là File)
            if (!hasFile) {
                return this.createError({
                    message: i18n.t("group.pictureRequired", { ns: "validation" }),
                });
            }

            return true;
        }),
});