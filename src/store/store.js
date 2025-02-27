import {configureStore} from "@reduxjs/toolkit";

import {authService} from "../service/authService.js";
export const store = configureStore({
    reducer: {
        [authService.reducerPath]: authService.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authService.middleware,
        ),
})