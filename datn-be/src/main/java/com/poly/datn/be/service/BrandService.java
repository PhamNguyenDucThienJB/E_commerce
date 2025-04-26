package com.poly.datn.be.service;

import com.poly.datn.be.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BrandService {

    Page<Brand> getBrands(Pageable pageable);

    Integer getToTalPage();


    Brand getBrandById(Long id);

    boolean existsByName(String name);

    Brand saveBrand(Brand brand);

    Brand update(Brand brand);

    void delete(Long id);
}
