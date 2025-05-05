package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.*;
import org.capstone.backend.dto.group.MemberSearchResponse;

import java.util.List;

public interface InvitationService {
    String sendInvitation(InviteMemberRequest request);
    String sendGroupInvitationToChallenge(InviteGroupToChallengeRequest request);
    String respondToInvitation(InvitationRespondRequestDTO request);
    List<InvitationResponseDTO> getInvitationsForMember();
    List<MemberSearchResponse> suggestMembers(Long challengeId);
    List<MemberSearchResponse> searchMembersForChallengeInvite(ChallengeSearchRequest request);
    List<MemberSearchResponse> searchAvailableGroupLeaders(Long challengeId, String keyword);


}
