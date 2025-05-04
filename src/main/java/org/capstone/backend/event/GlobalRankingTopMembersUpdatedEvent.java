package org.capstone.backend.event;

import java.util.List;
import org.capstone.backend.entity.Member;

public record GlobalRankingTopMembersUpdatedEvent(List<Member> topMembers) {
}
