import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";
import { decode } from "jsonwebtoken-esm";

export const adminUserService = createApi({
    reducerPath: "adminUser",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            try {
                const token = localStorage.getItem("jwt_token");

                if (token) {
                    // Sử dụng template literal với backticks
                    headers.set("Authorization", `Bearer ${token}`);

                    try {
                        const decodedToken = decode(token);

                        if (!decodedToken || !decodedToken.roles || !decodedToken.roles.includes("ADMIN")) {
                            console.error("User does not have ADMIN role.");
                            throw new Error("Unauthorized: Admin access required");
                        }
                    } catch (decodeError) {
                        console.error("Invalid token or decoding failed:", decodeError.message);
                        throw new Error("Unauthorized: Invalid token.");
                    }
                } else {
                    console.error("Token not found in localStorage.");
                    throw new Error("Unauthorized: No token provided.");
                }
            } catch (error) {
                console.error("Error fetching token or unauthorized access:", error.message);
                throw error;
            }

            headers.set("Content-Type", "application/json");
            return headers;
        }
    }),
    tagTypes: ["Admin"],
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: ({ page = 0, size = 10, keyword = "", status = "" } = {}) => {
                const params = new URLSearchParams();
                params.append("page", page);
                params.append("size", size);
                if (keyword.trim()) params.append("keyword", keyword.trim());
                if (status.trim()) params.append("status", status.trim());
                const url = `/admin/accounts/get?${params.toString()}`;
                console.log("Fetching URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),

        getUserById: builder.query({
            query: (id) => {
                const url = `/admin/accounts/getDetail/${id}`;
                console.log("Fetching URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),
        banUser: builder.mutation({
            query: ({ id }) => {
                console.log("Banning User with ID:", id);
                return {
                    url: `/admin/accounts/ban/${id}`,
                    method: "PUT",
                };
            },
            invalidatesTags: ["Admin"],
        }),
        unbanUser: builder.mutation({
            query: ({ id }) => {
                console.log("Unbanning User with ID:", id);
                return {
                    url: `/admin/accounts/unban/${id}`,
                    method: "PUT",
                };
            },
            invalidatesTags: ["Admin"],
        }),
        searchUsers: builder.query({
            query: (query) => {
                const url = `/admin/accounts/get?search=${query}`;
                console.log("Searching Users with URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),
        getChallenges: builder.query({
            query: ({ page = 0, size = 10, name = "", status = "" } = {}) => {
                const params = new URLSearchParams();
                params.append("page", page);
                params.append("size", size);
                if (name && name.trim()) {
                    params.append("name", name.trim());
                }
                if (status && status.trim()) {
                    params.append("status", status.trim());
                }
                const url = `/admin/challenges/all?${params.toString()}`;
                console.log("Fetching Challenges URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),

        getGroups: builder.query({
            query: ({ page = 0, size = 10 } = {}) => {
                const url = `/admin/groups/all?page=${page}&size=${size}`;
                console.log("Fetching Challenges URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),
        getSummary: builder.query({
            query: () => 'admin/dashboard/summary',
            providesTags: ['Admin'],
        }),
        getGrowth: builder.query({
            query: ({ range = 'MONTH' } = {}) => `admin/dashboard/growth?range=${encodeURIComponent(range)}`,
            providesTags: ['Dashboard'],
        }),

        reviewChallenge: builder.mutation({
            query: (reviewData) => ({
                url: '/admin/challenges/review',  // Fixed URL path
                method: 'POST',
                body: reviewData,
                responseHandler: async (response) => {
                    // First try to get response as JSON
                    try {
                        const data = await response.json();
                        return data;
                    } catch (error) {
                        // If JSON parsing fails, get response as text
                        const text = await response.text();
                        return { message: text, success: response.ok };
                    }
                }
            }),
            invalidatesTags: ["Admin"],
        }),

        getChallengeTypes: builder.query({
            query: ({ keyword = "", page = 0, size = 10 } = {}) => {
                const params = new URLSearchParams();
                params.append("page", page);
                params.append("size", size);
                if (keyword && keyword.trim()) {
                    params.append("keyword", keyword.trim());
                }
                const url = `/admin/setting/challenge-types?${params.toString()}`;
                console.log("Fetching ChallengeTypes URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),

        createChallengeType: builder.mutation({
            query: (challengeType) => ({
                url: `/admin/setting/challenge-types`,
                method: "POST",
                body: challengeType,
            }),
            invalidatesTags: ["Admin"],
        }),

        updateChallengeType: builder.mutation({
            query: ({ id, challengeType }) => ({
                url: `/admin/setting/challenge-types/${id}`,
                method: "PUT",
                body: challengeType,
            }),
            invalidatesTags: ["Admin"],
        }),

        deleteChallengeType: builder.mutation({
            query: (id) => ({
                url: `/admin/setting/challenge-types/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admin"],
        }),

        // --- INTERESTS ---
        getInterests: builder.query({
            query: ({ keyword = "", page = 0, size = 10 } = {}) => {
                const params = new URLSearchParams();
                params.append("page", page);
                params.append("size", size);
                if (keyword && keyword.trim()) {
                    params.append("keyword", keyword.trim());
                }
                const url = `/admin/setting/interests?${params.toString()}`;
                console.log("Fetching Interests URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),

        createInterest: builder.mutation({
            query: (interest) => ({
                url: `/admin/setting/interests`,
                method: "POST",
                body: interest,
            }),
            invalidatesTags: ["Admin"],
        }),

        updateInterest: builder.mutation({
            query: ({ id, interest }) => ({
                url: `/admin/setting/interests/${id}`,
                method: "PUT",
                body: interest,
            }),
            invalidatesTags: ["Admin"],
        }),

        deleteInterest: builder.mutation({
            query: (id) => ({
                url: `/admin/setting/interests/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Admin"],
        }),
        filterReports: builder.query({
            query: ({ reportType = "", page = 0, size = 10 } = {}) => {
                const params = new URLSearchParams();
                params.append("page", page);
                params.append("size", size);
                if (reportType.trim()) {
                    params.append("reportType", reportType.trim());
                }
                const url = `/admin/reports/all?${params.toString()}`;
                console.log("Fetching Reports URL:", url);
                return url;
            },
            providesTags: ["Admin"],
        }),
        // Endpoint để cập nhật trạng thái báo cáo dựa vào reportId và status
        updateReportStatus: builder.mutation({
            query: ({ reportId, status }) => ({
                url: `/admin/reports/${reportId}?status=${encodeURIComponent(status)}`,
                method: "PUT"
            }),
            invalidatesTags: ["Admin"],
        }),
        getEvidencesByMemberAndChallenge: builder.query({
            query: ({ memberId, challengeId, page = 0 } = {}) => {
                const params = new URLSearchParams();
                params.append("memberId", memberId);
                params.append("challengeId", challengeId);
                params.append("page", page);
                return `/admin/challenges/getEvidence?${params.toString()}`;
            },
            providesTags: ["Admin"],
        }),
    }),
});


export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useBanUserMutation,
    useUnbanUserMutation,
    useGetChallengesQuery,
    useReviewChallengeMutation,
    useGetGroupsQuery,
    useGetSummaryQuery,
    useGetGrowthQuery,
    useGetChallengeTypesQuery,
    useCreateChallengeTypeMutation,
    useUpdateChallengeTypeMutation,
    useDeleteChallengeTypeMutation,
    useGetInterestsQuery,
    useCreateInterestMutation,
    useUpdateInterestMutation,
    useDeleteInterestMutation,
    useFilterReportsQuery,
    useUpdateReportStatusMutation,
    useGetEvidencesByMemberAndChallengeQuery,
} = adminUserService;
