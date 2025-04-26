package com.poly.datn.be.repo;

import com.poly.datn.be.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderStatusRepo extends JpaRepository<OrderStatus, Long> {
}
