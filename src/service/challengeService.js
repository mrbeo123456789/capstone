import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const challengeService = createApi({
    reducerPath: "challenge",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers, { getState, endpoint }) => {
            const token = localStorage.getItem("jwt_token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            if (endpoint !== "createChallenge" && endpoint !== "updateChallenge") {
                headers.set("Content-Type", "application/json");
            }
            return headers;
        },
    }),
    tagTypes: ["Challenge", "ChallengeTypes"],
    endpoints: (builder) => ({
        getChallenges: builder.query({
            query: () => "/challenges",
            providesTags: ["Challenge"],
        }),
        createChallenge: builder.mutation({
            query: (challengeData) => ({
                url: "/challenges/create",
                method: "POST",
                body: challengeData,
            }),
            invalidatesTags: ["Challenge"],
        }),
        updateChallenge: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/challenges/${id}/update`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Challenge"],
        }),
        deleteChallenge: builder.mutation({
            query: (id) => ({
                url: `/challenges/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Challenge"],
        }),
        getChallengeTypes: builder.query({
            query: () => "/challenges/challenge-types",
            providesTags: ["ChallengeTypes"],
        }),
        getApprovedChallenges: builder.query({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `/challenges/approved`,
                params: { page, size },
            }),
            providesTags: ["Challenge"],
        }),
        getUpcomingApprovedChallenges: builder.query({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `/challenges/public/upcoming`,
                params: { page, size },
            }),
            providesTags: ["Challenge"],
        }),
        joinChallenge: builder.mutation({
            query: (challengeId) => ({
                url: `/challenges/join`,
                method: "POST",
                body: challengeId,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: ["Challenge"],
        }),
        getMyChallenges: builder.mutation({
            query: (challengeRole) => ({
                url: '/challenges/my-challenges',
                method: 'POST',
                body: challengeRole,
            }),
        }),
        getChallengeDetail: builder.query({
            query: (challengeId) => `/challenges/${challengeId}/detail`,
        }),
        reportChallenge: builder.mutation({
            query: (payload) => ({
                url: "/challenges/report",
                method: "POST",
                body: payload,
                headers: {
                    "Content-Type": "application/json", // ✅ Ensure JSON format
                },
            }),
        }),
        toggleCoHost: builder.mutation({
            query: ({ challengeId, memberId }) => ({
                url: `/challenges/${challengeId}/change-roles/${memberId}`,
                method: "PUT",
            }),
        }),
        joinGroupToChallenge: builder.mutation({
            query: ({ groupId, challengeId }) => ({
                url: `/challenges/${groupId}/join-challenge/${challengeId}`,
                method: "POST",
            }),
        }),
        leaveChallenge: builder.mutation({
            query: (challengeId) => ({
                url: `/challenges/${challengeId}/leave`,
                method: "POST",
            }),
        }),
        cancelChallenge: builder.mutation({
            query: (challengeId) => ({
                url: `/challenges/${challengeId}/cancel`,
                method: "POST",
            }),
        }),
        kickMemberFromChallenge: builder.mutation({
            query: ({ challengeId, targetMemberId }) => ({
                url: `/challenges/${challengeId}/kick/${targetMemberId}`,
                method: "DELETE",
            }),
        }),
        getJoinedMembersWithPendingEvidence: builder.query({
            query: ({ challengeId, keyword = "", page = 0, size = 10 } = {}) => {
                const params = new URLSearchParams();
                if (keyword.trim()) {
                    params.append("keyword", keyword.trim());
                }
                params.append("page", page);
                params.append("size", size);
                return `challenges/${challengeId}/members?${params.toString()}`;
            },
            providesTags: ["Challenge"]
        }),
        getCompletedChallenges: builder.query({
            query: () => "/challenges/completed", // 👈 your backend endpoint
            providesTags: ["Challenge"],
        }),
        getChallengeStatistics: builder.query({
            query: (challengeId) => `/challenges/${challengeId}/statistics`,
            providesTags: ["Challenge"],
        }),
    }),
});

export const {
    useGetChallengesQuery,
    useCreateChallengeMutation,
    useUpdateChallengeMutation,
    useDeleteChallengeMutation,
    useGetChallengeTypesQuery,
    useGetApprovedChallengesQuery,
    useGetUpcomingApprovedChallengesQuery,
    useJoinChallengeMutation,
    useGetMyChallengesMutation,
    useGetChallengeDetailQuery,
    useReportChallengeMutation,
    useToggleCoHostMutation,
    useJoinGroupToChallengeMutation,
    useLeaveChallengeMutation,
    useCancelChallengeMutation,
    useKickMemberFromChallengeMutation,
    useGetJoinedMembersWithPendingEvidenceQuery,
    useLazyGetCompletedChallengesQuery ,
    useGetChallengeStatisticsQuery,
} = challengeService;

