import {configureStore} from "@reduxjs/toolkit";
import {userService} from "../page/service/userService.js";
import {employeeService} from "../page/service/employeeService.js";
import {departmentService} from "../page/service/departmentService.js";
import {roleService} from "../page/service/roleService.js";
import {scheduleService} from "../page/service/scheduleService.js";
import {jobService} from "../page/service/jobService.js";
import {candidateService} from "../page/service/candidateService.js";
import {interviewScheduleService} from "../page/service/interviewScheduleService.js";

import {authService} from "../service/authService.js";
export const store = configureStore({
    reducer: {
        [userService.reducerPath]: userService.reducer,
        [employeeService.reducerPath]: employeeService.reducer,
        [departmentService.reducerPath]: departmentService.reducer,
        [roleService.reducerPath]: roleService.reducer,
        [scheduleService.reducerPath]: scheduleService.reducer,
        [jobService.reducerPath]: jobService.reducer,
        [candidateService.reducerPath]: candidateService.reducer,
        [interviewScheduleService.reducerPath]: interviewScheduleService.reducer,
        [authService.reducerPath]: authService.reducer,
        [jobService.reducerPath]: jobService.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(userService.middleware,
            employeeService.middleware,
            departmentService.middleware,
            scheduleService.middleware,
            roleService.middleware,
            jobService.middleware,
            candidateService.middleware,
            interviewScheduleService.middleware,
            userService.middleware,
            authService.middleware,
            jobService.middleware,
        ),
})