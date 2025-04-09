package org.capstone.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.capstone.backend.utils.enums.AccountStatus;
import org.capstone.backend.utils.enums.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Role role;

    @Enumerated(EnumType.STRING) // Lưu enum dưới dạng chuỗi (ACTIVE, INACTIVE, BANNED)
    @Column(nullable = false)
    private AccountStatus status = AccountStatus.INACTIVE; // Mặc định tài khoản chưa kích hoạt


    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by")
    private String updatedBy;


}
