package com.poly.datn.be.service.impl;

import com.poly.datn.be.entity.OrderDetail;
import com.poly.datn.be.repo.OrderDetailRepo;
import com.poly.datn.be.service.OrderDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderDetailServiceImpl implements OrderDetailService {
    @Autowired
    OrderDetailRepo orderDetailRepo;
    @Override
    public OrderDetail createOrderDetail(OrderDetail orderDetail) {
        return orderDetailRepo.save(orderDetail);
    }

    @Override
    public List<OrderDetail> getAllByOrderId(Long id) {
        return orderDetailRepo.findAllByOrder_Id(id);
    }
}
