package org.capstone.backend.service.account;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.account.AccountDTO;
import org.capstone.backend.dto.account.AccountDetailDTO;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.exception.BadRequestException;
import org.capstone.backend.utils.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final MemberRepository memberRepository;

    @Override
    public Page<AccountDTO> getAllAccounts(String keyword, String statusStr, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        AccountStatus status = convertStatus(statusStr);
        return accountRepository.findAllByKeywordAndStatus(keyword, status, pageable);
    }

    @Override
    public AccountDTO banAccount(Long id) {
        return updateAccountStatus(id, AccountStatus.BANNED);
    }

    @Override
    public AccountDTO unbanAccount(Long id) {
        return updateAccountStatus(id, AccountStatus.ACTIVE);
    }

    @Override
    public AccountDetailDTO getAccountDetail(Long id) {
        Account account = getAccountById(id);
        Member member = memberRepository.findByAccount(account).orElse(null);

        return new AccountDetailDTO(
                account.getId(),
                account.getUsername(),
                account.getEmail(),
                member != null ? member.getPhone() : "N/A",
                member != null ? member.getAvatar() : null,
                member != null ? member.getAddress() : "N/A",
                member != null && member.getDateOfBirth() != null ? member.getDateOfBirth().toString() : "N/A",
                account.getStatus(),
                account.getRole()
        );
    }

    /**
     * Updates the status of the account and returns its DTO.
     */
    private AccountDTO updateAccountStatus(Long id, AccountStatus status) {
        Account account = getAccountById(id);
        account.setStatus(status);
        accountRepository.save(account);
        return toDTO(account);
    }

    /**
     * Retrieves an account by ID or throws ResourceNotFoundException.
     */
    private Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID: " + id));
    }

    /**
     * Converts a String status to the AccountStatus enum without using try-catch.
     * If the provided statusStr is null or blank, returns null.
     *
     * @throws BadRequestException if the statusStr is not a valid AccountStatus.
     */
    private AccountStatus convertStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank()) {
            return null;
        }

        String trimmedStatus = statusStr.trim();
        for (AccountStatus accountStatus : AccountStatus.values()) {
            if (accountStatus.name().equalsIgnoreCase(trimmedStatus)) {
                return accountStatus;
            }
        }
        throw new BadRequestException("Trạng thái tài khoản không hợp lệ: " + statusStr);
    }

    /**
     * Converts an Account entity to its DTO.
     */
    private AccountDTO toDTO(Account account) {
        return AccountDTO.builder()
                .id(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .role(account.getRole())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
