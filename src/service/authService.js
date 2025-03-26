import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const authService = createApi({
    reducerPath: "auth",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwt_token");
            if (token) {
                console.log("JWT Token:", token);
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Auth"],
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (data) => ({
                url: "/auth/register",
                method: "POST",
                body: data,
            }),
            transformResponse: (response) => ({ message: response }),
        }),

        login: builder.mutation({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data,
            }),
            transformResponse: (response) => {
                if (typeof response === "string") {
                    return { error: response };
                }
                localStorage.setItem("jwt_token", response.token);
                return response;
            },
        }),

        forgotPassword: builder.mutation({
            query: (email) => ({
                url: "/auth/forgot-password",
                method: "POST",
                body: { email },
            }),
            transformResponse: (response) => {
                console.log("Forgot Password Response:", response);
                return { message: response };
            },
        }),

        resetPassword: builder.mutation({
            query: ({ email, newPassword }) => ({
                url: "/auth/reset-password",
                method: "POST",
                body: { email, newPassword },
            }),
            transformResponse: (response) => ({ message: response }),
        }),

        verifyAccount: builder.mutation({
            query: ({ email, otp }) => ({
                url: "/auth/confirm-verification",
                method: "POST",
                body: { email, otp },
            }),
            transformResponse: (response) => ({ message: response }),
        }),

    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyAccountMutation,
} = authService;
