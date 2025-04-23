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
                query: ({ page = 0, size = 10, keyword = "" }) => ({
               url: `/rankings/global`,
               params: { page, size, keyword },
             }),
        providesTags: ["Ranking"],
       }),
        getTop3Progress: builder.query({
            query: (challengeId) => `/rankings/${challengeId}/group-top3-progress`,
            providesTags: ["Ranking"],
        }),
        // 2. Top 3 group theo tiến độ của 1 challenge
        getTop3GroupProgress: builder.query({
            query: (challengeId) => `/rankings/${challengeId}/group-top3-progress`,
            providesTags: ["Ranking"],
        }),
        // 3. Lấy xếp hạng cá nhân của user hiện tại
        getMyRanking: builder.query({
            query: () => `/rankings/global/me`,
            providesTags: ["Ranking"],
        }),
        // 4. Lấy xếp hạng toàn cục của các nhóm (phân trang + search)
        getGlobalGroupRanking: builder.query({
            query: ({ keyword = "", page = 0 }) => ({
                url: `/rankings/ranking/groups/global`,
                params: { keyword, page },
            }),
            providesTags: ["Ranking"],
        }),
    }),
});

export const {
    useGetTop3ProgressRankingQuery,
    useGetChallengeStarLeaderboardQuery,
    useGetGlobalRankingQuery,
    useGetTop3ProgressQuery,
    useGetTop3GroupProgressQuery,
    useGetMyRankingQuery,
    useGetGlobalGroupRankingQuery,
} = rankingService;