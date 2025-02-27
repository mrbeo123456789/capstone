package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer age;

    private String gender;

    private String phone;

    private String avatar;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by")
    private String updatedBy;
    

    @OneToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

}
