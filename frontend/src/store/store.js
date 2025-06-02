import {configureStore} from "@reduxjs/toolkit";
import { groupService } from "../service/groupService.js";
import {authService} from "../service/authService.js";
import {memberService} from "../service/memberService.js";
import {adminUserService} from "../service/adminService.js";
import {challengeService} from "../service/challengeService.js";
import {evidenceService} from "../service/evidenceService.js";
import {interestService} from "../service/interestService.js";
import {invitationService} from "../service/invitationService.js";
import {guestService} from "../service/guestService.js";
import {notificationService} from "../service/notficaitionService.js";
import {rankingService} from "../service/rankingService.js";
import {evidenceVoteService} from "../service/evidenceVoteService.js";
import {achievementService} from "../service/achievementService.js";
export const store = configureStore({
    reducer: {
        [authService.reducerPath]: authService.reducer,
        [groupService.reducerPath]: groupService.reducer,
        [memberService.reducerPath]: memberService.reducer,
        [adminUserService.reducerPath]: adminUserService.reducer,
        [challengeService.reducerPath]: challengeService.reducer,
        [evidenceService.reducerPath]: evidenceService.reducer,
        [evidenceVoteService.reducerPath]: evidenceVoteService.reducer,
        [interestService.reducerPath]: interestService.reducer,
        [invitationService.reducerPath]: invitationService.reducer,
        [guestService.reducerPath]: guestService.reducer,
        [rankingService.reducerPath]: rankingService.reducer,
        [achievementService.reducerPath]: achievementService.reducer,
        [notificationService.reducerPath]: notificationService.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authService.middleware)
            .concat(groupService.middleware)
            .concat(memberService.middleware)
            .concat(adminUserService.middleware)
            .concat(memberService.middleware)
            .concat(challengeService.middleware)
            .concat(achievementService.middleware)
            .concat(evidenceService.middleware)
            .concat(evidenceVoteService.middleware)
            .concat(interestService.middleware)
            .concat(invitationService.middleware)
            .concat(guestService.middleware)
            .concat(rankingService.middleware)
            .concat(notificationService.middleware),
})