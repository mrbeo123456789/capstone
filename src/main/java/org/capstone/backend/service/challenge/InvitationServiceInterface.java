package org.capstone.backend.service.challenge;

import org.capstone.backend.dto.challenge.ChallengeSearchRequest;
import org.capstone.backend.dto.challenge.InvitationResponseDTO;
import org.capstone.backend.dto.challenge.InviteMemberRequest;
import org.capstone.backend.dto.group.MemberSearchRequest;
import org.capstone.backend.dto.group.MemberSearchResponse;
import org.capstone.backend.entity.ChallengeMember;

import java.util.List;

public interface InvitationServiceInterface {
    String sendInvitation(InviteMemberRequest request);
    String respondToInvitation(Long invitationId, boolean accept);
    List<InvitationResponseDTO> getInvitationsForMember();
    List<MemberSearchResponse> suggestMembers(Long challengeId);
    List<MemberSearchResponse> searchMembersForChallengeInvite(ChallengeSearchRequest request);
}
