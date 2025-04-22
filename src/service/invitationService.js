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
        // POST: /api/member/invitations/send/personal
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

        // POST: /api/member/invitations/send/group
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
            query: ({ invitationId, invitationType, accept }) => ({
                url: `/member/invitations/respond`,
                method: "POST",
                body: { invitationId, invitationType, accept }, // 👈 gửi đúng dạng DTO
            }),
        }),



        // GET: /api/member/invitations/member
        getMyInvitations: builder.query({
            query: () => ({
                url: "/member/invitations/member",
                method: "GET",
            }),
        }),

        // POST: /api/member/invitations/search
        searchMembersForChallengeInvite: builder.mutation({
            query: (payload) => ({
                url: `/member/invitations/search`,
                method: "POST",
                body: payload, // { challengeid: ..., keyword: ... }
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),

        // GET: /api/member/invitations/suggest/{challengeId}
        suggestMembers: builder.query({
            query: (challengeId) => ({
                url: `/member/invitations/suggest/${challengeId}`,
                method: "GET",
            }),
        }),

        // GET: /api/member/invitations/{challengeId}/search-leaders
        searchAvailableGroupLeaders: builder.mutation({
            query: ({ challengeId, keyword }) => ({
                url: `/member/invitations/${challengeId}/search-leaders`,
                method: "GET",
                params: { keyword },
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
