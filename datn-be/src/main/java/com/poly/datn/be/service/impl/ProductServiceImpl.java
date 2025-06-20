package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.AttributeConst;
import com.poly.datn.be.domain.constant.ProductConst;
import com.poly.datn.be.domain.dto.*;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.*;
import com.poly.datn.be.repo.*;
import com.poly.datn.be.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {
    @Autowired
    ProductRepo productRepo;
    @Autowired
    NotificationRepo notificationRepo;
    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private RatingRepo ratingRepo;
    @Autowired
    ImageRepo imageRepo;
    @Autowired
    CartItemRepo cartItemRepo;
    @Autowired
    AttributeRepo attributeRepo;
    @Autowired
    ProductCategoryRepo productCategoryRepo;
    @Autowired
    BrandService brandService;

    @Autowired
    ImageService imageService;

    @Autowired
    ProductCategoryService productCategoryService;

    @Autowired
    AttributeService attributeService;

    @Autowired
    SaleService saleService;

    @Autowired
    CategoryService categoryService;

    @Override
    public  Page<ResponseProductDto> getProducts(Boolean active, Pageable pageable) {
        return productRepo.getAllProducts(ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, active, pageable);
    }

    @Override
    public Page<ResponseProductDto> getAllProductsByBrand(Boolean active, Long brand, Pageable pageable) {
        return productRepo.getAllProductsByBrand(ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, active, brand, pageable);
    }

    @Override
    public Integer getToTalPage() {
        return productRepo.findAll(PageRequest.of(0, 9)).getTotalPages();
    }

    @Override
    public List<RespProductDto> searchByKeyword(String keyword, Pageable pageable) {
        return productRepo.searchAllByKeyword(ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, keyword, pageable);
    }

    @Override
    public Product getProductById(Long id) {
        Optional<Product> optionalProduct = productRepo.findById(id);
        if(!optionalProduct.isPresent()){
            throw new AppException(ProductConst.PRODUCT_MSG_ERROR_NOT_EXIST);
        }
        return optionalProduct.get();
    }

    @Override
    public List<Product> getProductByBrand(Long id) {
        return productRepo.getProductByBrand_Id(id);
    }

    @Override
    public List<Product> findAll() {
        return productRepo.findAll();
    }

    @Override
    public List<Product> getProductByCategory(Long id) {
        return productRepo.getProductByCategory(id);
    }

    @Override
    public List<Product> getProductBySale(Long id) {
        return productRepo.getProductBySale_Id(id);
    }

    @Override
    public Product update(Product product) {
        return productRepo.save(product);
    }

    @Override
    public Integer countProduct() {
        return productRepo.findAll().size();
    }

    @Override
    @Transactional
    public Product create(ReqProductDto reqProductDto) {
        Optional<Product> p = productRepo.findProductByCode(reqProductDto.getCode());
        if(p.isPresent()){
            throw new AppException(ProductConst.PRODUCT_MSG_CODE_EXIST);
        }
        /*Find brand and set for product*/
        Brand brand = brandService.getBrandById(reqProductDto.getBrandId());
        /*Find sale and set for product*/
        Sale sale = saleService.getSaleById(reqProductDto.getSaleId());
        /*Create product from data*/
        Product product = new Product();
        product.setName(reqProductDto.getName());
        product.setCode(reqProductDto.getCode());
        product.setDescription(reqProductDto.getDescription());
        product.setCreateDate(LocalDate.now());
        product.setModifyDate(LocalDate.now());
        product.setView(1L);
        product.setIsActive(AppConst.CONST_ACTIVE);
        product.setBrand(brand);
        product.setSale(sale);
        /*Save product to DB*/
        product = productRepo.save(product);
        /*Create product-category from product*/
        Long[] categoryId = reqProductDto.getCategoryId();
        for(Long l: categoryId){
            Category category = categoryService.findById(l);
            ProductCategory productCategory = new ProductCategory();
            productCategory.setProduct(product);
            productCategory.setCategory(category);
            productCategoryService.create(productCategory);
        }
        /*Create image of product*/
        String[] imageUrl = reqProductDto.getImageUrl();
        for(int i = 0; i < imageUrl.length; i++){
            Image image = new Image();
            if(i == 0){
                image.setName(ProductConst.PRODUCT_MAIN_IMAGE);
            }else{
                image.setName(ProductConst.PRODUCT_OTHER_IMAGE);
            }
            image.setImageLink(imageUrl[i]);
            image.setCreateDate(LocalDate.now());
            image.setModifyDate(LocalDate.now());
            image.setIsActive(AppConst.CONST_ACTIVE);
            image.setProduct(product);

            imageService.createImage(image);
        }
        /*Create attribute of product*/
        ReqAttributeDto[] reqAttributeDtos = reqProductDto.getAttribute();
        for(ReqAttributeDto r: reqAttributeDtos){
            Attribute attribute = new Attribute();
            attribute.setName(product.getName());
            attribute.setSize(r.getSize());
            attribute.setPrice(r.getPrice());
            attribute.setStock(r.getStock());
            attribute.setCache(AttributeConst.ATTRIBUTE_CACHE_INIT);
            attribute.setCreateDate(LocalDate.now());
            attribute.setModifyDate(LocalDate.now());
            attribute.setProduct(product);

            attributeService.save(attribute);
        }
        return product;
    }

    @Override
    public Product modify(ReqUpdateProductDto reqUpdateProductDto) {
        Optional<Product> optional = productRepo.findById(reqUpdateProductDto.getId());
        if(!optional.isPresent()){
            throw new AppException(ProductConst.PRODUCT_MSG_ERROR_NOT_EXIST);
        }
        Product product = optional.get();
        product.setName(reqUpdateProductDto.getName());
        product.setCode(reqUpdateProductDto.getCode());
        product.setDescription(reqUpdateProductDto.getDescription());
        /*Find brand and set for product*/
        Brand brand = brandService.getBrandById(reqUpdateProductDto.getBrandId());
        /*Find sale and set for product*/
        Sale sale = saleService.getSaleById(reqUpdateProductDto.getSaleId());
        product.setBrand(brand);
        product.setSale(sale);
        product.setModifyDate(LocalDate.now());
        List<ProductCategory> productCategories = productCategoryService.findByProduct(reqUpdateProductDto.getId());
        for(ProductCategory p: productCategories){
            productCategoryService.removeProductCategory(p);
        }
        Long[] categoryId = reqUpdateProductDto.getCategoryId();
        for(Long l: categoryId){
            Category category = categoryService.findById(l);
            ProductCategory productCategory = new ProductCategory();
            productCategory.setProduct(product);
            productCategory.setCategory(category);
            productCategoryService.create(productCategory);
        }
        ReqAttributeDto[] reqAttributeDtos = reqUpdateProductDto.getAttribute();
        for(ReqAttributeDto r: reqAttributeDtos){
            Attribute attribute = attributeService.getByProductIdAndSize(reqUpdateProductDto.getId(), r.getSize());
           if(attribute != null){
               attribute.setStock(r.getStock());
               attribute.setSize(r.getSize());
               attribute.setPrice(r.getPrice());
               attributeService.save(attribute);
           }else{
               attribute = new Attribute();
               attribute.setName(product.getName());
               attribute.setSize(r.getSize());
               attribute.setPrice(r.getPrice());
               attribute.setStock(r.getStock());
               attribute.setCache(AttributeConst.ATTRIBUTE_CACHE_INIT);
               attribute.setCreateDate(LocalDate.now());
               attribute.setModifyDate(LocalDate.now());
               attribute.setProduct(product);
               attributeService.save(attribute);
           }
        }
        /*Update images - chỉ thêm ảnh mới, không xóa ảnh cũ*/
        List<Image> oldImages = imageService.getImagesByProductId(product.getId());
        Set<String> oldImageLinks = oldImages.stream()
                .map(Image::getImageLink)
                .collect(Collectors.toSet());

        String[] imageUrl = reqUpdateProductDto.getImageUrl();
        for (int i = 0; i < imageUrl.length; i++) {
            String newImageLink = imageUrl[i];
            // Nếu ảnh chưa tồn tại thì thêm mới
            if (!oldImageLinks.contains(newImageLink)) {
                Image image = new Image();
                if (i == 0) {
                    image.setName(ProductConst.PRODUCT_MAIN_IMAGE);
                } else {
                    image.setName(ProductConst.PRODUCT_OTHER_IMAGE);
                }
                image.setImageLink(newImageLink);
                image.setCreateDate(LocalDate.now());
                image.setModifyDate(LocalDate.now());
                image.setIsActive(AppConst.CONST_ACTIVE);
                image.setProduct(product);
                imageService.createImage(image);
            }
        }

        return productRepo.save(product);
    }

    @Override
    public Page<ResponseProductDto> filterAllProducts(List<Long> category, List<Long> brand, Double min, Double max, Pageable pageable) {
        return productRepo.filterAllProducts(ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, Boolean.TRUE, category, brand, min, max, pageable);
    }

    @Override
    public Page<ResponseProductDto> relateProduct(Long id, Long brand, Pageable pageable) {
        return productRepo.relateProduct(ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, Boolean.TRUE, brand, id, pageable);
    }

    @Override
    public ResponseProductDto getProductDetail(Long id) {
        return productRepo.getProductDetail(ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, id);
    }

    // Service methods for most-viewed and best-selling products
    @Override
    public Page<ResponseProductDto> getMostViewedProducts(Pageable pageable) {
        Page<ResponseProductDto> resultPage = productRepo.getMostViewedProducts(ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, pageable);

        // Giới hạn tổng tối đa 10 sản phẩm
        long totalLimit = Math.min(resultPage.getTotalElements(), 10);

        // Nếu số sản phẩm của trang hiện tại vượt quá 10 thì chỉ lấy đến sản phẩm thứ 10
        List<ResponseProductDto> limitedList = resultPage.getContent().stream()
                .limit(10)
                .collect(Collectors.toList());

        return new PageImpl<>(limitedList, pageable, totalLimit);
    }

    @Override
    public Page<ResponseProductDto> getBestSellingProducts(Pageable pageable) {
        return productRepo.getBestSellingProducts(ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, pageable);
    }

    @Override
    public Page<ResponseProductDto> getNewestProducts(Pageable pageable) {
        Page<ResponseProductDto> resultPage = productRepo.getNewestProducts(
                ProductConst.PRODUCT_AVG_SIZE, ProductConst.PRODUCT_MAIN_IMAGE, pageable);

        long totalLimit = Math.min(resultPage.getTotalElements(), 10);
        List<ResponseProductDto> limitedList = resultPage.getContent().stream()
                .limit(10)
                .collect(Collectors.toList());

        return new PageImpl<>(limitedList, pageable, totalLimit);
    }

    @Override
    @Transactional
    public void deleteProductById(Long productId) {
//        imageRepo.deleteByProductId(id);
//        attributeRepo.deleteByProductId(id);
//        notificationRepo.deleteByProductId(id);
//        productCategoryRepo.deleteByProductId(id);
//
//        cartItemRepo.deleteByProductId(id);
//
//        // Sau khi xóa hết, mới được xóa Product
//        productRepo.deleteById(id);
        productRepo.deleteCartItemByProductId(productId);
        productRepo.deleteOrderDetailByProductId(productId);
        productRepo.deleteAttributeByProductId(productId);
        productRepo.deleteImageByProductId(productId);
        productRepo.deleteNotificationByProductId(productId);
        productRepo.deleteRatingByProductId(productId);
        productRepo.deleteCommentByProductId(productId);
        productRepo.deleteProductCategoryByProductId(productId);
        productRepo.deleteProductById(productId);

    }
}
