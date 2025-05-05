package org.capstone.backend.service.challenge;

import org.capstone.backend.entity.ChallengeType;
import org.capstone.backend.repository.ChallengeTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class ChallengeTypeServiceImpl implements ChallengeTypeService {
    @Autowired
    private ChallengeTypeRepository repository;

    // 🔍 Phân trang + lọc theo keyword (tên chứa keyword)
    @Override
    public Page<ChallengeType> findAllPaged(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (keyword == null || keyword.isBlank()) {
            return repository.findAll(pageable);
        } else {
            return repository.findByNameContainingIgnoreCase(keyword, pageable);
        }
    }

    @Override
    public ChallengeType create(ChallengeType challengeType) {
        challengeType.setCreatedAt(LocalDateTime.now());
        challengeType.setUpdatedAt(LocalDateTime.now());
        return repository.save(challengeType);
    }

    @Override
    public ChallengeType update(Long id, ChallengeType updated) {
        return repository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setDescription(updated.getDescription());
            existing.setUpdatedAt(LocalDateTime.now());
            return repository.save(existing);
        }).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy loại thử thách.")
        );
    }

    @Override
    public void delete(Long id) {
        ChallengeType challengeType = repository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy loại thử thách.")
                );

        // Nếu có liên kết với Challenge khác, bạn có thể xử lý logic đó tại đây

        repository.delete(challengeType);
    }
}
