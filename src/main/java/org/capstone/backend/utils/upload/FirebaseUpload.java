package org.capstone.backend.utils.upload;

import com.google.cloud.storage.Bucket;
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
    public String uploadFileWithOverwrite(MultipartFile file, String path) throws IOException {
        Bucket bucket = StorageClient.getInstance().bucket();

        // ❌ Nếu đã có file cũ, xóa đi trước khi ghi đè
        Blob existingBlob = bucket.get(path);
        if (existingBlob != null && existingBlob.exists()) {
            existingBlob.delete();
        }

        // ✅ Upload file mới với cùng path
        Blob blob = bucket.create(path, file.getInputStream(), file.getContentType());

        // 🔗 Lấy URL có thể dùng (tuỳ bạn dùng signed URL hay media link)
        return blob.getMediaLink(); // Hoặc generate signed URL nếu cần bảo mật
    }

}
