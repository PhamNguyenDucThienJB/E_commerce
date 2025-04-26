package com.poly.datn.be.domain.constant;

public class ProductConst {
    /* Api Url */
    public static final String API_PRODUCT_GET_ALL = "/api/site/product/get-all";
    public static final String API_PRODUCT_FIND_ALL = "/api/site/product/find-all";
    public static final String API_PRODUCT_FILTER = "/api/site/product/filter";
    public static final String API_PRODUCT_RELATE = "/api/site/product/relate";
    public static final String API_PRODUCT_GET_ALL_BY_BRAND = "/api/site/product/by-brand";
    public static final String API_PRODUCT_CREATE = "/api/admin/product/create";
    public static final String API_PRODUCT_MODIFY = "/api/admin/product/modify";
    public static final String API_PRODUCT_SEARCH = "/api/site/products/search";
    public static final String API_PRODUCT_COUNT = "/api/admin/product/count";
    public static final String API_PRODUCT_GET_BY_ID = "/api/site/product/detail/{id}";
    public static final String API_PRODUCT_TOTAL_PAGE = "/api/site/product/total-page";

    /* Product Constant */
    public static final Integer PRODUCT_AVG_SIZE = 39;
    public static final String PRODUCT_MAIN_IMAGE = "main";
    public static final String PRODUCT_OTHER_IMAGE = "other";
    public static final String PRODUCT_MSG_ERROR_NOT_EXIST = "Mã sản phẩm không tồn tại!";
    public static final String PRODUCT_MSG_CODE_EXIST = "Code đã tồn tại!";
}
