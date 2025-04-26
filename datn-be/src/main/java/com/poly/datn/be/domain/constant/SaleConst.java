package com.poly.datn.be.domain.constant;

public class SaleConst {
    /* Url Api */
    public static final String API_SALE_GET_BY_ID = "/api/admin/sale/detail/{id}";
    public static final String API_SALE_CREATE = "/api/admin/sale/create";
    public static final String API_SALE_UPDATE = "/api/admin/sale/update";
    public static final String API_SALE_REMOVE = "/api/admin/sale/remove/{id}";
    public static final String API_SALE_GET_ALL = "/api/admin/sale/get-all";

    /* Sale constant */
    public static final String MSG_ERROR_SALE_NOT_ACCEPT = "Không thể thay đổi trạng thái mặc định.";
    public static final String MSG_ERROR_SALE_NOT_EXIST = "id không tồn tại.";

}
