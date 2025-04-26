package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.CartItemConst;
import com.poly.datn.be.domain.constant.OrderConst;
import com.poly.datn.be.domain.constant.ProductConst;
import com.poly.datn.be.domain.dto.ReqCartItemDto;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.Attribute;
import com.poly.datn.be.entity.CartItem;
import com.poly.datn.be.repo.CartItemRepo;
import com.poly.datn.be.service.AccountService;
import com.poly.datn.be.service.AttributeService;
import com.poly.datn.be.service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartItemServiceImpl implements CartItemService {
    @Autowired
    CartItemRepo cartItemRepo;
    @Autowired
    AttributeService attributeService;
    @Autowired
    AccountService accountService;

    @Override
    public List<Object[]> getCartItemByAccountId(Long id, Boolean isActive) {
        return cartItemRepo.getCartItemByAccountId(id, ProductConst.PRODUCT_MAIN_IMAGE, isActive);
    }

    @Override
    public List<CartItem> getAllByAccountId(Long id, Boolean isActive) {
        return cartItemRepo.findCartItemByAccount_IdAndIsActiveEquals(id, isActive);
    }

    @Override
    public CartItem findCartItemByAccountIdAndAttributeId(Long accountId, Long attributeId) {
        return cartItemRepo.findCartItemByAccountIdAndAttributeId(accountId, attributeId);
    }

    @Override
    public CartItem saveCartItem(CartItem cartItem) {
        return cartItemRepo.save(cartItem);
    }

    @Override
    public CartItem modifyCartItem(ReqCartItemDto reqCartItemDto) {
        Attribute attribute = attributeService.findById(reqCartItemDto.getAttributeId());
        Account account = accountService.findById(reqCartItemDto.getAccountId());
        CartItem cartItem = cartItemRepo.findCartItemByAccountIdAndAttributeId(reqCartItemDto.getAccountId(),
                reqCartItemDto.getAttributeId());
        if(cartItem == null){
            if(reqCartItemDto.getQuantity() > attribute.getStock()){
                throw new AppException(OrderConst.CART_ITEM_MSG_ERROR_NOT_ENOUGH);
            }else{
                CartItem c = new CartItem();
                c.setAccount(account);
                c.setAttribute(attribute);
                c.setQuantity(CartItemConst.CART_ITEM_QUANTITY_ADD);
                c.setLastPrice(reqCartItemDto.getLastPrice());
                c.setIsActive(CartItemConst.CART_ITEM_ACTIVE);
                return cartItemRepo.save(c);
            }
        }else{
            int flag = reqCartItemDto.getQuantity();
            if(flag == 0){
                cartItem.setQuantity(flag);
                cartItem.setIsActive(CartItemConst.CART_ITEM_INACTIVE);
                return cartItemRepo.save(cartItem);
            }else if(flag > attribute.getStock()){
                throw new AppException(OrderConst.CART_ITEM_MSG_ERROR_NOT_ENOUGH);
            }else{
                cartItem.setQuantity(flag);
                cartItem.setIsActive(CartItemConst.CART_ITEM_ACTIVE);
                return cartItemRepo.save(cartItem);
            }
        }
    }

    @Override
    public void removeCartItem(ReqCartItemDto reqCartItemDto) {
        CartItem cartItem = cartItemRepo.findCartItemByAccountIdAndAttributeId(reqCartItemDto.getAccountId(),
                reqCartItemDto.getAttributeId());
        if(cartItem == null){
            throw new AppException(AppConst.MSG_ERROR_COMMON_RESOURCE_NOT_VALID);
        }
        cartItem.setQuantity(CartItemConst.CART_ITEM_QUANTITY_WAITING);
        cartItem.setIsActive(CartItemConst.CART_ITEM_INACTIVE);
        cartItemRepo.save(cartItem);
    }

    @Override
    public void clearCartItem(Long id) {
        List<CartItem> cartItemList = getAllByAccountId(id, CartItemConst.CART_ITEM_ACTIVE);
        for(CartItem c: cartItemList){
            c.setIsActive(CartItemConst.CART_ITEM_INACTIVE);
            c.setQuantity(CartItemConst.CART_ITEM_QUANTITY_WAITING);
            cartItemRepo.save(c);
        }
    }

    @Override
    public Boolean isEnoughStock(Long id, Integer quantity) {
        Attribute attribute = attributeService.findById(id);
        if(attribute.getStock() < quantity){
            throw new AppException(OrderConst.CART_ITEM_MSG_ERROR_NOT_ENOUGH);
        }
        return true;
    }

    @Override
    public void reloadCartItem(Long id) {
        List<CartItem> cartItems = cartItemRepo.findCartItemByAccount_IdAndIsActiveEquals(id, CartItemConst.CART_ITEM_ACTIVE);
        CartItem cartItem = null;
        for(int i = 0; i < cartItems.size(); i++){
            cartItem = cartItems.get(i);
            if(cartItem.getQuantity() > cartItem.getAttribute().getStock()){
                cartItem.setQuantity(cartItem.getAttribute().getStock());
                cartItemRepo.save(cartItem);
                cartItem = null;
            }
        }
    }
}
