package com.poly.datn.be.domain.constant;

public class OrderStatusConst {
    /* Url Api */
    public static final String API_ORDER_STATUS_GET_ALL = "/api/site/get-order-statuses";

    /* Order Status Constant */
    public static final String ORDER_STATUS_MSG_ERROR_NOT_EXIST = "Trạng thái đơn hàng không hợp lệ.";
    public static final Long ORDER_STATUS_WAITING = 1L;
    public static final String ORDER_STATUS_WAITING_MESSAGE = "Đơn hàng cần xác nhận trước.";
    public static final Long ORDER_STATUS_PROCESS = 2L;
    public static final String ORDER_STATUS_PROCESS_MESSAGE = "Đơn hàng đã được xác nhận.";
    public static final Long ORDER_STATUS_SHIPPING = 3L;
    public static final String ORDER_STATUS_SHIPPING_MESSAGE = "Đơn hàng đang được vận chuyển.";
    public static final Long ORDER_STATUS_SUCCESS = 4L;
    public static final String ORDER_STATUS_SUCCESS_MESSAGE = "Đơn hàng đã giao thành công.";
    public static final Long ORDER_STATUS_CANCEL = 5L;
    public static final String ORDER_STATUS_CANCEL_MESSAGE = "Đơn hàng đã hủy.";
    public static final Long ORDER_STATUS_RETURN = 6L;
    public static final String ORDER_STATUS_RETURN_MESSAGE = "Đơn hàng đã được hoàn trả.";
    public static final Long ORDER_STATUS_WAITING_RETURN = 7L;
    public static final String ORDER_STATUS_WAITING_RETURN_MESSAGE = "Đang chờ người bán xác nhận hoàn trả.";
    public static final Long ORDER_STATUS_REJECT_RETURN = 8L;
    public static final String ORDER_STATUS_REJECT_RETURN_MESSAGE = "Người bán từ chối hoàn trả.";
}
