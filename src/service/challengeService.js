import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const challengeService = createApi({
    reducerPath: "challenge",
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
    tagTypes: ["Challenge"],
    endpoints: (builder) => ({
        getChallenges: builder.query({
            query: () => "/challenges",
            providesTags: ["Challenge"],
        }),
        createChallenge: builder.mutation({
            query: (challengeData) => ({
                url: "/challenges",
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
    }),
});

export const {
    useGetChallengesQuery,
    useCreateChallengeMutation,
    useUpdateChallengeMutation,
    useDeleteChallengeMutation
} = challengeService;
