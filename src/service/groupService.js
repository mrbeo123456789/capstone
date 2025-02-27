import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const groupService = createApi({
    reducerPath: "group",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    tagTypes: ["Group"],
    endpoints: (builder) => ({
        getGroups: builder.query({
            query: () => "/groups",
            providesTags: ["Group"],
        }),
        createGroup: builder.mutation({
            query: (groupData) => ({
                url: "/groups",
                method: "POST",
                body: groupData,
            }),
            invalidatesTags: ["Group"],
        }),
        updateGroup: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/groups/${id}`,
                method: "PUT",
                body: patch,
            }),
            invalidatesTags: ["Group"],
        }),
        deleteGroup: builder.mutation({
            query: (id) => ({
                url: `/groups/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Group"],
        }),
    }),
});

export const {
    useGetGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation
} = groupService;
