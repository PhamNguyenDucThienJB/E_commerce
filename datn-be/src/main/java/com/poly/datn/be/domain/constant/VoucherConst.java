package com.poly.datn.be.domain.constant;

public class VoucherConst {
    /* Url Api */
    public static final String API_VOUCHER_GET_BY_CODE = "/api/site/voucher/get-by-code";
    public static final String API_VOUCHER_CREATE = "/api/admin/voucher/create";
    public static final String API_VOUCHER_UPDATE = "/api/admin/voucher/update";
    public static final String API_VOUCHER_REMOVE = "/api/admin/voucher/remove/{id}";
    public static final String API_VOUCHER_GET_ALL = "/api/admin/voucher/gel-all";
    public static final String API_VOUCHER_GET_BY_ID = "/api/site/voucher/detail/{id}";

    /* Voucher constant */
    public static final String MSG_ERROR_VOUCHER_NOT_EXIST = "Voucher không tồn tại.";
    public static final String MSG_ERROR_VOUCHER_EXPIRED = "Voucher đã hết hạn.";
    public static final String MSG_ERROR_VOUCHER_INACTIVE = "Voucher hết hoạt động.";
    public static final String MSG_ERROR_VOUCHER_USED = "Voucher đã hết lượt sử dụng.";
    public static final String MSG_ERROR_CODE_DUPLICATE = "Mã Code bị trùng xin nhập mã khác.";
}
