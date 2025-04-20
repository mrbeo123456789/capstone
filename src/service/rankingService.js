import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const rankingService = createApi({
    reducerPath: "ranking",
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
    tagTypes: ["Ranking"],
    endpoints: (builder) => ({
        getTop3ProgressRanking: builder.query({
            query: (challengeId) => `/rankings/progress/${challengeId}`,
            providesTags: ["Ranking"],
        }),
        getChallengeStarLeaderboard: builder.query({
            query: ({ challengeId, page = 0, size = 10 }) => ({
                url: `/rankings/challenges/${challengeId}/stars`,
                params: { page, size },
            }),
            providesTags: ["Ranking"],
        }),
        getGlobalRanking: builder.query({
            query: ({ page = 0, size = 10 }) => ({
                url: `/rankings/global`,
                params: { page, size },
            }),
            providesTags: ["Ranking"],
        }),
    }),
});

export const {
    useGetTop3ProgressRankingQuery,
    useGetChallengeStarLeaderboardQuery,
    useGetGlobalRankingQuery,
} = rankingService;