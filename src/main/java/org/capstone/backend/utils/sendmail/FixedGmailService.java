package org.capstone.backend.utils.sendmail;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;
import org.capstone.backend.config.EnvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Properties;

@Async("taskExecutor")
@Service
public class FixedGmailService {

    private static final String APPLICATION_NAME = "Gmail API Fixed Sender";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Autowired
    private EnvService envService;

    private Gmail getGmailService() throws Exception {
        UserCredentials credentials = UserCredentials.newBuilder()
                .setClientId(envService.getGoogleClientId())
                .setClientSecret(envService.getGoogleClientSecret())
                .setRefreshToken(envService.getGoogleRefreshToken())
                .build();

        credentials.refreshIfExpired();

        return new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                new HttpCredentialsAdapter(credentials)
        ).setApplicationName(APPLICATION_NAME).build();
    }

    private MimeMessage createEmail(String to, String subject, String bodyText) throws MessagingException {
        Properties props = new Properties();
        Session session = Session.getInstance(props);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(envService.getFixedSenderEmail()));
        email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setText(bodyText);
        return email;
    }

    private Message createMessageWithEmail(MimeMessage emailContent) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        emailContent.writeTo(buffer);
        String encodedEmail = Base64.getUrlEncoder().encodeToString(buffer.toByteArray());
        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }

    public void sendEmail(String to, String subject, String bodyText) {
        try {
            Gmail service = getGmailService();
            MimeMessage emailContent = createEmail(to, subject, bodyText);
            Message message = createMessageWithEmail(emailContent);
            service.users().messages().send("me", message).execute();
            System.out.println("✅ Email đã gửi tới: " + to);
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
