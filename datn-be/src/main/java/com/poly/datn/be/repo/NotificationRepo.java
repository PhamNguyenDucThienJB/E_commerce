package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> getNotificationByReadEqualsAndDeliverEquals(Boolean read, Boolean deliver);
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
