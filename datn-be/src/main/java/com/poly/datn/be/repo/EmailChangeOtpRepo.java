package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.EmailChangeOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailChangeOtpRepo extends JpaRepository<EmailChangeOtp, Long> {
    
    Optional<EmailChangeOtp> findByAccountAndIsUsedFalse(Account account);
    
    Optional<EmailChangeOtp> findByAccountAndOldEmailOtpAndIsUsedFalse(Account account, String oldEmailOtp);
    
    Optional<EmailChangeOtp> findByAccountAndNewEmailOtpAndIsUsedFalse(Account account, String newEmailOtp);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailChangeOtp e WHERE e.expireDate < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailChangeOtp e WHERE e.account = :account AND e.isUsed = false")
    void deleteUnusedOtpsByAccount(@Param("account") Account account);
} 