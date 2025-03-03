package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private Integer age;
    private String gender;
    private String phone;
    private String avatar;
    private String address;
    private String country;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @OneToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // Thêm quan hệ với GroupMember
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupMember> groupMembers;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
