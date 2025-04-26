package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.BrandConst;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Brand;
import com.poly.datn.be.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Optional;

@RestController
@CrossOrigin("*")
public class BrandApi {
    @Autowired
    BrandService brandService;

    @GetMapping(BrandConst.API_BRAND_GET_ALL)
    public ResponseEntity<?> getAllBrandPagination(@RequestParam("page") Optional<Integer> page,
                                                                    @RequestParam("size")Optional<Integer> size){
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(9), Sort.Direction.DESC,"modifyDate");


        return new ResponseEntity<>(brandService.getBrands(pageable), HttpStatus.OK);
    }

    @GetMapping(BrandConst.API_BRAND_GET_BY_ID)
    public ResponseEntity<?> getBrandById(@PathVariable("id")Long id){
        return new ResponseEntity<>(brandService.getBrandById(id), HttpStatus.OK);
    }

    @PostMapping(BrandConst.API_BRAND_CREATE)
    public ResponseEntity<Brand> save(@Valid @RequestBody Brand brand){
        if(brandService.existsByName(brand.getName())){
            throw new AppException(BrandConst.MSG_ERROR_CODE_DUPLICATE_BRAND);
        }
        return new ResponseEntity<>(brandService.saveBrand(brand),HttpStatus.CREATED);
    }
    @PostMapping(BrandConst.API_UPDATE_UPDATE)
    public ResponseEntity<Brand> update(@Valid @RequestBody Brand b) throws AppException {
        return new ResponseEntity<>(brandService.update(b),HttpStatus.OK);
    }
    @GetMapping(BrandConst.API_BRAND_REMOVE)
    public ResponseEntity<String> remove(@PathVariable("id") Optional<Long> id) throws AppException{
        brandService.delete(id.orElse(null));
        return new ResponseEntity<>("Succesfully!" , HttpStatus.OK);
    }
}
