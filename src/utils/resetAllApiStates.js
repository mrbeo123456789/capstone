// Import tất cả các api slice bạn đang dùng

import {memberService} from "../service/memberService.js";
import {notificationService} from "../service/notficaitionService.js";
import {rankingService} from "../service/rankingService.js";
import {achievementService} from "../service/achievementService.js";
import {challengeService} from "../service/challengeService.js";
import {evidenceService} from "../service/evidenceService.js";
import {groupService} from "../service/groupService.js";
import {evidenceVoteService} from "../service/evidenceVoteService.js";
import {guestService} from "../service/guestService.js";
import {interestService} from "../service/interestService.js";
import {invitationService} from "../service/invitationService.js";
import {adminUserService} from "../service/adminService.js";

// Tạo mảng gom toàn bộ slice lại
const allApiSlices = [
    achievementService,
    adminUserService,
    challengeService,
    evidenceService,
    evidenceVoteService,
    groupService,
    guestService,
    interestService,
    invitationService,
    memberService,
    notificationService,
    rankingService,
];

// Hàm gọi reset tất cả slice
export const resetAllApiStates = (dispatch) => {
    allApiSlices.forEach((api) => {
        dispatch(api.util.resetApiState());
    });
};
