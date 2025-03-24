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
    }),
});

export const {
    useGetChallengesQuery,
    useCreateChallengeMutation,
    useUpdateChallengeMutation,
    useDeleteChallengeMutation,
    useGetChallengeTypesQuery // <- Add this
} = challengeService;

