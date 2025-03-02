import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const authService = createApi({
    reducerPath: "auth",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                //headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Auth"],
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (data) => ({
                url: "api/auth/register",
                method: "POST",
                body: {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                },
            }),
            transformResponse: (response) => {
                return { message: response }; // Backend trả về chuỗi message
            },
        }),

        login: builder.mutation({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: {
                    username: data.username,
                    password: data.password,
                },
            }),
            transformResponse: (response) => {
                localStorage.setItem("token", response.token);
                return response;
            },
        }),
        // Đăng nhập Google
        loginWithGoogle: builder.query({
            query: () => "/oauth2/authorization/google",
        }),

        // Xử lý callback OAuth2 để lấy JWT Token
        handleOAuthCallback: builder.query({
            query: () => "/api/auth/oauth2-login",
            credentials: "include",
        }),
        getUser: builder.query({
            query: () => "/auth/me",
            providesTags: ["Auth"],
        }),
    }),
});

export const { useRegisterMutation,
    useLoginMutation,
    useLoginWithGoogleQuery,
    useHandleOAuthCallbackQuery,
    useGetUserQuery} = authService;
