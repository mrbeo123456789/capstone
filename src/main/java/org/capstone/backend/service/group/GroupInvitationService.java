package org.capstone.backend.service.group;

import org.capstone.backend.entity.GroupInvitation;
import java.util.List;

public interface GroupInvitationService {
    GroupInvitation createInvitation(Long groupId, List<String> emails);
    GroupInvitation updateInvitation(Long groupId, List<String> emails);
    String acceptInvitation(String inviteCode, String email);
}
