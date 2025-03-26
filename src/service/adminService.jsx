import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";
import jwtDecode from "jwt-decode";

export const adminUserService = createApi({
    reducerPath: "adminUser",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            try {
                const response = await fetch(`${BASE_URL}/auth/token`, { method: "GET", credentials: "include" });
                if (!response.ok) {
                    throw new Error("Failed to fetch token");
                }
                const data = await response.json();
                const token = data.token;

                if (token) {
                    headers.set("Authorization", `Bearer ${token}`);
                    const decodedToken = jwtDecode(token);
                    if (!decodedToken.roles || !decodedToken.roles.includes("ADMIN")) {
                        throw new Error("Unauthorized: Admin access required");
                    }
                }
            } catch (error) {
                console.error("Error fetching token or unauthorized access:", error);
                throw new Error("Unauthorized: Admin access required");
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["User"],
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: ({ page = 0, size = 10 }) => `/admin/accounts/get?page=${page}&size=${size}`,
            providesTags: ["User"],
        }),
        getUserById: builder.query({
            query: (id) => `/admin/accounts/${id}`,
            providesTags: ["User"],
        }),
        banUser: builder.mutation({
            query: ({ id }) => ({
                url: `/admin/accounts/ban/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["User"],
        }),
        unbanUser: builder.mutation({
            query: ({ id }) => ({
                url: `/admin/accounts/unban/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["User"],
        }),
        searchUsers: builder.query({
            query: (query) => `/admin/accounts/get?search=${query}`,
            providesTags: ["User"],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useBanUserMutation,
    useUnbanUserMutation,
    useSearchUsersQuery
} = adminUserService;
