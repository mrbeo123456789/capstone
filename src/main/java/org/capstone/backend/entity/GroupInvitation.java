package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "group_invitations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invitation_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Groups group;

    @Column(name = "invite_link", nullable = false, unique = true)
    private String inviteLink;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @ElementCollection
    @CollectionTable(name = "group_invitation_emails", joinColumns = @JoinColumn(name = "invitation_id"))
    @Column(name = "email")
    private List<String> allowedEmails;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", updatable = false)
    private Long createdBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.expiresAt == null) {
            this.expiresAt = this.createdAt.plusDays(2);
        }
    }

    public boolean isValid(String email) {
        return LocalDateTime.now().isBefore(expiresAt) &&
               (allowedEmails == null || allowedEmails.isEmpty() || allowedEmails.contains(email));
    }
}
