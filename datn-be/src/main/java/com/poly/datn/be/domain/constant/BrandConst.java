package com.poly.datn.be.domain.constant;

public class BrandConst {
    /* Url Api */
    public static final String API_BRAND_GET_BY_ID = "/api/admin/brand/detail/{id}";
    public static final String API_BRAND_GET_ALL = "/api/admin/brand/find-all";
    public static final String API_UPDATE_UPDATE = "/api/admin/brand/update";
    public static final String API_BRAND_CREATE = "/api/admin/brand/create";
    public static final String API_BRAND_REMOVE = "/api/admin/brand/remove/{id}";

    /* Brand constant */
    public static final String MSG_ERROR_CODE_DUPLICATE_BRAND = "Tên thương hiệu đã tồn tại.";
    public static final String BRAND_MSG_ERROR_NOT_EXIST = "Mã thương hiệu không tồn tại!";
    public static final String MSG_ERROR_BRAND_NOT_EXIST = "Thương hiệu không tồn tại.";

}
