package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.ProductConst;
import com.poly.datn.be.domain.dto.*;
import com.poly.datn.be.entity.Image;
import com.poly.datn.be.entity.Product;
import com.poly.datn.be.service.ImageService;
import com.poly.datn.be.service.ProductService;
import com.poly.datn.be.service.RatingService;
import com.poly.datn.be.util.ConvertUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
public class ProductApi {
    @Autowired
    ProductService productService;

    @Autowired
    RatingService ratingService;
    @Autowired
    private ImageService imageService;
    @GetMapping(ProductConst.API_PRODUCT_GET_ALL)
    public ResponseEntity<?> getAllProductPagination(@RequestParam("page") Optional<Integer> page,
                                                     @RequestParam("size") Optional<Integer> size,
                                                     @RequestParam("active") Optional<Boolean> active) {
        Sort sort = Sort.by(Sort.Direction.DESC, "modifyDate");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8), sort);
        return new ResponseEntity<>(productService.getProducts(active.orElse(true), pageable), HttpStatus.OK);
    }
    @GetMapping(ProductConst.API_PRODUCT_RELATE)
    public ResponseEntity<?> relateProduct(@RequestParam("relate") Long brand, @RequestParam("id") Long id) {
        Pageable pageable = PageRequest.of(0, 3);
        return new ResponseEntity<>(productService.relateProduct(id, brand, pageable), HttpStatus.OK);
    }
    @PostMapping(ProductConst.API_PRODUCT_FILTER)
    public ResponseEntity<?> filterProducts(@RequestBody ReqFilterProduct reqFilterProduct) {
        Sort sort = Sort.by(Sort.Direction.DESC, "modifyDate");
        Pageable pageable = PageRequest.of(reqFilterProduct.getPage() - 1, reqFilterProduct.getCount(), sort);
        return new ResponseEntity<>(productService.filterAllProducts(reqFilterProduct.getCategory(), reqFilterProduct.getBrand(), reqFilterProduct.getMin(), reqFilterProduct.getMax(), pageable), HttpStatus.OK);
    }
    @PostMapping("/api/site/product/filter-advanced")
    public ResponseEntity<?> filterProductsAdvanced(@RequestBody ReqFilterProduct req) {
        String sortField = Optional.ofNullable(req.getSortField()).orElse("modifyDate");
        String sortDirection = Optional.ofNullable(req.getSortDirection()).orElse("DESC");

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortField);

        Pageable pageable = PageRequest.of(req.getPage() - 1, req.getCount(), sort);

        return ResponseEntity.ok(
                productService.filterAllProducts(
                        req.getCategory(), req.getBrand(), req.getMin(), req.getMax(), pageable
                )
        );
    }

    @GetMapping(ProductConst.API_PRODUCT_GET_ALL_BY_BRAND)
    public ResponseEntity<?> getAllProductByBrand(@RequestParam("page") Optional<Integer> page,
                                                  @RequestParam("size") Optional<Integer> size,
                                                  @RequestParam("active") Optional<Boolean> active,
                                                  @RequestParam("brand") Long brand) {
        Sort sort = Sort.by(Sort.Direction.DESC, "modifyDate");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8), sort);
        if (brand == 0) {
            return new ResponseEntity<>(productService.getProducts(active.orElse(true), pageable), HttpStatus.OK);
        }
        return new ResponseEntity<>(productService.getAllProductsByBrand(active.orElse(true), brand, pageable), HttpStatus.OK);
    }

    @GetMapping(ProductConst.API_PRODUCT_SEARCH)
    public ResponseEntity<?> searchByKeyword(@RequestParam("page") Optional<Integer> page,
                                             @RequestParam("size") Optional<Integer> size,
                                             @RequestParam("keyword") String keyword) {
        Sort sort = Sort.by(Sort.Direction.DESC, "id");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(9), sort);
        return new ResponseEntity(productService.searchByKeyword("%" + keyword + "%", pageable), HttpStatus.OK);
    }

    @GetMapping(ProductConst.API_PRODUCT_GET_BY_ID)
    public ResponseEntity<?> getProductById(@PathVariable("id") Long id) {
        return new ResponseEntity<>(ConvertUtil.fromProductDetail(productService.getProductById(id)), HttpStatus.OK);
    }

    // API công khai cho thống kê đánh giá sản phẩm
    @GetMapping("/api/site/product/{productId}/ratings/statistics")
    public ResponseEntity<RespProductRatingDto> getProductRatingStatistics(@PathVariable Long productId) {
        return ResponseEntity.ok(ratingService.getProductRatingStatistics(productId));
    }

    @GetMapping(ProductConst.API_PRODUCT_TOTAL_PAGE)
    public ResponseEntity<?> getTotalPage() {
        return new ResponseEntity<>(productService.getToTalPage(), HttpStatus.OK);
    }

    @GetMapping(ProductConst.API_PRODUCT_COUNT)
    public ResponseEntity<?> countProduct() {
        return new ResponseEntity<>(productService.countProduct(), HttpStatus.OK);
    }

    @PostMapping(ProductConst.API_PRODUCT_CREATE)
    public ResponseEntity<?> createProduct(@RequestBody ReqProductDto reqProductDto) {
        return new ResponseEntity<>(productService.create(reqProductDto), HttpStatus.OK);
    }
    @PostMapping(ProductConst.API_PRODUCT_MODIFY)
    public ResponseEntity<?> modifyProduct(@RequestBody ReqUpdateProductDto reqUpdateProductDto) {
        return new ResponseEntity<>(productService.modify(reqUpdateProductDto), HttpStatus.OK);
    }

    @GetMapping(ProductConst.API_PRODUCT_FIND_ALL)
    public ResponseEntity<?> findAll() {
        return new ResponseEntity<>(productService.findAll(), HttpStatus.OK);
    }

    // Endpoint to get most-viewed products
    @GetMapping(ProductConst.API_PRODUCT_MOST_VIEWED)
    public ResponseEntity<?> getMostViewedProducts(@RequestParam("page") Optional<Integer> page,
                                                   @RequestParam("size") Optional<Integer> size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "view");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8), sort);
        return new ResponseEntity<>(productService.getMostViewedProducts(pageable), HttpStatus.OK);
    }

    // Endpoint to get best-selling products
    @GetMapping(ProductConst.API_PRODUCT_BEST_SELLERS)
    public ResponseEntity<?> getBestSellingProducts(@RequestParam("page") Optional<Integer> page,
                                                    @RequestParam("size") Optional<Integer> size) {
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8));
        return new ResponseEntity<>(productService.getBestSellingProducts(pageable), HttpStatus.OK);
    }
    @DeleteMapping("/api/admin/product/delete/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProductById(id);
            return ResponseEntity.ok().body("Xóa thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Xóa thất bại: " + e.getMessage());
        }
    }
    @DeleteMapping("/api/admin/productEdit/delete/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        try {
            imageService.deleteImageById(id);
            return ResponseEntity.ok().body("Xóa ảnh thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Xóa ảnh thất bại: " + e.getMessage());
        }
    }
    @GetMapping("/api/admin/productImage/{productId}")
    public ResponseEntity<List<Image>> getImagesByProductId(@PathVariable Long productId) {
        List<Image> images = imageService.getImagesByProductId(productId);
        return ResponseEntity.ok(images);
    }

}
