package org.capstone.backend.service.account;

import org.capstone.backend.dto.account.AccountResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface AccountService {
    void save(AccountResponseDTO accountResponseDTO, MultipartFile avatar) throws IOException;
}
