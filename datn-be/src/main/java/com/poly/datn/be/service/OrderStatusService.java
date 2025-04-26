package com.poly.datn.be.service;

import com.poly.datn.be.entity.OrderStatus;

import java.util.List;

public interface OrderStatusService {
    OrderStatus getById(Long id);
    List<OrderStatus> getAllOrderStatus();
}
