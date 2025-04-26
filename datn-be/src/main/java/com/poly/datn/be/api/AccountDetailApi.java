package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.AccountConst;
import com.poly.datn.be.domain.dto.ReqUpdateAccountDetailDto;
import com.poly.datn.be.service.AccountDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
public class AccountDetailApi {
    @Autowired
    AccountDetailService accountDetailService;

    @GetMapping(AccountConst.API_ACCOUNT_DETAIL_GET_BY_ACCOUNT_ID)
    public ResponseEntity<?> getAccountDetailByAccountId(@RequestParam("id") Long id){
        return new ResponseEntity<>(accountDetailService.findAccountDetail(id), HttpStatus.OK);
    }

    @PostMapping(AccountConst.API_ACCOUNT_DETAIL_UPDATE)
    public ResponseEntity<?> updateAccountDetail(@RequestBody ReqUpdateAccountDetailDto reqUpdateAccountDetailDto){
        return new ResponseEntity<>(accountDetailService.update(reqUpdateAccountDetailDto), HttpStatus.OK);
    }
}
