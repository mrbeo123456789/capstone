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
            query: (data) => {
                console.log("Register Data:", data);
                return {
                    url: "/auth/register",
                    method: "POST",
                    body: data,
                };
            },
            transformResponse: (response) => {
                console.log("Register Response:", response);
                return { message: response };
            },
        }),

        login: builder.mutation({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data,
            }),
            transformResponse: (response) => {
                console.log("Login Response:", response);

                if (typeof response === "string") {
                    return { error: response }; // Nếu phản hồi là text, bọc vào object
                }

                localStorage.setItem("jwt_token", response.token);
                return response;
            },
        }),


        loginWithGoogle: builder.mutation({
            query: () => {
                console.log("Login with Google triggered");
                return {
                    url: "/oauth2/authorization/google",
                    method: "GET",
                };
            },
        }),

        handleOAuthCallback: builder.mutation({
            query: () => {
                console.log("OAuth Callback triggered");
                return {
                    url: "/api/auth/oauth2-login",
                    method: "GET",
                    credentials: "include",
                };
            },
            transformResponse: (response) => {
                console.log("OAuth Callback Response:", response);
                localStorage.setItem("jwt_token", response.token);
                return response;
            },
        }),

    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
} = authService;
