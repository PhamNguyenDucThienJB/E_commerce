package com.poly.datn.be.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.CategoryConst;
import com.poly.datn.be.domain.constant.OrderConst;
import com.poly.datn.be.domain.constant.OrderStatusConst;
import com.poly.datn.be.domain.dto.ReqCategoryDto;
import com.poly.datn.be.domain.dto.ReqCategoryProductDto;
import com.poly.datn.be.domain.dto.ReqUpdateOrderDto;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Category;
import com.poly.datn.be.entity.Order;
import com.poly.datn.be.entity.Product;
import com.poly.datn.be.entity.ProductCategory;
import com.poly.datn.be.repo.CategoryRepo;
import com.poly.datn.be.repo.ProductCategoryRepo;
import com.poly.datn.be.service.CategoryService;
import com.poly.datn.be.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    CategoryRepo categoryRepo;

    @Autowired
    @Lazy
    ProductService productService;
    @Override
    public Page<Category> findAll(Pageable pageable) {
        return categoryRepo.findAll(pageable);
    }

    @Override
    public Category findById(Long id) {
        return categoryRepo.findById(id).orElse(null);
    }

    @Autowired
    ObjectMapper objectMapper;
    @Autowired
    ProductCategoryRepo productCategoryRepo;
    @Override
    public Category saveCategory(Category category) {
        category.setCreateDate(LocalDate.now());
        category.setModifyDate(LocalDate.now());
        return categoryRepo.save(category);
    }


    @Override
    @org.springframework.transaction.annotation.Transactional
    public Category updateCategory(Category category) {
        Optional<Category> optional = categoryRepo.findById(category.getId());
        if(optional.isPresent()){
            Category cate = optional.get();
            cate.setIsActive(category.getIsActive());
            cate.setModifyDate(LocalDate.now());
            cate.setDescription(category.getDescription());
            cate.setName(category.getName());
            List<Product> products = productService.getProductByCategory(cate.getId());
            if(!category.getIsActive()){
                for(Product p: products){
                    p.setIsActive(AppConst.CONST_IN_ACTIVE);
                    productService.update(p);
                }
            }else{
                for(Product p: products){
                    p.setIsActive(AppConst.CONST_ACTIVE);
                    productService.update(p);
                }
            }
            return categoryRepo.save(cate);
        }else{
            throw new AppException("Loại sản phẩm không tồn tại.");
        }
    }

    @Override
    @Transactional
    public Category deleteCategory(ReqCategoryDto categoryDto) {
        try {
            Optional<Category> optionalCategory = categoryRepo.findById(categoryDto.getId());
            Category category = optionalCategory.get();
            category.setIsActive(false);
            return categoryRepo.save(category);
        } catch (Exception e) {
            throw new AppException(CategoryConst.FALSE);
        }
    }

    @Override
    @Transactional
    public ProductCategory createProductCate(ReqCategoryProductDto productDto) {
        try {
            ProductCategory category = objectMapper.convertValue(productDto, ProductCategory.class);
            return productCategoryRepo.save(category);
        } catch (Exception e) {
            throw new AppException(CategoryConst.FALSE);
        }
    }
}
