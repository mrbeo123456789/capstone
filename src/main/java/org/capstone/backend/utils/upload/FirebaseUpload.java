package org.capstone.backend.utils.upload;

import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import com.google.cloud.storage.Blob;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class FirebaseUpload {

    public String uploadFile(MultipartFile file, String path) throws IOException {
        // Lấy tên file gốc
        String fileName = file.getOriginalFilename();

        String fullPath = path + "/" + fileName;

        // Upload file lên Firebase Storage
        Blob blob = StorageClient.getInstance().bucket().create(fullPath, file.getBytes(), file.getContentType());

        // Return public URL
        return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                StorageClient.getInstance().bucket().getName(),
                java.net.URLEncoder.encode(blob.getName(), "UTF-8")); // 👈 encode URL
    }
    public String uploadFileWithOverwrite(MultipartFile file, String path) throws IOException {
        Bucket bucket = StorageClient.getInstance().bucket();

        // ❌ Xóa file cũ nếu tồn tại
        Blob existingBlob = bucket.get(path);
        if (existingBlob != null && existingBlob.exists()) {
            existingBlob.delete();
        }

        // ✅ Upload file mới
        Blob blob = bucket.create(path, file.getInputStream(), file.getContentType());

        // ✅ Trả về URL công khai cho phép xem trực tiếp trên web
        return String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                bucket.getName(),
                java.net.URLEncoder.encode(blob.getName(), "UTF-8"));
    }
}
