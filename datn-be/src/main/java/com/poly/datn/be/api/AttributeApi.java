package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.AttributeConst;
import com.poly.datn.be.domain.dto.ReqCacheAttributeDto;
import com.poly.datn.be.service.AttributeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("*")
public class AttributeApi {
    @Autowired
    AttributeService attributeService;

    @GetMapping(AttributeConst.API_ATTRIBUTE_GET_BY_PRODUCT_ID)
    public ResponseEntity<?> cacheAttribute(@RequestParam("id") Long id,
                                            @RequestParam("size") Optional<Integer> size) {
        return new ResponseEntity<>(attributeService.getByProductIdAndSize(id, size.orElse(39)), HttpStatus.OK);
    }
    @GetMapping(AttributeConst.API_ATTRIBUTE_GET_BY_ID)
    public ResponseEntity<?> getAttribute(@RequestParam("id") Long id) {
        return new ResponseEntity<>(attributeService.findById(id), HttpStatus.OK);
    }
    @GetMapping(AttributeConst.API_ATTRIBUTE_GET_ALL)
    public ResponseEntity<?> getAll() {
        return new ResponseEntity<>(attributeService.findAll(), HttpStatus.OK);
    }
    @GetMapping(AttributeConst.API_ATTRIBUTE_IS_VALID)
    public ResponseEntity<?> isValid(@RequestParam("id") Long id, @RequestParam("quantity") Integer quantity) {
        return new ResponseEntity<>(attributeService.isValidCart(id, quantity), HttpStatus.OK);
    }
}
