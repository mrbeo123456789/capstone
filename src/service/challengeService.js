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
            // ✅ Only set Content-Type for JSON requests, NOT for FormData
            if (endpoint !== "createChallenge") {
                headers.set("Content-Type", "application/json");
            }
            return headers;
        },
    }),
    tagTypes: ["Challenge", "ChallengeTypes"], // Add tag type for types if needed
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
            query: ({ id, ...patch }) => ({
                url: `/challenges/${id}`,
                method: "PUT",
                body: patch,
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
            providesTags: ["ChallengeTypes"], // Optional
        }),
        getApprovedChallenges: builder.query({
            query: ({ page = 0, size = 10 } = {}) => ({
                url: `/challenges/approved`,
                params: { page, size },
            }),
            providesTags: ["Challenge"],
        }),
        joinChallenge: builder.mutation({
            query: (challengeId) => ({
                url: `/challenges/join`,
                method: "POST",
                body: challengeId,
                headers: {
                    "Content-Type": "application/json", // Vì bạn gửi Long đơn giản
                },
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
        getJoinedMembersWithPendingEvidence: builder.query({
            query: ({ challengeId, keyword = "", page = 0, size = 10 } = {}) => {
                const params = new URLSearchParams();
                if (keyword.trim()) {
                    params.append("keyword", keyword.trim());
                }
                params.append("page", page);
                params.append("size", size);
                return `/challenges/${challengeId}/members?${params.toString()}`;
            },
            providesTags: ["Challenge"]
        }),
        kickMemberFromChallenge: builder.mutation({
            query: ({ challengeId, targetMemberId }) => ({
                url: `/challenges/${challengeId}/kick/${targetMemberId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Challenge"],
        }),
    }),
});

export const {
    useGetChallengesQuery,
    useCreateChallengeMutation,
    useUpdateChallengeMutation,
    useDeleteChallengeMutation,
    useGetChallengeTypesQuery, // <- Add this
    useGetApprovedChallengesQuery, // <--- Add this
    useJoinChallengeMutation, // <--- Add this!
    useGetMyChallengesMutation,
    useGetChallengeDetailQuery, // ✅ Thêm dòng này
    useGetJoinedMembersWithPendingEvidenceQuery,
    useKickMemberFromChallengeMutation,
} = challengeService;

