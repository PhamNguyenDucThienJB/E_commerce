package com.poly.datn.be.domain.constant;

public class CartItemConst {
    /* Url Api */
    public static final String API_CART_ITEM_GET_BY_ACCOUNT_ID = "/api/site/cart/get-by-account-id/{id}";
    public static final String API_CART_ITEM_MODIFY = "/api/site/cart/modify";
    public static final String API_CART_ITEM_REMOVE = "/api/site/cart/remove";
    public static final String API_CART_ITEM_RELOAD = "/api/site/cart/reload";
    public static final String API_CART_ITEM_IS_ENOUGH = "/api/site/cart/is-enough";

    /* Cart Item constant */
    public static final Integer CART_ITEM_QUANTITY_ADD = 1;
    public static final Integer CART_ITEM_QUANTITY_WAITING = 0;
    public static final Boolean CART_ITEM_ACTIVE = true;
    public static final Boolean CART_ITEM_INACTIVE = false;
}
