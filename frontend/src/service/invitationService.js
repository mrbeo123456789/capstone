import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const invitationService = createApi({
    reducerPath: "invitation",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwt_token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        sendInvitation: builder.mutation({
            query: (payload) => ({
                url: "/member/invitations/send/personal",
                method: "POST",
                body: payload,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),

        sendGroupInvitation: builder.mutation({
            query: (payload) => ({
                url: "/member/invitations/send/group",
                method: "POST",
                body: payload,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),

        respondInvitation: builder.mutation({
            query: ({ invitationId, invitationType, accept, groupId = null }) => ({
                url: `/member/invitations/respond`,
                method: "POST",
                body: {
                    invitationId,
                    invitationType,
                    accept,
                    groupId, // ✅ bổ sung thêm field groupId vào body
                },
            }),
        }),


        getMyInvitations: builder.query({
            query: () => ({
                url: "/member/invitations/member",
                method: "GET",
            }),
        }),

        searchMembersForChallengeInvite: builder.mutation({
            query: (payload) => ({
                url: `/member/invitations/search`,
                method: "POST",
                body: payload,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),

        suggestMembers: builder.query({
            query: (challengeId) => ({
                url: `/member/invitations/suggest/${challengeId}`,
                method: "GET",
            }),
        }),

        // ✅ Đặt đúng chỗ ở đây
        searchAvailableGroupLeaders: builder.mutation({
            query: ({ challengeId, keyword }) => ({
                url: `/member/invitations/${challengeId}/search-leaders`,
                params: { keyword },
                method: "GET",
            }),
        }),
    }),
});

export const {
    useSendInvitationMutation,
    useSendGroupInvitationMutation,
    useRespondInvitationMutation,
    useGetMyInvitationsQuery,
    useSearchMembersForChallengeInviteMutation,
    useSuggestMembersQuery,
    useSearchAvailableGroupLeadersMutation,
} = invitationService;