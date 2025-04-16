package org.capstone.backend.service.account;

import org.capstone.backend.dto.account.AccountDTO;
import org.capstone.backend.dto.account.AccountDetailDTO;
import org.capstone.backend.entity.Account;
import org.capstone.backend.entity.Member;
import org.capstone.backend.utils.enums.AccountStatus;
import org.springframework.data.domain.Page;

public interface AccountService {
    Page<AccountDTO> getAllAccounts(String keyword, String  status, int page, int size);
    AccountDTO banAccount(Long id);
    AccountDTO unbanAccount(Long id);
    AccountDetailDTO getAccountDetail(Long id);
}