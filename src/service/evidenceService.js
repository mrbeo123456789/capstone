import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const evidenceService = createApi({
    reducerPath: "evidence",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = localStorage.getItem("jwt_token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            // ❌ DO NOT manually set Content-Type for FormData
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
    }),
});

export const { useUploadEvidenceMutation } = evidenceService;
