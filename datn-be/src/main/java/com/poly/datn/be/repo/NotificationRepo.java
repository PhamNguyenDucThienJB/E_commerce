package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> getNotificationByReadEqualsAndDeliverEquals(Boolean read, Boolean deliver);
}
