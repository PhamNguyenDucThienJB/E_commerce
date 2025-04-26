package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.CategoryConst;
import com.poly.datn.be.domain.dto.ReqCategoryDto;
import com.poly.datn.be.domain.dto.ReqCategoryProductDto;
import com.poly.datn.be.entity.Category;
import com.poly.datn.be.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping(CategoryConst.API_CATEGORY)
public class CategoryApi {

    final
    CategoryService categoryService;

    public CategoryApi(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping(CategoryConst.FIND_ALL)
    public ResponseEntity<?> findAllList(@RequestParam("page")Optional<Integer> page,
                                         @RequestParam("size")Optional<Integer> size) {
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(9), Sort.Direction.DESC, "createDate");
        return ResponseEntity.ok(categoryService.findAll(pageable));
    }
    @GetMapping(CategoryConst.FIND_BY_ID)
    public ResponseEntity<?> findById(@PathVariable("id") Long id) {
        Category category = categoryService.findById(id);
        return category == null ? new ResponseEntity<>("Loại sản phẩm không tồn tại.", HttpStatus.BAD_REQUEST) : ResponseEntity.ok(category);
    }

    @PostMapping(CategoryConst.CREATE)
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
         return ResponseEntity.ok(categoryService.saveCategory(category));
    }

    @PostMapping(CategoryConst.UPDATE)
    public ResponseEntity<?> updateCategory(@RequestBody Category category){
        return ResponseEntity.ok(categoryService.updateCategory(category));
    }

    @PostMapping(CategoryConst.DELETE)
    public ResponseEntity<?> deleteCategory(@RequestBody ReqCategoryDto categoryDto){
             return ResponseEntity.ok(categoryService.deleteCategory(categoryDto));
    }

    @PostMapping(CategoryConst.ADD_PRODUCT_CATEGORY)
    public ResponseEntity<?> addProductToCategory(@RequestBody ReqCategoryProductDto productDto){
        return ResponseEntity.ok(categoryService.createProductCate(productDto));
    }

}
