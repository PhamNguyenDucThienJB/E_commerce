package com.poly.datn.be.service;

import com.poly.datn.be.domain.dto.ReqCategoryDto;
import com.poly.datn.be.domain.dto.ReqCategoryProductDto;
import com.poly.datn.be.entity.Category;
import com.poly.datn.be.entity.ProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    Page<Category> findAll(Pageable pageable);
    Category findById(Long id);
    Category saveCategory(Category category);
    Category updateCategory(Category category);
    Category deleteCategory(ReqCategoryDto categoryDto);
    ProductCategory createProductCate(ReqCategoryProductDto productDto);
}
