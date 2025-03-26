package org.capstone.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
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

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "member_interest",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_id")
    )
    @JsonIgnore // Tránh lỗi vòng lặp khi serialize JSON
    private Set<Interest> interests = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChallengeMember> challengeMembers;
}
