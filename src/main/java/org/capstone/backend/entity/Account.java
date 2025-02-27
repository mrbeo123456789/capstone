package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.capstone.backend.utils.enums.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String username;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role;

    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by")
    private String updatedBy;


}
