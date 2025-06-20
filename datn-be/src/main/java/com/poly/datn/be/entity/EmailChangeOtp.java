package com.poly.datn.be.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_change_otp")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailChangeOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "old_email", nullable = false)
    private String oldEmail;

    @Column(name = "new_email", nullable = false)
    private String newEmail;

    @Column(name = "old_email_otp")
    private String oldEmailOtp;

    @Column(name = "new_email_otp")
    private String newEmailOtp;

    @Column(name = "old_email_verified", nullable = false)
    private Boolean oldEmailVerified = false;

    @Column(name = "new_email_verified", nullable = false)
    private Boolean newEmailVerified = false;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "expire_date", nullable = false)
    private LocalDateTime expireDate;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;
} 