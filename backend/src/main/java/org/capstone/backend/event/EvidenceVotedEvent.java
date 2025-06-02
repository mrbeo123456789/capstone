package org.capstone.backend.event;

import lombok.Getter;
import org.capstone.backend.entity.Member;


public record EvidenceVotedEvent(Member voter) {}
