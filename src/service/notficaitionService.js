import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const notificationService = createApi({
    reducerPath: "notification",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwt_token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Notification"],
    endpoints: (builder) => ({
        // API lấy danh sách thông báo
        getNotifications: builder.query({
            query: ({ limit = 10, lastCreatedAt = null }) => {
                const params = new URLSearchParams();
                params.append("limit", limit);
                if (lastCreatedAt) params.append("lastCreatedAt", lastCreatedAt);
                return `/member/notifications?${params.toString()}`;
            },
            providesTags: ["Notification"],
        }),


    }),
});

export const {
    useGetNotificationsQuery,
} = notificationService;
