package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Comment;
import com.poly.datn.be.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Long> {
    Page<Comment> findByProductAndParentIsNullAndIsActiveTrue(Product product, Pageable pageable);
    
    List<Comment> findByParentIdAndIsActiveTrue(Long parentId);
    
    @Query("SELECT c FROM Comment c WHERE c.product.id = :productId AND c.parent IS NULL AND c.isActive = true")
    Page<Comment> findParentCommentsByProductId(Long productId, Pageable pageable);
    
    @Query("SELECT c FROM Comment c WHERE c.account.id = :accountId AND c.isActive = true")
    Page<Comment> findByAccountIdAndIsActiveTrue(Long accountId, Pageable pageable);
    
    Page<Comment> findAllByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
} 