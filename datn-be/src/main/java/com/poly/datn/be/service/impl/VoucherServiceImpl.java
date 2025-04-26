package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.VoucherConst;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Voucher;
import com.poly.datn.be.repo.VoucherRepo;
import com.poly.datn.be.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Service
public class VoucherServiceImpl implements VoucherService {
    @Autowired
    VoucherRepo voucherRepo;

    @Override
    public Voucher getVoucherByCode(String code) {
        Optional<Voucher> optionalVoucher = voucherRepo.findVoucherByCode(code);
        if(optionalVoucher.isPresent()){
            Voucher voucher = optionalVoucher.get();
            if(voucher.getExpireDate().isBefore(LocalDate.now())){
                throw new AppException(VoucherConst.MSG_ERROR_VOUCHER_EXPIRED);
            }
            if(!voucher.getIsActive()){
                throw new AppException(VoucherConst.MSG_ERROR_VOUCHER_INACTIVE);
            }
            if(voucher.getCount() == 0){
                throw new AppException(VoucherConst.MSG_ERROR_VOUCHER_USED);
            }
            return voucher;
        }else{
            throw new AppException(VoucherConst.MSG_ERROR_VOUCHER_NOT_EXIST);
        }
    }

    @Override
    public Voucher getVoucherByOrder(Long id) {
        return null;
    }

    @Override
    public Voucher saveVoucher(Voucher voucher) {
        voucher.setCreateDate(LocalDate.now());
        voucher.setIsActive(AppConst.CONST_ACTIVE);
        return voucherRepo.save(voucher);
    }
    @Override
    public Voucher update(Voucher voucher){
        Optional<Voucher> optional = voucherRepo.findById(voucher.getId());
        if(optional.isPresent()){
            Voucher vou = optional.get();
            vou.setCode(voucher.getCode());
            vou.setExpireDate(voucher.getExpireDate());
            vou.setCreateDate(LocalDate.now());
            vou.setDiscount(voucher.getDiscount());
            vou.setCount(voucher.getCount());
            vou.setIsActive(voucher.getIsActive());
            voucherRepo.save(vou);
            return vou;
        }else {
            throw new AppException(VoucherConst.MSG_ERROR_VOUCHER_NOT_EXIST);
        }

    }
    @Override
    public void delete(Long id){
        if(!voucherRepo.existsById(id)){
            throw  new AppException(VoucherConst.MSG_ERROR_VOUCHER_NOT_EXIST);
        }
        Voucher vou =voucherRepo.findById(id).orElse(null);
        vou.setIsActive(false);
        voucherRepo.save(vou);

    }
    @Override
    public boolean exitsByCode(String code){
        return voucherRepo.existsByCode(code);

    }
    @Override
    public Page<Voucher> getToTalPage(Pageable pageable){
        return voucherRepo.findAll(pageable);
    }
    @Override
    public Voucher getVOucherById(Long id){
        Optional<Voucher> optionalVoucher = voucherRepo.findById(id);
        if(!optionalVoucher.isPresent()){
            throw new AppException(VoucherConst.MSG_ERROR_VOUCHER_NOT_EXIST);
        }
        return optionalVoucher.get();
    }

    @Override
    public List<Voucher> findAll() {
        return voucherRepo.findAll();
    }
}
