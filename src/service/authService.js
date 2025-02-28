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
        // API Đăng nhập
        login: builder.mutation({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data,
            }),
            transformErrorResponse: (error) => error.data || "Login failed",
        }),

        // API Đăng ký
        register: builder.mutation({
            query: (data) => ({
                url: "api/auth/register",
                method: "POST",
                body: data,
            }),
            transformErrorResponse: (error) => error.data || "Registration failed",
        }),

        getUser: builder.query({
            query: () => "/auth/me",
            providesTags: ["Auth"],
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation,useGetUserQuery } = authService;
