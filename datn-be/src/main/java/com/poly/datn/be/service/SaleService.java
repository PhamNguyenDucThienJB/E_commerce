package com.poly.datn.be.service;

import com.poly.datn.be.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SaleService {


    Sale getSaleById(Long id);

    Sale saveSale(Sale sale);

    Sale updateSale(Sale sale);

    void delete(Long id);

    Page<Sale> getToTalPage(Pageable pageable);
}
