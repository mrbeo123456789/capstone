package org.capstone.backend.service.challenge;

import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.repository.ChallengeTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ChallengeTypeServiceImpl implements ChallengeTypeService {
    @Autowired
    private ChallengeTypeRepository repository;

    // 🔍 Phân trang + lọc keyword (tên chứa keyword)
    public Page<ChallengeType> findAllPaged(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (keyword == null || keyword.isBlank()) {
            return repository.findAll(pageable);
        } else {
            return repository.findByNameContainingIgnoreCase(keyword, pageable);
        }
    }

    public ChallengeType create(ChallengeType challengeType) {
        challengeType.setCreatedAt(LocalDateTime.now());
        challengeType.setUpdatedAt(LocalDateTime.now());
        return repository.save(challengeType);
    }

    public ChallengeType update(Long id, ChallengeType updated) {
        return repository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setDescription(updated.getDescription());
            existing.setUpdatedAt(LocalDateTime.now());
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("ChallengeType not found"));
    }

    public void delete(Long id) {
        ChallengeType challengeType = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ChallengeType not found"));

        // Nếu có liên kết với Challenge khác, xử lý tại đây (nếu có logic đó)

        repository.delete(challengeType); // Xoá entity đã tải
    }

}
