package com.poly.datn.be.repo;

import com.poly.datn.be.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    void deleteByPreEmail(String preEmail);
    Optional<VerificationToken> findByPreEmailAndIsClickTrue(String email);
}
