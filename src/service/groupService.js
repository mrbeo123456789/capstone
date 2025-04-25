import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const groupService = createApi({
    reducerPath: "group",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers, { getState, endpoint }) => {
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
                url: `/groups/edit/${id}`,
                method: "PUT",
                body: patch,
            }),
            invalidatesTags: ["Group"],
        }),
        deleteGroup: builder.mutation({
            query: (id) => ({
                url: `/groups/${id}/disband`,
                method: "DELETE",
            }),
            invalidatesTags: ["Group"],
        }),
        searchMembers: builder.mutation({
            query: (searchPayload) => ({
                url: "/groups/search",
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
        kickMember: builder.mutation({
            query: ({ groupId, memberId }) => ({
                url: `/groups/${groupId}/kick`,
                method: "POST",
                body: { memberId },
            }),
            invalidatesTags: ["Group"],
        }),
        leaveGroup: builder.mutation({
            query: (groupId) => ({
                url: `/groups/${groupId}/leave`,
                method: "POST",
            }),
            invalidatesTags: ["Group"],
        }),
        getGroupRanking: builder.query({
            query: ({ groupId, keyword = "", page = 0, size = 10 }) => ({
                url: `/groups/${groupId}/ranking`,
                method: "GET",
                params: { keyword, page, size },
            }),
        }),
        getGroupChallengeHistory: builder.query({
            query: ({ groupId, status = "", page = 0 }) => ({
               url: `/groups/${groupId}/challenge-history`,
               params: { status, page },
            }),
         providesTags: ["Group"],
       }),
        getAvailableGroups: builder.query({
            query: () => "/groups/available-to-join",
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
    useKickMemberMutation,
    useLeaveGroupMutation,
    useGetGroupRankingQuery,
    useGetAvailableGroupsQuery,
    useGetGroupChallengeHistoryQuery,
} = groupService;
