package com.poly.datn.be.domain.constant;

public class OrderConst {
    /* Url Api */
    public static final String API_ORDER_CREATE = "/api/site/order/create";
    public static final String API_ORDER_UPDATE = "/api/site/order/update";
    public static final String API_ORDER_CANCEL = "/api/site/order/cancel";
    public static final String API_ORDER_COUNT = "/api/admin/order/count-order";
    public static final String API_ORDER_COUNT_BY_NAME = "/api/admin/order/count-order-by-name";
    public static final String API_ORDER_PAGE_ORDER = "/api/site/page-orders";
    public static final String API_ORDER_LIST_AMOUNT_YEAR = "/api/admin/order/amount-year";
    public static final String API_ORDER_LIST_AMOUNT_MONTH = "/api/admin/order/amount-month";
    public static final String API_ORDER_PAGE_ORDER_BY_PRODUCT = "/api/admin/order/page-orders-by-product";
    public static final String API_ORDER_PAGE_REPORT_PRODUCT = "/api/admin/order/page-report-product";
    public static final String API_ORDER_PAGE_ORDER_BY_YEAR_AND_MONTH = "/api/admin/order/page-orders-by-year-and-month";
    public static final String API_ORDER_PAGE_ORDER_BETWEEN_DATE = "/api/admin/order/page-orders-between-date";
    public static final String API_ORDER_UPDATE_STATUS = "/api/admin/order/update-order-with-status";
    public static final String API_ORDER_GET_ALL_BY_ACCOUNT = "/api/site/order/get-orders";
    public static final String API_ORDER_GET_ALL_AND_PAGINATION = "/api/admin/order/get-orders-and-pagination";
    public static final String API_ORDER_GET_BY_ID = "/api/site/order/get-order-by-id";
    public static final String API_ORDER_BASE64 = "/api/site/order/base64";
    public static final String API_ORDER_DETAIL_GET_BY_ID = "/api/site/order/get-order-detail-by-id";
    public static final String API_PROCESS_ORDER = "/api/site/order/process-order";
    public static final String API_SHIP_ORDER = "/api/site/order/ship-order";
    public static final String API_SUCCESS_ORDER = "/api/site/order/success-order";
    public static final String API_CANCEL_ORDER = "/api/site/order/cancel-order";

    /* Order constant*/
    public static final String CART_ITEM_MSG_ERROR_NOT_ENOUGH = "Sản phẩm còn lại không đủ!";
    public static final String ORDER_MSG_ERROR_NOT_EXIST = "Đơn hàng không tồn tại!";
    public static final String ORDER_MSG_ERROR_ALREADY_STATUS = "Đơn hàng đã ở trạng thái này.";
}
