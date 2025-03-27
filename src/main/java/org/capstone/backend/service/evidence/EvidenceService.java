package org.capstone.backend.service.evidence;

import org.capstone.backend.entity.Evidence;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface EvidenceService {
    Evidence uploadAndSubmitEvidence(MultipartFile file, Long challengeId) throws IOException;

}
