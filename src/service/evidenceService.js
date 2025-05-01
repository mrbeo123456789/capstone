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

        reviewEvidence: builder.mutation({
            query: (reviewData) => ({
                url: "/evidences/review",
                method: "POST",
                body: reviewData,
                headers: { "Content-Type": "application/json" },
            }),
        }),

        getEvidenceByChallengeForHost: builder.query({
            query: ({ challengeId, page = 0, size = 10 }) => ({
                url: `/evidences/get-list-for-host/${challengeId}`,
                params: { page, size },
                method: "GET",
            }),
        }),

        getEvidencesToReview: builder.query({
            query: (challengeId) => ({
                url: `/evidences/${challengeId}/to-review`,
                method: "GET",
            }),
        }),

        getMyEvidencesByChallenge: builder.query({
            query: (challengeId) => ({
                url: `/evidences/${challengeId}/my-evidences`,
                method: "GET",
            }),
        }),

        getEvidencesForHost: builder.query({
            query: ({ challengeId, memberId, status, page = 0, size = 10 }) => {
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
                const params = {};
                if (date) {
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

        moderateVideo: builder.mutation({
            queryFn: async (file) => {
                try {
                    const formData = new FormData();
                    formData.append('media', file);
                    formData.append('workflow', 'wfl_imxfyZCkPIDEUH4ufI9TB'); // ✅ gửi workflow id
                    formData.append('api_user', '1576831988');
                    formData.append('api_secret', '8nvmRXAxL5y7mUYWoZbNGPbVATdDSZWQ');

                    const response = await fetch("https://api.sightengine.com/1.0/check-workflow.json", {
                        method: "POST",
                        headers: {
                            "Accept": "application/json", // cho chắc chắn
                        },
                        body: formData,
                    });

                    const data = await response.json();
                    return { data };
                } catch (error) {
                    return { error };
                }
            }
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
    useGetTasksForDateQuery,
    useModerateVideoMutation,
} = evidenceService;
