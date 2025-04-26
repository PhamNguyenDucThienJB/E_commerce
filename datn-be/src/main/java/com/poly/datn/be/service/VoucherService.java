package com.poly.datn.be.service;

import com.poly.datn.be.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface VoucherService {
    Voucher getVoucherByCode(String code);
    Voucher getVoucherByOrder(Long id);
    Voucher saveVoucher(Voucher voucher);
    Voucher update(Voucher voucher);
    void delete(Long id);
    boolean exitsByCode(String code);
    Page<Voucher> getToTalPage(Pageable pageable);
    Voucher getVOucherById(Long id);
    List<Voucher> findAll();
}
