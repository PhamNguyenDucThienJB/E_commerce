package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.BrandConst;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Brand;
import com.poly.datn.be.entity.Product;
import com.poly.datn.be.repo.BrandRepo;
import com.poly.datn.be.service.BrandService;
import com.poly.datn.be.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BrandServiceImpl implements BrandService {
    @Autowired
    BrandRepo brandRepo;

    @Autowired
    @Lazy
    ProductService productService;

    @Override
    public Page<Brand> getBrands(Pageable pageable) {
        return brandRepo.findAll(pageable);
    }

    @Override
    public Integer getToTalPage() {
        return brandRepo.findAll(PageRequest.of(0, 2)).getTotalPages();
    }

    @Override
    public Brand getBrandById(Long id) {
        Optional<Brand> optionalBrand = brandRepo.findById(id);
        if (!optionalBrand.isPresent()) {
            throw new AppException(BrandConst.BRAND_MSG_ERROR_NOT_EXIST);
        }
        return optionalBrand.get();
    }

    @Override

    public boolean existsByName(String name) {
        return brandRepo.existsByName(name);

    }

    @Override
    public Brand saveBrand(Brand brand) {
        brand.setCreateDate(LocalDate.now());
        brand.setModifyDate(LocalDate.now());
        return brandRepo.save(brand);
    }

    @Override
    @Transactional
    public Brand update(Brand brand) {
        Optional<Brand> optional = brandRepo.findById(brand.getId());
        if (optional.isPresent()) {
            Brand b = optional.get();
            b.setName(brand.getName());
            b.setModifyDate(LocalDate.now());
            b.setDescription(brand.getDescription());
            b.setImage(brand.getImage());
            b.setIsActive(brand.getIsActive());
            brandRepo.save(b);
            List<Product> list = productService.getProductByBrand(b.getId());
            for (Product product : list) {
                System.out.println(product.getId());
            }
            if (!brand.getIsActive()) {
                for (Product p : list) {
                    p.setIsActive(AppConst.CONST_IN_ACTIVE);
                    productService.update(p);
                }
            } else if (brand.getIsActive()) {
                for (Product p : list) {
                    p.setIsActive(AppConst.CONST_ACTIVE);
                    productService.update(p);
                }
            }
            return b;
        } else {
            throw new AppException(BrandConst.MSG_ERROR_BRAND_NOT_EXIST);
        }

    }

    @Override
    public void delete(Long id) {
        if (!brandRepo.existsById(id)) {
            throw new AppException(BrandConst.MSG_ERROR_BRAND_NOT_EXIST);
        }
        Brand b = brandRepo.findById(id).orElse(null);
        b.setIsActive(false);
        brandRepo.save(b);

    }


}
