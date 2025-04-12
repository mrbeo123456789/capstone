import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";
import {toast} from "react-toastify";

export const authService = createApi({
    reducerPath: "auth",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwt_token");
            const exp = localStorage.getItem("exp");

            if (token && exp) {
                const now = Date.now();
                const expTime = parseInt(exp, 10) * 1000;

                if (now > expTime) {
                    console.log("🔴 Token expired detected!");

                    // 👉 Toastify notify user
                    toast.error("Your session has expired. Please log in again.", {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    // 👉 Then clear and redirect after small delay
                    setTimeout(() => {
                        localStorage.clear();
                        window.location.href = "/login"; // Force logout after toast
                    }, 3200); // Wait a bit so user sees the toast
                } else {
                    headers.set("Authorization", `Bearer ${token}`);
                }
            }

            headers.set("Content-Type", "application/json");
            return headers;
        }
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

                const token = response.token;
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    localStorage.setItem("jwt_token", token);
                    localStorage.setItem("username", payload.sub);
                    localStorage.setItem("exp", payload.exp);
                }

                return response;
            }
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
