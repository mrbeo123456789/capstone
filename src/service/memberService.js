import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../contant/contant.js";

export const memberService = createApi({
    reducerPath: "member",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers, { getState, endpoint }) => {
            const token = localStorage.getItem("jwt_token");
            if (token) {
                console.log(token);
                headers.set("Authorization", `Bearer ${token}`);
            }
            // ✅ Only set Content-Type for JSON requests, NOT for FormData
            if (endpoint !== "updateMember") {
                headers.set("Content-Type", "application/json");
            }
            return headers;
        },
    }),
    tagTypes: ["Member"],
    endpoints: (builder) => ({
        // API lấy danh sách thành viên
        getMembers: builder.query({
            query: () => "/member",
            providesTags: ["Member"],
        }),

        // API lấy thông tin thành viên theo ID
        getMemberById: builder.query({
            query: (id) => `/member/${id}`,
            providesTags: ["Member"],
        }),

        // API cập nhật thông tin thành viên
        updateMember: builder.mutation({
            query: ( formData ) => ({
                url: `/member/update`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Member"],
        }),

        changePassword: builder.mutation({
            query: (data) => ({
                url: "/member/change-password",
                method: "PUT",
                body: data,
            }),
            transformResponse: (response) => {
                console.log("Change Password Response:", response);
                return { message: response };
            },
        }),
    }),
});

export const {
    useGetMembersQuery,
    useGetMemberByIdQuery,
    useUpdateMemberMutation ,
    useChangePasswordMutation,
} = memberService;