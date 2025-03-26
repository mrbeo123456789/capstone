import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const groupService = createApi({
    reducerPath: "group",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers , { getState, endpoint }) => {
            const token = localStorage.getItem("jwt_token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            // ✅ Only set Content-Type for JSON requests, NOT for FormData
            if (endpoint !== "createGroup") {
                headers.set("Content-Type", "application/json");
            }
            return headers;
        },
    }),
    tagTypes: ["Group"],
    endpoints: (builder) => ({
        getGroups: builder.query({
            query: () => "/groups/groupslist",
            providesTags: ["Group"],
        }),
        createGroup: builder.mutation({
            query: (groupData) => ({
                url: "/groups/create",
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
        searchMembers: builder.mutation({
            query: (searchPayload) => ({
                url: "/groups/search",  // assuming this is the full path
                method: "POST",
                body: searchPayload,
            }),
        }),
        inviteMembers: builder.mutation({
            query: (invitePayload) => ({
                url: "/groups/invite",
                method: "POST",
                body: invitePayload,
            }),
        }),
        getPendingInvitations: builder.query({
            query: () => "/groups/invitations",
        }),
        respondToInvitation: builder.mutation({
            query: ({ groupId, status }) => ({
                url: "/groups/respond",
                method: "POST",
                body: { groupId, status },
            }),
        }),
        getGroupDetail: builder.query({
            query: (groupId) => `/groups/detail/${groupId}`,
        }),


    }),
});

export const {
    useGetGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
    useSearchMembersMutation,
    useInviteMembersMutation,
    useGetPendingInvitationsQuery,
    useRespondToInvitationMutation,
    useGetGroupDetailQuery,
} = groupService;
