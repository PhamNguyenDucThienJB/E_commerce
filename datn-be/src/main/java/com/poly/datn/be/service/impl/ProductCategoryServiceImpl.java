package com.poly.datn.be.service.impl;

import com.poly.datn.be.entity.ProductCategory;
import com.poly.datn.be.repo.ProductCategoryRepo;
import com.poly.datn.be.service.ProductCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductCategoryServiceImpl implements ProductCategoryService {
    @Autowired
    ProductCategoryRepo productCategoryRepo;

    @Override
    public ProductCategory create(ProductCategory productCategory) {
        return productCategoryRepo.save(productCategory);
    }

    @Override
    public Optional<ProductCategory> findProductCategory(Long productId, Long categoryId) {
        return productCategoryRepo.findProductCategoryByProduct_IdAndCategory_Id(productId, categoryId);
    }

    @Override
    public List<ProductCategory> findByProduct(Long id) {
        return productCategoryRepo.findProductCategoryByProduct_Id(id);
    }

    @Override
    public void removeProductCategory(ProductCategory productCategory) {
        productCategoryRepo.delete(productCategory);
    }
}
