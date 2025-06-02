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
        // 1. Top 3 cá nhân theo tiến độ
        getTop3ProgressRanking: builder.query({
            query: (challengeId) => `/rankings/progress/${challengeId}`,
            providesTags: ["Ranking"],
        }),
        // 2. Top 3 nhóm theo tiến độ
        getTop3GroupProgress: builder.query({
            query: (challengeId) => `/rankings/${challengeId}/group-top3-progress`,
            providesTags: ["Ranking"],
        }),
        // 3. Bảng xếp hạng sao theo challenge
        getChallengeStarLeaderboard: builder.query({
            query: ({ challengeId, page = 0, size = 10 }) => ({
                url: `/rankings/challenges/${challengeId}/stars`,
                params: { page, size },
            }),
            providesTags: ["Ranking"],
        }),
        // 4. Bảng xếp hạng cá nhân toàn cục
        getGlobalRanking: builder.query({
            query: ({ page = 0, size = 10, keyword = "" }) => ({
                url: `/rankings/global`,
                params: { page, size, keyword },
            }),
            providesTags: ["Ranking"],
        }),
        // 5. Xếp hạng cá nhân hiện tại
        getMyRanking: builder.query({
            query: () => `/rankings/global/me`,
            providesTags: ["Ranking"],
        }),
        // 6. Bảng xếp hạng nhóm toàn cục
        getGlobalGroupRanking: builder.query({
            query: ({ keyword = "", page = 0 }) => ({
                url: `/rankings/ranking/groups/global`,
                params: { keyword, page },
            }),
            providesTags: ["Ranking"],
        }),
        // 7. Xếp hạng sao theo nhóm trong một challenge
        getGroupStarRatingsByChallenge: builder.query({
            query: ({ challengeId, page = 0, size = 10 }) => ({
                url: `/rankings/${challengeId}/group-star-ratings`,
                params: { page, size },
            }),
            providesTags: ["Ranking"],
        }),
    }),
});

export const {
    useGetTop3ProgressRankingQuery,
    useGetTop3GroupProgressQuery,
    useGetChallengeStarLeaderboardQuery,
    useGetGlobalRankingQuery,
    useGetMyRankingQuery,
    useGetGlobalGroupRankingQuery,
    useGetGroupStarRatingsByChallengeQuery,
} = rankingService;
