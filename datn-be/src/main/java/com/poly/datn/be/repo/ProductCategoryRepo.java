package com.poly.datn.be.repo;

import com.poly.datn.be.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepo extends JpaRepository<ProductCategory,Long> {
    Optional<ProductCategory> findProductCategoryByProduct_IdAndCategory_Id(Long productId, Long categoryId);
    List<ProductCategory> findProductCategoryByProduct_Id(Long id);

    @Modifying
    @Transactional
    @Query("DELETE FROM ProductCategory pc WHERE pc.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);

}
