// src/service/interestService.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant";

export const interestService = createApi({
    reducerPath: "interest",
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
        // GET: /api/member/interests/get
        getMyInterests: builder.query({
            query: () => ({
                url: "/member/interests/get",
                method: "GET",
            }),
        }),

        // POST: /api/member/interests/update
        updateMyInterests: builder.mutation({
            query: (interestIds) => ({
                url: "/member/interests/update",
                method: "POST",
                body: { interestIds },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),
    }),
});

export const {
    useGetMyInterestsQuery,
    useUpdateMyInterestsMutation
} = interestService;
