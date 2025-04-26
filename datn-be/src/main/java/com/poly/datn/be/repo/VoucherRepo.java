package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepo extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findVoucherByCode(String code);
    Boolean existsByCode(String code);
    Voucher findVoucherByOrder_Id(Long id);
}
