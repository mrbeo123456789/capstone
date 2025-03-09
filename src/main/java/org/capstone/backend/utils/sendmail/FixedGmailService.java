package org.capstone.backend.utils.sendmail;

import java.io.*;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.Message;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Base64;
@Async
@Service
public class FixedGmailService {
    private static final String APPLICATION_NAME = "Gmail API Fixed Sender";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance() ;
    // Thư mục lưu trữ token riêng cho tài khoản cố định
    private static final String TOKENS_DIRECTORY_PATH = "fixed_tokens";

    // Quyền truy cập chỉ gửi mail
    private static final List<String> SCOPES = Collections.singletonList(GmailScopes.GMAIL_SEND);
    // Đường dẫn đến file credentials cố định trong thư mục resources
    private static final String CREDENTIALS_FILE_PATH = "/fixed_credentials.json";

    /**
     * Xác thực và tạo đối tượng Gmail service cho tài khoản cố định
     */
    private Gmail getGmailService() throws Exception {
        // Tải file credentials cố định
        InputStream in = FixedGmailService.class.getResourceAsStream(CREDENTIALS_FILE_PATH);
        if (in == null) {
            throw new FileNotFoundException("Không tìm thấy file: " + CREDENTIALS_FILE_PATH);
        }
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

        // Thiết lập luồng xác thực và lưu token vào thư mục fixed_tokens
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(), JSON_FACTORY, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();
        // Sử dụng cổng khác (ví dụ: 8889) nếu cần phân biệt với OAuth của người dùng khác
        LocalServerReceiver receiver = new LocalServerReceiver.Builder()
                .setPort(8080)
                .setCallbackPath("/oauth2callback")
                .build();

        Credential credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("fixedUser");
        return new Gmail.Builder(GoogleNetHttpTransport.newTrustedTransport(), JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    /**
     * Tạo MimeMessage chứa nội dung email
     */
    public MimeMessage createEmail(String to, String from, String subject, String bodyText) throws Exception {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setText(bodyText);
        return email;
    }

    /**
     * Mã hóa MimeMessage thành dạng raw message để gửi qua Gmail API
     */
    public Message createMessageWithEmail(MimeMessage emailContent) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        emailContent.writeTo(buffer);
        byte[] bytes = buffer.toByteArray();
        String encodedEmail = Base64.getUrlEncoder().encodeToString(bytes);
        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }

    /**
     * Gửi email qua Gmail API từ tài khoản cố định
     */
    public void sendEmail(String to, String subject, String bodyText) throws Exception {
        // Lấy đối tượng Gmail service cho tài khoản cố định
        Gmail service = getGmailService();
        // Địa chỉ người gửi cố định
        String fixedSender = "fusep490g4@gmail.com";
        MimeMessage emailContent = createEmail(to, fixedSender, subject, bodyText);
        Message message = createMessageWithEmail(emailContent);
        message = service.users().messages().send("me", message).execute();
        System.out.println("Đã gửi email, Message id: " + message.getId());
    }
}
