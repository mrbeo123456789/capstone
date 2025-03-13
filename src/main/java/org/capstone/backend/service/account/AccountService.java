package org.capstone.backend.service.account;

import org.capstone.backend.dto.account.AccountDTO;
import org.capstone.backend.entity.Account;
import org.springframework.data.domain.Page;

public interface AccountService {
    Page<AccountDTO> getAllAccounts(int page, int size);
    AccountDTO banAccount(Long id);
    AccountDTO unbanAccount(Long id);}