package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Rating;
import com.poly.datn.be.entity.Product;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepo extends JpaRepository<Rating, Long> {
    Page<Rating> findByProductAndIsActiveTrue(Product product, Pageable pageable);
    
    Page<Rating> findAllByIsActiveTrue(Pageable pageable);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Rating r WHERE r.product.id = :productId AND r.isActive = true")
    Double getAverageRatingByProductId(Long productId);
    
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.product.id = :productId AND r.isActive = true")
    Long countRatingsByProductId(Long productId);
    
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.product.id = :productId AND r.rating = :stars AND r.isActive = true")
    Long countRatingsByProductIdAndStars(Long productId, Integer stars);
    
    Optional<Rating> findByAccountAndProductAndIsActiveTrue(Account account, Product product);
    
    Optional<Rating> findByAccountAndProductAndOrderAndIsActiveTrue(Account account, Product product, Order order);
    
    @Query("SELECT r FROM Rating r WHERE r.account.id = :accountId AND r.isActive = true")
    Page<Rating> findByAccountId(Long accountId, Pageable pageable);
} 