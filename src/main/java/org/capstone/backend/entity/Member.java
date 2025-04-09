package org.capstone.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.InvitePermission;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    private String firstName;

    private String lastName;

    private String gender;

    private String phone;

    private String avatar;

    private String address;

    private String ward;

    private String province;

    private String district;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "member_interest",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_id")
    )
    @JsonIgnore // Tránh lỗi vòng lặp khi serialize JSON
    private Set<Interest> interests = new HashSet<>();
    @Enumerated(EnumType.STRING)
    @Column(name = "invite_permission", nullable = false)
    private InvitePermission invitePermission = InvitePermission.EVERYONE;

    @OneToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChallengeMember> challengeMembers;
}
