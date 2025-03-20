import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";
import { decode } from "jsonwebtoken-esm";

export const adminUserService = createApi({
    reducerPath: "adminUser",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            try {
                const token = localStorage.getItem("jwt_token");

                if (token) {
                    // Sử dụng template literal với backticks
                    headers.set("Authorization", `Bearer ${token}`);

                    try {
                        const decodedToken = decode(token);

                        if (!decodedToken || !decodedToken.roles || !decodedToken.roles.includes("ADMIN")) {
                            console.error("User does not have ADMIN role.");
                            throw new Error("Unauthorized: Admin access required");
                        }
                    } catch (decodeError) {
                        console.error("Invalid token or decoding failed:", decodeError.message);
                        throw new Error("Unauthorized: Invalid token.");
                    }
                } else {
                    console.error("Token not found in localStorage.");
                    throw new Error("Unauthorized: No token provided.");
                }
            } catch (error) {
                console.error("Error fetching token or unauthorized access:", error.message);
                throw error;
            }

            headers.set("Content-Type", "application/json");
            return headers;
        }
    }),
    tagTypes: ["Admin"],
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: ({ page = 0, size = 10 }) => {
                const url = `/admin/accounts/get?page=${page}&size=${size}`;
                console.log("Fetching URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),
        getUserById: builder.query({
            query: (id) => {
                const url = `/admin/accounts/${id}`;
                console.log("Fetching URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),
        banUser: builder.mutation({
            query: ({ id }) => {
                console.log("Banning User with ID:", id);
                return {
                    url: `/admin/accounts/ban/${id}`,
                    method: "PUT",
                };
            },
            invalidatesTags: ["Admin"],
        }),
        unbanUser: builder.mutation({
            query: ({ id }) => {
                console.log("Unbanning User with ID:", id);
                return {
                    url: `/admin/accounts/unban/${id}`,
                    method: "PUT",
                };
            },
            invalidatesTags: ["Admin"],
        }),
        searchUsers: builder.query({
            query: (query) => {
                const url = `/admin/accounts/get?search=${query}`;
                console.log("Searching Users with URL:", url);
                return url;
            },
            providesTags: ["Admin"],
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
