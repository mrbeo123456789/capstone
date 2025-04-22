import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const evidenceService = createApi({
    reducerPath: "evidence",
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
        // POST: /evidences/upload
        uploadEvidence: builder.mutation({
            query: ({ file, challengeId }) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("data", challengeId);
                return {
                    url: "/evidences/upload",
                    method: "POST",
                    body: formData,
                };
            },
        }),

        // POST: /evidences/review
        reviewEvidence: builder.mutation({
            query: (reviewData) => ({
                url: "/evidences/review",
                method: "POST",
                body: reviewData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),

        // GET: /evidences/get-list-for-host/{challengeId}?page=0&size=10
        getEvidenceByChallengeForHost: builder.query({
            query: ({ challengeId, page = 0, size = 10 }) => ({
                url: `/evidences/get-list-for-host/${challengeId}`,
                params: { page, size },
                method: "GET",
            }),
        }),

        // GET: /evidences/{challengeId}/to-review
        getEvidencesToReview: builder.query({
            query: (challengeId) => ({
                url: `/evidences/${challengeId}/to-review`,
                method: "GET",
            }),
        }),

        // GET: /evidences/{challengeId}/my-evidences
        getMyEvidencesByChallenge: builder.query({
            query: (challengeId) => ({
                url: `/evidences/${challengeId}/my-evidences`,
                method: "GET",
            }),
        }),

        getEvidencesForHost: builder.query({
            query: ({ challengeId, memberId, status, page = 0, size = 10 }) => {
                // Build params matching backend @GetMapping("/host/evidences")
                const params = { challengeId, page, size };
                if (memberId != null) params.memberId = memberId;
                if (status) params.status = status;
                return {
                    url: "/evidences/host/evidences",
                    method: "GET",
                    params,
                };
            },
        }),
        getEvidenceCountByStatus: builder.query({
            query: ({ challengeId, memberId }) => ({
                url: "/evidences/count",
                method: "GET",
                params: { challengeId, memberId },
            }),
        }),

        getTasksForDate: builder.query({
            query: (date) => {
                // If date is not provided, the backend will use current date
                const params = {};
                if (date) {
                    // Ensure date is in ISO format (YYYY-MM-DD)
                    if (date instanceof Date) {
                        params.date = date.toISOString().split('T')[0];
                    } else {
                        params.date = date;
                    }
                }
                return {
                    url: "/evidences/tasks",
                    method: "GET",
                    params,
                };
            },
        }),
    }),
});

export const {
    useUploadEvidenceMutation,
    useReviewEvidenceMutation,
    useGetEvidenceByChallengeForHostQuery,
    useGetEvidencesToReviewQuery,
    useGetMyEvidencesByChallengeQuery,
    useGetEvidencesForHostQuery,
    useGetEvidenceCountByStatusQuery,
    useGetTasksForDateQuery
} = evidenceService;