package org.capstone.backend.utils.upload;

import com.google.firebase.cloud.StorageClient;
import com.google.cloud.storage.Blob;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class FirebaseUpload {

    public String uploadFile(MultipartFile file) throws IOException {
        // Lấy tên file gốc
        String fileName = file.getOriginalFilename();

        // Upload file lên Firebase Storage
        Blob blob = StorageClient.getInstance().bucket().create(fileName, file.getBytes(), file.getContentType());

        // Trả về URL của file đã upload
        return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                StorageClient.getInstance().bucket().getName(),
                blob.getName());
    }
}
