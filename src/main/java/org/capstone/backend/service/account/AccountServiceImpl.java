package org.capstone.backend.service.account;

import lombok.RequiredArgsConstructor;
import org.capstone.backend.dto.account.AccountResponseDTO;
import org.capstone.backend.utils.upload.FirebaseUpload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
@Transactional
public class AccountServiceImpl implements AccountService {
    private final FirebaseUpload firebaseUpload;

    @Override
    public void save(AccountResponseDTO accountResponseDTO, MultipartFile avatar) throws IOException {
        String url = firebaseUpload.uploadFile(avatar);
    }
}
