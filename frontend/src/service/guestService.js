import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant";

export const guestService = createApi({
    reducerPath: "guestApi",
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    endpoints: (builder) => ({
        getUpcomingChallenges: builder.query({
            query: ({ page = 0, size = 10 }) => ({
                url: "/challenges/public/upcoming",
                method: "GET",
                params: { page, size },
            }),
        }),
        getChallengesByStatus: builder.query({
            query: ({ status = null, page = 0, size = 10 }) => ({
                url: "/challenges/public/challenges",
                method: "GET",
                params: { status, page, size },
            }),
        }),
    }),
});

export const {
    useGetUpcomingChallengesQuery ,
    useGetChallengesByStatusQuery,
    useLazyGetChallengesByStatusQuery
} = guestService;