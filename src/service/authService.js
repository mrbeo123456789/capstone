import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {BASE_URL} from "../utils/contant.js";

export const authService = createApi({
    reducerPath:"auth",
    baseQuery: fetchBaseQuery({baseUrl:BASE_URL}),
    tagTypes: ["auth"],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: "/api/auth/login",
                method: "POST",
                body: data,
                responseHandler:  (response) => response.text(),
            })
        })
    })
})

export const {
    useLoginMutation,
} = authService