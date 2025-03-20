import {configureStore} from "@reduxjs/toolkit";
import { groupService } from "../service/groupService.js";
import {authService} from "../service/authService.js";
import {memberService} from "../service/memberService.js";
import {adminUserService} from "../service/adminService.js";
export const store = configureStore({
    reducer: {
        [authService.reducerPath]: authService.reducer,
        [groupService.reducerPath]: groupService.reducer,
        [memberService.reducerPath]: memberService.reducer,
        [adminUserService.reducerPath]: adminUserService.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authService.middleware)
            .concat(groupService.middleware)
            .concat(memberService.middleware)
            .concat(adminUserService.middleware),
})