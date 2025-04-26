package com.poly.datn.be.service;

import com.poly.datn.be.domain.dto.ReqCancelOrder;
import com.poly.datn.be.domain.dto.ReqOrderDto;
import com.poly.datn.be.domain.dto.ReqUpdateOrderDto;
import com.poly.datn.be.domain.dto.ReqUpdateStatusOrder;
import com.poly.datn.be.domain.model.AmountMonth;
import com.poly.datn.be.domain.model.AmountYear;
import com.poly.datn.be.domain.model.CountOrder;
import com.poly.datn.be.domain.model.ReportProduct;
import com.poly.datn.be.entity.Order;
import com.poly.datn.be.entity.OrderDetail;
import com.poly.datn.be.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    Order createOrder(ReqOrderDto reqOrderDto) ;
    Page<Order> getOrderByAccount(Long id, Pageable pageable);
    Order getByOrderId(Long id);
    List<OrderDetail> getAllByOrderId(Long id);
    Page<Order> findOrderByAccountIdAndOrderStatusId(Long accountId, Long orderStatusId, Pageable pageable);
    Page<Order> getAllOrdersAndPagination(Long id, Pageable pageable);
    Order updateOrderWithStatus(Long orderId, Long statusId);
    Order updateOrder(ReqUpdateOrderDto reqUpdateOrderDto);
//    Order cancelOrder(Long orderId);
    Page<Order> findOrderByAccount_Id(Long id, Pageable pageable);
    Page<Order> findOrderByOrderStatusAndYearAndMonth(Long id, Integer year, Integer month, Pageable pageable);
    Page<Order> findOrderBetweenDate(@Param("id") Long id, @Param("from") LocalDate from, @Param("to") LocalDate to, Pageable pageable);
    Page<ReportProduct> reportByProduct(Pageable pageable);
    Page<Order> findOrderByProduct(Long id, Pageable pageable);
    List<AmountYear> reportAmountYear();
    List<AmountMonth> reportAmountMonth(Integer year);

    Integer countOrder();
    List<CountOrder> countOrderByName();
    List<Order> findOrderBySeenEquals(Boolean seen);

    Order processOrder(ReqUpdateStatusOrder reqUpdateStatusOrder);
    Order shipOrder(ReqUpdateStatusOrder reqUpdateStatusOrder);
    Order successOrder(ReqUpdateStatusOrder reqUpdateStatusOrder);
    Order cancelOrder(ReqUpdateStatusOrder reqUpdateStatusOrder);
    Order cancelOrder(ReqCancelOrder reqCancelOrder);
}
