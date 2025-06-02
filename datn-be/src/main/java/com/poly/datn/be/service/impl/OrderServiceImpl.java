package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.constant.*;
import com.poly.datn.be.domain.dto.ReqCancelOrder;
import com.poly.datn.be.domain.dto.ReqOrderDto;
import com.poly.datn.be.domain.dto.ReqUpdateOrderDto;
import com.poly.datn.be.domain.dto.ReqUpdateStatusOrder;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.domain.model.*;
import com.poly.datn.be.entity.*;
import com.poly.datn.be.repo.OrderRepo;
import com.poly.datn.be.service.*;
import com.poly.datn.be.util.ConvertUtil;
import com.poly.datn.be.util.MailUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.mail.MessagingException;
import java.time.LocalDate;
import java.util.*;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired
    OrderRepo orderRepo;
    @Autowired
    AccountService accountService;
    @Autowired
    OrderDetailService orderDetailService;
    @Autowired
    OrderStatusService orderStatusService;
    @Autowired
    CartItemService cartItemService;
    @Autowired
    AttributeService attributeService;
    @Autowired
    VoucherService voucherService;
    @Autowired
    NotificationService notificationService;



    @Override
    @Transactional
    public Order createOrder(ReqOrderDto reqOrderDto) {
        Account account = null;
        if (reqOrderDto.getAccountId() != (-1)) {
            account = accountService.findById(reqOrderDto.getAccountId());
        }
        OrderStatus orderStatus = orderStatusService.getById(1L);
        Order order = ConvertUtil.fromReqOrderDto(reqOrderDto);
        order.setAccount(account);
        order.setOrderStatus(orderStatus);
        order.setSeen(false);
        if (!reqOrderDto.getCode().isEmpty()) {
            Voucher voucher = voucherService.getVoucherByCode(reqOrderDto.getCode());
            voucher.setCount(voucher.getCount() - 1);
            voucherService.saveVoucher(voucher);
            order.setVoucher(voucher);
        }
        order = orderRepo.save(order);
        order.setEncodeUrl(Base64.getUrlEncoder().encodeToString(String.valueOf(order.getId()).getBytes()));
        order = orderRepo.save(order);
        Collection<OrderDetail> orderDetails = reqOrderDto.getOrderDetails();
        for (OrderDetail o : orderDetails) {
            Attribute attribute = attributeService.findById(o.getAttribute().getId());
            if (attribute.getStock() < o.getQuantity()) {
                throw new AppException(AttributeConst.ATTRIBUTE_MSG_ERROR_NOT_ENOUGH_STOCK);
            } else {
                attribute.setStock(attribute.getStock() - o.getQuantity());
                attribute.setCache(attribute.getCache() + o.getQuantity());
                attributeService.save(attribute);
                o.setOrder(order);
                orderDetailService.createOrderDetail(o);
                if (reqOrderDto.getAccountId() != -1) {
                    CartItem c = cartItemService.findCartItemByAccountIdAndAttributeId(account.getId(), o.getAttribute().getId());
                    c.setQuantity(CartItemConst.CART_ITEM_QUANTITY_WAITING);
                    c.setIsActive(CartItemConst.CART_ITEM_INACTIVE);
                    cartItemService.saveCartItem(c);
                }
            }
        }

        Notification notification = new Notification();
        notification.setRead(false);
        notification.setDeliver(false);
        notification.setContent(String.format("Đơn hàng %s vừa được tạo, xác nhận ngay nào", order.getId()));
        notification.setOrder(order);
        notification.setType(1);
        notificationService.createNotification(notification);
        try {
            MailUtil.sendEmail(order);
        } catch (MessagingException e) {
            System.out.println("Can't send an email.");
        }
        return order;
    }

    @Override
    public Page<Order> getOrderByAccount(Long id, Pageable pageable) {
        Account account = accountService.findById(id);
        return orderRepo.findAllByAccount_Id(id, pageable);
    }

    @Override
    public Order getByOrderId(Long id) {
        Optional<Order> optional = orderRepo.findById(id);
        if (!optional.isPresent()) {
            throw new AppException(OrderConst.ORDER_MSG_ERROR_NOT_EXIST);
        }
        return optional.get();
    }

    @Override
    public List<OrderDetail> getAllByOrderId(Long id) {
        return orderDetailService.getAllByOrderId(id);
    }

    @Override
    public Page<Order> findOrderByAccountIdAndOrderStatusId(Long accountId, Long orderStatusId, Pageable pageable) {
        OrderStatus orderStatus = orderStatusService.getById(orderStatusId);
        if (orderStatus == null) {
            return orderRepo.findAllByAccount_Id(accountId, pageable);
        }
        return orderRepo.findOrderByAccount_IdAndOrderStatus_Id(accountId, orderStatusId, pageable);
    }

    @Override
    public Page<Order> getAllOrdersAndPagination(Long id, Pageable pageable) {
        OrderStatus orderStatus = orderStatusService.getById(id);
        if (orderStatus == null) {
            return orderRepo.findAll(pageable);
        }
        return orderRepo.findOrderByOrderStatus_Id(id, pageable);
    }

    @Override
    @Transactional
    public Order updateOrderWithStatus(Long orderId, Long statusId) {
        Order order = getByOrderId(orderId);
        OrderStatus orderStatus = orderStatusService.getById(statusId);
        if (orderStatus == null) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_MSG_ERROR_NOT_EXIST);
        }
        if (order.getOrderStatus().getId().equals(OrderStatusConst.ORDER_STATUS_CANCEL) || order.getOrderStatus().getId().equals(OrderStatusConst.ORDER_STATUS_SUCCESS)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_MSG_ERROR_NOT_EXIST);
        }
        if (order.getOrderStatus().getId().equals(orderStatus.getId())) {
            throw new AppException(OrderConst.ORDER_MSG_ERROR_ALREADY_STATUS);
        }
        if (order.getOrderStatus().getId() > statusId) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_MSG_ERROR_NOT_EXIST);
        }
        if (statusId == OrderStatusConst.ORDER_STATUS_CANCEL) {
            attributeService.backAttribute(orderId);
            Voucher voucher = order.getVoucher();
            if (voucher != null) {
                voucher.setCount(voucher.getCount() + 1);
                voucherService.saveVoucher(voucher);
            }
        }
        if (statusId == OrderStatusConst.ORDER_STATUS_SUCCESS) {
            order.setIsPending(true);
            attributeService.cacheAttribute(orderId);
        }
        order.setOrderStatus(orderStatus);
        order.setModifyDate(LocalDate.now());
        return orderRepo.save(order);
    }

    @Override
    public Order updateOrder(ReqUpdateOrderDto reqUpdateOrderDto) {
        Optional<Order> optionalOrder = orderRepo.findById(reqUpdateOrderDto.getOrderId());
        if (!optionalOrder.isPresent()) {
            throw new AppException(OrderConst.ORDER_MSG_ERROR_NOT_EXIST);
        }
        Order order = optionalOrder.get();
        order.setIsPending(reqUpdateOrderDto.getIsPending());
        order.setAddress(reqUpdateOrderDto.getAddress());
        order.setEmail(reqUpdateOrderDto.getEmail());
        order.setFullname(reqUpdateOrderDto.getFullname());
        order.setNote(reqUpdateOrderDto.getNote());
        order.setPhone(reqUpdateOrderDto.getPhone());
        order.setModifyDate(LocalDate.now());
        return orderRepo.save(order);
    }

//    @Override
//    @Transactional
//    public Order cancelOrder(Long orderId) {
//        Order order = getByOrderId(orderId);
//        if (order.getOrderStatus().getId() == OrderStatusConst.ORDER_STATUS_SHIPPING) {
//            throw new AppException("Đơn hàng đang được vận chuyển.");
//        }
//        if (order.getOrderStatus().getId() == OrderStatusConst.ORDER_STATUS_CANCEL) {
//            throw new AppException("Đơn hàng đã được hủy.");
//        }
//        if (order.getOrderStatus().getId() == OrderStatusConst.ORDER_STATUS_SUCCESS) {
//            throw new AppException("Đơn hàng đã được giao thành công.");
//        }
//        OrderStatus orderStatus = orderStatusService.getById(OrderStatusConst.ORDER_STATUS_CANCEL);
//        order.setOrderStatus(orderStatus);
//        order = orderRepo.save(order);
//
//        Notification notification = new Notification();
//        notification.setRead(false);
//        notification.setDeliver(false);
//        notification.setType(2);
//        notification.setContent(String.format("Đơn hàng %s vừa hủy, kiểm tra ngay nào", String.valueOf(order.getId())));
//        notification.setOrder(order);
//        notificationService.createNotification(notification);
//
//        return order;
//    }

    @Override
    @Transactional
    public Order cancelOrder(ReqCancelOrder reqCancelOrder) {
        Order order = getByOrderId(reqCancelOrder.getId());
        if (order.getOrderStatus().getId() == OrderStatusConst.ORDER_STATUS_SHIPPING) {
            throw new AppException("Đơn hàng đang được vận chuyển.");
        } else if (order.getOrderStatus().getId() == OrderStatusConst.ORDER_STATUS_CANCEL) {
            throw new AppException("Đơn hàng đã được hủy.");
        } else if (order.getOrderStatus().getId() == OrderStatusConst.ORDER_STATUS_SUCCESS) {
            throw new AppException("Đơn hàng đã được giao thành công.");
        }
        OrderStatus orderStatus = orderStatusService.getById(OrderStatusConst.ORDER_STATUS_CANCEL);
        order.setOrderStatus(orderStatus);
        order.setDescription(reqCancelOrder.getDescription());
        order = orderRepo.save(order);

        Collection<OrderDetail> orderDetails = order.getOrderDetails();
        for (OrderDetail o : orderDetails) {
            Attribute attribute = o.getAttribute();
            attribute.setStock(attribute.getStock() + o.getQuantity());
            attribute.setCache(attribute.getCache() - o.getQuantity());
            attributeService.save(attribute);
        }
        Voucher voucher = order.getVoucher();
        if(voucher != null){
            voucher.setCount(new Integer(1));
            voucher.setIsActive(Boolean.TRUE);
            voucherService.saveVoucher(voucher);
        }
        Notification notification = new Notification();
        notification.setRead(false);
        notification.setDeliver(false);
        notification.setType(2);
        notification.setContent(String.format("Đơn hàng %s vừa hủy, kiểm tra ngay nào", order.getId()));
        notification.setOrder(order);
        notificationService.createNotification(notification);

        return order;
    }

    @Override
    public Page<Order> findOrderByAccount_Id(Long id, Pageable pageable) {
        return orderRepo.findOrderByAccount_Id(id, pageable);
    }

    @Override
    public Page<Order> findOrderByOrderStatusAndYearAndMonth(Long id, Integer year, Integer month, Pageable pageable) {
        if (id.equals(0L)) {
            return orderRepo.findOrderByYearAndMonth(year, month, pageable);
        }
        return orderRepo.findOrderByOrderStatusAndYearAndMonth(id, year, month, pageable);
    }

    @Override
    public Page<Order> findOrderBetweenDate(Long id, LocalDate from, LocalDate to, Pageable pageable) {
        if (id.equals(0L)) {
            return orderRepo.findOrderBetweenDate(from, to, pageable);
        }
        return orderRepo.findOrderByOrderStatusBetweenDate(id, from, to, pageable);
    }

    @Override
    public Page<ReportProduct> reportByProduct(Pageable pageable) {
        return orderRepo.reportByProduct(pageable);
    }

    @Override
    public Page<Order> findOrderByProduct(Long id, Pageable pageable) {
        return orderRepo.findOrderByProduct(id, pageable);
    }

    @Override
    public List<AmountYear> reportAmountYear() {
        return orderRepo.reportAmountYear();
    }

    @Override
    public List<AmountMonth> reportAmountMonth(Integer year) {
        return orderRepo.reportAmountMonth(year);
    }

    @Override
    public List<CategoryRevenue> reportAmountCategoryMonth(Integer year, Integer month) {
        return orderRepo.reportAmountCategoryMonth(year, month);
    }

    @Override
    public void deleteOrderByCode(String code) {
        Order order = orderRepo.findByCode(code);
        if (order != null) {
            orderRepo.delete(order);
        } else {
            throw new AppException("Đơn hàng với code " + code + " không tồn tại.");
        }
    }

    @Override
    public Integer countOrder() {
        return orderRepo.findAll().size();
    }

    @Override
    public List<CountOrder> countOrderByName() {
        return orderRepo.countOrderByName();
    }

    @Override
    public List<Order> findOrderBySeenEquals(Boolean seen) {
        return orderRepo.findOrderBySeenEquals(seen);
    }

    @Override
    @Transactional
    public Order processOrder(ReqUpdateStatusOrder reqUpdateStatusOrder) {
        Order order = getByOrderId(reqUpdateStatusOrder.getId());
        Long flag = order.getOrderStatus().getId();
        if (flag.equals(OrderStatusConst.ORDER_STATUS_WAITING)) {
            OrderStatus orderStatus = orderStatusService.getById(OrderStatusConst.ORDER_STATUS_PROCESS);
            order.setOrderStatus(orderStatus);
            order.setModifyDate(LocalDate.now());
            return orderRepo.save(order);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_PROCESS)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_PROCESS_MESSAGE);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_SHIPPING)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_SHIPPING_MESSAGE);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_SUCCESS)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_SUCCESS_MESSAGE);
        } else {
            throw new AppException(OrderStatusConst.ORDER_STATUS_CANCEL_MESSAGE);
        }
    }

    @Override
    @Transactional
    public Order shipOrder(ReqUpdateStatusOrder reqUpdateStatusOrder) {
        Order order = getByOrderId(reqUpdateStatusOrder.getId());
        Long flag = order.getOrderStatus().getId();
        if (flag.equals(OrderStatusConst.ORDER_STATUS_WAITING)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_WAITING_MESSAGE);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_PROCESS)) {
            OrderStatus orderStatus = orderStatusService.getById(OrderStatusConst.ORDER_STATUS_SHIPPING);
            order.setOrderStatus(orderStatus);
            order.setShipment(reqUpdateStatusOrder.getShipment());
            order.setCode(reqUpdateStatusOrder.getCode());
            order.setShipDate(reqUpdateStatusOrder.getShipDate());
            order.setModifyDate(LocalDate.now());
            return orderRepo.save(order);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_SHIPPING)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_SHIPPING_MESSAGE);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_SUCCESS)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_SUCCESS_MESSAGE);
        } else {
            throw new AppException(OrderStatusConst.ORDER_STATUS_CANCEL_MESSAGE);
        }
    }

    @Override
    @Transactional
    public Order successOrder(ReqUpdateStatusOrder reqUpdateStatusOrder) {
        Order order = getByOrderId(reqUpdateStatusOrder.getId());
        Long flag = order.getOrderStatus().getId();
        if (flag.equals(OrderStatusConst.ORDER_STATUS_WAITING)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_WAITING_MESSAGE);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_PROCESS)) {
            throw new AppException("Đơn hàng cần xác nhận vận chuyển");
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_SHIPPING)) {
            OrderStatus orderStatus = orderStatusService.getById(OrderStatusConst.ORDER_STATUS_SUCCESS);
            order.setOrderStatus(orderStatus);
            order.setModifyDate(LocalDate.now());
            order.setIsPending(true);
            List<OrderDetail> list = orderDetailService.getAllByOrderId(order.getId());
            for (OrderDetail o : list) {
                Attribute attribute = o.getAttribute();
                attribute.setCache(attribute.getCache() - o.getQuantity());
                attributeService.save(attribute);
            }
            Voucher v = order.getVoucher();
            if(v != null){
                v.setIsActive(Boolean.FALSE);
                voucherService.saveVoucher(v);
            }
           if(order.getTotal() > 1000000){
               Voucher voucher = new Voucher();
               voucher.setCode(generateCode());
               voucher.setIsActive(Boolean.TRUE);
               voucher.setCreateDate(LocalDate.now());
               voucher.setCount(new Integer(1));
               voucher.setExpireDate(LocalDate.now().plusYears(1));
               if (order.getTotal() >= 3000000) {
                   voucher.setDiscount(new Integer(30));
               } else if (order.getTotal() >= 2000000) {
                   voucher.setDiscount(new Integer(20));
               } else {
                   voucher.setDiscount(new Integer(10));
               }
               voucher = voucherService.saveVoucher(voucher);
               try {
                   MailUtil.sendEmail(voucher, order);
               } catch (MessagingException e) {
                   System.out.println("Can't send an email.");
               }
           }
            return orderRepo.save(order);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_SUCCESS)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_SUCCESS_MESSAGE);
        } else {
            throw new AppException(OrderStatusConst.ORDER_STATUS_CANCEL_MESSAGE);
        }
    }

    @Override
    @Transactional
    public Order cancelOrder(ReqUpdateStatusOrder reqUpdateStatusOrder) {
        Order order = getByOrderId(reqUpdateStatusOrder.getId());
        Long flag = order.getOrderStatus().getId();
        if (flag.equals(OrderStatusConst.ORDER_STATUS_SUCCESS)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_SUCCESS_MESSAGE);
        } else if (flag.equals(OrderStatusConst.ORDER_STATUS_CANCEL)) {
            throw new AppException(OrderStatusConst.ORDER_STATUS_CANCEL_MESSAGE);
        } else {
            OrderStatus orderStatus = orderStatusService.getById(OrderStatusConst.ORDER_STATUS_CANCEL);
            order.setOrderStatus(orderStatus);
            order.setDescription(reqUpdateStatusOrder.getDescription());
            order.setModifyDate(LocalDate.now());
            List<OrderDetail> list = orderDetailService.getAllByOrderId(order.getId());
            for (OrderDetail o : list) {
                Attribute attribute = o.getAttribute();
                attribute.setCache(attribute.getCache() - o.getQuantity());
                attribute.setStock(attribute.getStock() + o.getQuantity());
                attributeService.save(attribute);
            }
            Voucher voucher = order.getVoucher();
            if(voucher != null){
                voucher.setCount(new Integer(1));
                voucher.setIsActive(Boolean.TRUE);
                voucherService.saveVoucher(voucher);
            }
            return orderRepo.save(order);
        }
    }

    private String generateCode() {
        int leftLimit = 48; // numeral '0'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 10;
        Random random = new Random();

        String generatedString = random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();

        return generatedString;
    }

    @Override
    public void deleteOrderById(Long id) {
        if (orderRepo.existsById(id)) {
            orderRepo.deleteById(id);
        } else {
            throw new AppException("Đơn hàng với id " + id + " không tồn tại.");
        }
    }
}
