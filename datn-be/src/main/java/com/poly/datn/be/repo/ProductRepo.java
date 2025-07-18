package com.poly.datn.be.repo;

import com.poly.datn.be.domain.dto.RespProductDto;
import com.poly.datn.be.domain.dto.ResponseProductDto;
import com.poly.datn.be.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    @Query("SELECT new com.poly.datn.be.domain.dto.ResponseProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) FROM Product p " +
            "inner join Attribute a on p.id = a.product.id " +
            "inner join Image i on p.id = i.product.id where a.size = :size and i.name = :name and p.isActive = :active")
    Page<ResponseProductDto> getAllProducts(@Param("size") String size,
                                            @Param("name") String name,
                                            @Param("active") Boolean active,
                                            Pageable pageable);

    @Query("SELECT new com.poly.datn.be.domain.dto.ResponseProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) FROM Product p " +
            "inner join Attribute a on p.id = a.product.id " +
            "inner join Image i on p.id = i.product.id where a.size = :size and i.name = :name and p.isActive = true and p.id = :id")
    ResponseProductDto getProductDetail(@Param("size") String size,
                                        @Param("name") String name,
                                        @Param("id") Long id);
    @Query("SELECT new com.poly.datn.be.domain.dto.ResponseProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) FROM Product p " +
            "inner join Attribute a on p.id = a.product.id " +
            "inner join Image i on p.id = i.product.id where a.size = :size and i.name = :name and p.isActive = :active and p.brand.id = :brand and p.id <> :id")
    Page<ResponseProductDto> relateProduct(@Param("size") String size,
                                            @Param("name") String name,
                                            @Param("active") Boolean active,
                                            @Param("brand") Long brand,
                                           @Param("id") Long id,
                                            Pageable pageable);
    @Query("SELECT new com.poly.datn.be.domain.dto.ResponseProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) FROM Product p inner join ProductCategory c on p.id = c.product.id inner join Brand b on p.brand.id = b.id " +
            "inner join Attribute a on p.id = a.product.id " +
            "inner join Image i on p.id = i.product.id where a.size = :size and i.name = :name and p.isActive = :active and c.category.id IN :category and p.brand.id in :brand and a.price between :min and :max")
    Page<ResponseProductDto> filterAllProducts(@Param("size") String size,
                                               @Param("name") String name,
                                               @Param("active") Boolean active,
                                               @Param("category") List<Long> category,
                                               @Param("brand") List<Long> brand,
                                               @Param("min") Double min,
                                               @Param("max") Double max,
                                               Pageable pageable);

    @Query("SELECT new com.poly.datn.be.domain.dto.ResponseProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) FROM Product p " +
            "inner join Attribute a on p.id = a.product.id " +
            "inner join Image i on p.id = i.product.id where a.size = :size and i.name = :name and p.brand.id = :brand and p.isActive = :active")
    Page<ResponseProductDto> getAllProductsByBrand(@Param("size") String size,
                                                   @Param("name") String name,
                                                   @Param("active") Boolean active,
                                                   @Param("brand") Long brand,
                                                   Pageable pageable);

    @Query("SELECT new com.poly.datn.be.domain.dto.RespProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) FROM Product p " +
            "inner join Attribute a on p.id = a.product.id " +
            "inner join Image i on p.id = i.product.id where a.size = :size and i.name = :name and p.isActive = true and UPPER(p.name) like UPPER(CONCAT('%', :keyword, '%'))")
    List<RespProductDto> searchAllByKeyword(@Param("size") String size,
                                            @Param("name") String name,
                                            @Param("keyword") String keyword,
                                            Pageable pageable);

    List<Product> getProductByBrand_Id(Long brandId);
    @Query("SELECT p FROM Product p INNER JOIN ProductCategory pc ON p.id = pc.product.id INNER JOIN Category c on pc.category.id = c.id where c.id = :categoryId")
    List<Product> getProductByCategory(@Param("categoryId") Long categoryId);

    List<Product> getProductBySale_Id(Long id);

    Optional<Product> findProductByCode(String code);

    // Repository methods for most-viewed products
    @Query("SELECT new com.poly.datn.be.domain.dto.ResponseProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) FROM Product p " +
            "join p.attributes a " +
            "join p.images i " +
            "where a.size = :size and i.name = :name and p.isActive = true " +
            "order by p.view desc")
    Page<ResponseProductDto> getMostViewedProducts(@Param("size") String size,
                                                   @Param("name") String name,
                                                   Pageable pageable);

    @Query("SELECT new com.poly.datn.be.domain.dto.ResponseProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) " +
            "FROM Product p " +
            "JOIN p.attributes a " +
            "JOIN p.images i " +
            "WHERE a.size = :size AND i.name = :name AND p.isActive = true " +
            "ORDER BY p.modifyDate DESC")
    Page<ResponseProductDto> getNewestProducts(@Param("size") String size,
                                               @Param("name") String name,
                                               Pageable pageable);

    // Repository methods for best-selling products
    @Query("SELECT new com.poly.datn.be.domain.dto.ResponseProductDto(p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive) FROM OrderDetail od " +
            "join od.attribute a " +
            "join a.product p " +
            "join p.images i " +
            "where a.size = :size and i.name = :name and p.isActive = true " +
            "group by p.id, p.name, p.code, p.description, p.view, a.price, i.imageLink, p.brand.name, p.sale.discount, p.isActive " +
            "order by sum(od.quantity) desc")
    Page<ResponseProductDto> getBestSellingProducts(@Param("size") String size,
                                                    @Param("name") String name,
                                                    Pageable pageable);

    @Modifying
    @Transactional
    @Query(value = "DELETE cart_item FROM cart_item " +
            "JOIN attribute ON cart_item.attribute_id = attribute.id " +
            "WHERE attribute.product_id = :productId", nativeQuery = true)
    void deleteCartItemByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = "DELETE order_detail FROM order_detail " +
            "JOIN attribute ON order_detail.attribute_id = attribute.id " +
            "WHERE attribute.product_id = :productId", nativeQuery = true)
    void deleteOrderDetailByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM attribute WHERE product_id = :productId", nativeQuery = true)
    void deleteAttributeByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM images WHERE product_id = :productId", nativeQuery = true)
    void deleteImageByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM notifications WHERE product_id = :productId", nativeQuery = true)
    void deleteNotificationByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM ratings WHERE product_id = :productId", nativeQuery = true)
    void deleteRatingByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM comments WHERE product_id = :productId", nativeQuery = true)
    void deleteCommentByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM product_category WHERE product_id = :productId", nativeQuery = true)
    void deleteProductCategoryByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM products WHERE id = :productId", nativeQuery = true)
    void deleteProductById(@Param("productId") Long productId);

}
