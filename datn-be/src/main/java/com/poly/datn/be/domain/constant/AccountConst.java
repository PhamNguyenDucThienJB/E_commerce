package com.poly.datn.be.domain.constant;

public class AccountConst {
    /* Url Api*/
    public static final String API_ACCOUNT_FIND_ALL_BY_IS_ACTIVE_OR_INACTIVE = "/api/admin/accounts/{isActive}";
    public static final String API_ACCOUNT_CREATE = "/api/admin/account/create";
    public static final String API_ACCOUNT_UPDATE = "/api/admin/account/update";
    public static final String API_ACCOUNT_TOTAL_PAGE = "/api/admin/account/get-total-page";
    public static final String API_ACCOUNT_GET_BY_ROLE_NAME = "/api/admin/account/by-role";
    public static final String API_ACCOUNT_REGISTER = "/api/site/account/register";
    public static final String API_ACCOUNT_DETAIL_GET_BY_ACCOUNT_ID = "/api/site/account/detail";
    public static final String API_ACCOUNT_DETAIL_UPDATE = "/api/site/account/detail/update";
    public static final String API_ACCOUNT_COUNT = "/api/admin/account/count";
    public static final String API_ACCOUNT_FIND_ALL = "/api/admin/account/find-all";
    public static final String API_ACCOUNT_FIND_BY_ID = "/api/admin/account/{id}";
    public static final String API_ACCOUNT_FIND_BY_USERNAME = "/api/site/account/find-by-username";
    public static final String API_ACCOUNT_FIND_ME = "/api/site/me";
    public static final String API_ACCOUNT_FORGOT_PASSWORD= "/api/site/forgot-password";
    /* Account constant*/
    public static final String ACCOUNT_MSG_ERROR_NOT_EXIST = "Tài khoản không tồn tại!";
    public static final String ACCOUNT_MSG_ERROR_SIGN_IN = "Đăng nhập thất bại!";
    public static final String ACCOUNT_MSG_ERROR_LOCK = "Tài khoản đã bị khóa!";
    public static final String ACCOUNT_MSG_ERROR_ACCESS_DENIED = "Bạn không có quyền truy cập!";
}
