package org.capstone.backend.utils.sendmail;

import java.io.*;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import javax.mail.MessagingException;
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
import io.github.cdimascio.dotenv.Dotenv;

import java.util.Base64;
import java.nio.file.Files;
import java.nio.file.Paths;

@Async("taskExecutor")
@Service
public class FixedGmailService {
    private static final String APPLICATION_NAME = "Gmail API Fixed Sender";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String TOKENS_DIRECTORY_PATH = "fixed_tokens";
    private static final String CREDENTIALS_FILE_PATH = "/fixed_credentials.json";
    private static final List<String> SCOPES = Collections.singletonList(GmailScopes.GMAIL_SEND);

    private static final Dotenv dotenv = Dotenv.load();
    private static final String FIXED_SENDER = dotenv.get("FIXED_SENDER_EMAIL");

    private Gmail getGmailService() throws Exception {
        deleteTokenDirectory();
        InputStream in = FixedGmailService.class.getResourceAsStream(CREDENTIALS_FILE_PATH);
        if (in == null) {
            throw new FileNotFoundException("Credential file not found: " + CREDENTIALS_FILE_PATH);
        }
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

        FileDataStoreFactory dataStoreFactory = new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH));
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(), JSON_FACTORY, clientSecrets, SCOPES)
                .setDataStoreFactory(dataStoreFactory)
                .setAccessType("offline")
                .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder()
                .setPort(8081)
                .setCallbackPath("/oauth2callback")
                .build();

        Credential credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("fixedUser");

        if (credential.getExpiresInSeconds() != null && credential.getExpiresInSeconds() <= 60) {
            refreshToken(credential);
        }

        return new Gmail.Builder(GoogleNetHttpTransport.newTrustedTransport(), JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    private void refreshToken(Credential credential) throws IOException {
        try {
            if (credential.refreshToken()) {
                String refreshToken = credential.getRefreshToken();
                if (refreshToken != null) {
                    Files.write(Paths.get(TOKENS_DIRECTORY_PATH + "/fixedUser_refresh_token.txt"), refreshToken.getBytes());
                }
            } else {
                throw new IOException("Failed to refresh token");
            }
        } catch (IOException e) {
            System.err.println("Refresh token expired or invalid. Deleting token directory and requiring re-authentication.");
            deleteTokenDirectory();
            throw e;
        }
    }

    private void deleteTokenDirectory() {
        File tokenDir = new File(TOKENS_DIRECTORY_PATH);
        if (tokenDir.exists()) {
            for (File file : tokenDir.listFiles()) {
                file.delete();
            }
            tokenDir.delete();
            System.out.println("Token directory deleted.");
        }
    }

    public MimeMessage createEmail(String to, String from, String subject, String bodyText) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        Session session = Session.getInstance(props);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setText(bodyText);
        return email;
    }

    public Message createMessageWithEmail(MimeMessage emailContent) throws Exception {
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
            MimeMessage emailContent = createEmail(to, FIXED_SENDER, subject, bodyText);
            Message message = createMessageWithEmail(emailContent);
            service.users().messages().send("me", message).execute();
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}