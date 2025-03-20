package org.capstone.backend.service.account;

import org.capstone.backend.dto.account.AccountDTO;
import org.capstone.backend.dto.account.AccountDetailDTO;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.repository.AccountRepository;
import org.capstone.backend.repository.MemberRepository;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private MemberRepository memberRepository;

    @Override
    public Page<AccountDTO> getAllAccounts(int page, int size) {
        Page<Account> accounts = accountRepository.findByRoleNot(
                Role.ADMIN,
                PageRequest.of(page, size)
        );
        List<AccountDTO> accountDTOs = accounts.stream().map(this::toDTO).collect(Collectors.toList());

        return new PageImpl<>(accountDTOs, accounts.getPageable(), accounts.getTotalElements());
    }


    @Override
    public AccountDTO banAccount(Long id) {
        return updateAccountStatus(id, AccountStatus.BANNED);
    }

    @Override
    public AccountDTO unbanAccount(Long id) {
        return updateAccountStatus(id, AccountStatus.ACTIVE);
    }

    private AccountDTO updateAccountStatus(Long id, AccountStatus status) {
        Optional<Account> accountOptional = accountRepository.findById(id);

        if (accountOptional.isPresent()) {
            Account account = accountOptional.get();
            account.setStatus(status);
            accountRepository.save(account);

            return toDTO(account);
        }
        throw new RuntimeException("Account not found with id " + id);
    }

    private AccountDTO toDTO(Account account) {
        AccountDTO dto = new AccountDTO();
        dto.setId(account.getId());
        dto.setUsername(account.getUsername());
        dto.setEmail(account.getEmail());
        dto.setRole(account.getRole());
        dto.setStatus(account.getStatus());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setUpdatedAt(account.getUpdatedAt());
        return dto;
    }
    @Override
    public AccountDetailDTO getAccountDetail(Long id) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found with id: " + id));

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


}
