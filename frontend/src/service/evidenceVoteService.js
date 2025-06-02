import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const evidenceVoteService = createApi({
    reducerPath: "evidenceVote",
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
    tagTypes: ["EvidenceVote"],
    endpoints: (builder) => ({
        // ✅ Vote on evidence
        voteEvidence: builder.mutation({
            query: ({ evidenceId, score }) => ({
                url: `/evidence-votes/${evidenceId}`,
                method: "POST",
                body: { score },
            }),
            invalidatesTags: ["EvidenceVote"],
        }),

        // ✅ Get evidence list to vote by challenge
        getEvidenceToVoteByChallenge: builder.query({
            query: (challengeId) => `/evidence-votes/tasks/${challengeId}`,
            providesTags: ["EvidenceVote"],
        }),

        // ✅ Add to endpoints:
        getMyVotedEvidence: builder.query({
            query: (challengeId) => ({
                url: "/evidence-votes/my-votes",
                method: "GET",
                params: challengeId ? { challengeId } : undefined,
            }),
            providesTags: ["EvidenceVote"],
        }),
    }),
});

export const {
    useVoteEvidenceMutation,
    useGetEvidenceToVoteByChallengeQuery,
    useGetMyVotedEvidenceQuery,
} = evidenceVoteService;
