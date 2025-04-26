package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.SaleConst;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Sale;
import com.poly.datn.be.service.SaleService;
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
public class SaleApi {
    @Autowired
    SaleService saleService;

//    @GetMapping(VoucherConst.API_VOUCHER_GET_BY_CODE)
//    public ResponseEntity getVoucherByCode(@RequestParam("code") String code){
//        return new ResponseEntity(voucherService.getVoucherByCode(code), HttpStatus.OK);
//    }
    @PostMapping(SaleConst.API_SALE_CREATE)
    public ResponseEntity<Sale> save(@Valid @RequestBody Sale sale){
        return new ResponseEntity<>(saleService.saveSale(sale),HttpStatus.CREATED);
    }
    @PostMapping(SaleConst.API_SALE_UPDATE)
    public ResponseEntity<Sale> update(@Valid @RequestBody Sale sale) throws AppException {
        return new ResponseEntity<>(saleService.updateSale(sale),HttpStatus.OK);
    }
    @GetMapping(SaleConst.API_SALE_REMOVE)
    public ResponseEntity<String> remove(@PathVariable("id") Optional<Long> id) throws AppException{
        saleService.delete(id.orElse(null));
        return new ResponseEntity<>("Xoá thành công!" , HttpStatus.OK);
    }
    @GetMapping(SaleConst.API_SALE_GET_ALL)
    public ResponseEntity<?> getAllVoucher(@RequestParam("page") Optional<Integer> page,
                                           @RequestParam("size") Optional<Integer> size){
        Pageable pageable = PageRequest.of(page.orElse(1)-1, size.orElse(9), Sort.Direction.DESC,"modifyDate");
        return new ResponseEntity<>(saleService.getToTalPage(pageable),HttpStatus.OK);
    }
    @GetMapping(SaleConst.API_SALE_GET_BY_ID)
    public ResponseEntity<?> getSaleById(@PathVariable("id") Long id){
        return new ResponseEntity<>(saleService.getSaleById(id),HttpStatus.OK);
    }
}
