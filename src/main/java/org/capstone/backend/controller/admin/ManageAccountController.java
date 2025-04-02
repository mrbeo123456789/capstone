package org.capstone.backend.controller.admin;

import org.capstone.backend.dto.account.AccountDTO;
import org.capstone.backend.dto.account.AccountDetailDTO;
import org.capstone.backend.service.account.AccountService;
import org.capstone.backend.utils.enums.AccountStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/accounts")
public class ManageAccountController {
    @Autowired
    private AccountService accountService;

    @GetMapping("/get")
    public ResponseEntity<Page<AccountDTO>> getAllAccounts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        AccountStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = AccountStatus.valueOf(status.toUpperCase()); // chuyển về enum an toàn
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().build(); // hoặc custom message nếu cần
            }
        }

        Page<AccountDTO> accounts = accountService.getAllAccounts(keyword, statusEnum, page, size);
        return ResponseEntity.ok(accounts);
    }


    @PutMapping("/ban/{id}")
    public ResponseEntity<AccountDTO> banAccount(@PathVariable Long id) {
        AccountDTO accountDTO = accountService.banAccount(id);
        return ResponseEntity.ok(accountDTO);
    }

    @PutMapping("/unban/{id}")
    public ResponseEntity<AccountDTO> unbanAccount(@PathVariable Long id) {
        AccountDTO accountDTO = accountService.unbanAccount(id);
        return ResponseEntity.ok(accountDTO);
    }


    @GetMapping("/getDetail/{id}")
    public ResponseEntity<AccountDetailDTO> getAccountDetail(@PathVariable Long id) {
        AccountDetailDTO accountDetailDTO = accountService.getAccountDetail(id);
        if (accountDetailDTO == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(accountDetailDTO);
    }
}
