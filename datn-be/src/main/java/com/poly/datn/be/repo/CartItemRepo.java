package com.poly.datn.be.repo;

import com.poly.datn.be.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    @Query("SELECT c.attribute.id, i.imageLink, p.name, c.attribute.size, c.attribute.price, c.quantity, c.attribute.stock, p.sale.discount, c.lastPrice FROM CartItem c INNER JOIN Product p on c.attribute.product.id = p.id INNER JOIN Image i on p.id = i.product.id WHERE c.account.id = :id and i.name = :name and c.isActive = :active")
    List<Object[]> getCartItemByAccountId(@Param("id") Long id,
                                          @Param("name") String name,
                                          @Param("active") Boolean active);
    @Query("SELECT c FROM CartItem c WHERE c.account.id = :accountId and c.attribute.id = :attributeId")
    CartItem findCartItemByAccountIdAndAttributeId(@Param("accountId") Long accountId,
                                                   @Param("attributeId") Long attributeId);

    List<CartItem> findCartItemByAccount_IdAndIsActiveEquals(Long id, Boolean isActive);
}
