package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AttributeRepo extends JpaRepository<Attribute, Long> {
    Attribute findFirstByProduct_IdAndSize(Long productId, String size);
    @Modifying
    @Transactional
    @Query("DELETE FROM Attribute a WHERE a.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
