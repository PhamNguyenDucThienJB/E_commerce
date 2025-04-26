package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.AccountConst;
import com.poly.datn.be.domain.dto.ReqCreateAccountDto;
import com.poly.datn.be.domain.dto.ReqRegisterAccountDto;
import com.poly.datn.be.domain.dto.ReqUpdateAccountDto;
import com.poly.datn.be.domain.dto.RespAccountDto;
import com.poly.datn.be.service.AccountDetailService;
import com.poly.datn.be.service.AccountService;
import com.poly.datn.be.util.ConvertUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
public class AccountApi {
    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountDetailService accountDetailService;


    @GetMapping(AccountConst.API_ACCOUNT_FIND_ALL)
    public ResponseEntity<?> findAll(@RequestParam("page") Optional<Integer> page,
                                     @RequestParam("size") Optional<Integer> size) {
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(9), Sort.Direction.DESC, "modifyDate");
        return new ResponseEntity<>(this.accountService.findAllSecond(pageable), HttpStatus.OK);
    }

    @GetMapping(AccountConst.API_ACCOUNT_FIND_BY_ID)
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return new ResponseEntity<>(this.accountService.findByIdSecond(id), HttpStatus.OK);
    }

    @GetMapping(AccountConst.API_ACCOUNT_FIND_BY_USERNAME)
    public ResponseEntity<?> findByUsername(@RequestParam("username") String username) {
        return new ResponseEntity<>(this.accountService.findByUsername(username), HttpStatus.OK);
    }

    @GetMapping(AccountConst.API_ACCOUNT_FIND_ALL_BY_IS_ACTIVE_OR_INACTIVE)
    public ResponseEntity<?> findAccountByIsActiveOrInactive(@PathVariable("isActive") Boolean isActive,
                                                             @RequestParam("page") Optional<Integer> page,
                                                             @RequestParam("size") Optional<Integer> size
    ) {
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(9));
        List<Object[]> objects = this.accountService.findAccountByIsActiveOrInactive(isActive, pageable);
        List<RespAccountDto> respAccountDtos = objects.stream().map(item -> ConvertUtil.accountToRespAccountDto(item))
                .sorted((o1, o2) -> o1.getId() > o2.getId() ? -1 : 1)
                .collect(Collectors.toList());
        return new ResponseEntity<>(respAccountDtos, HttpStatus.OK);
    }


    @PostMapping(AccountConst.API_ACCOUNT_CREATE)
    public ResponseEntity<?> create(@RequestBody @Valid ReqCreateAccountDto reqCreateAccountDto) {
        return new ResponseEntity<>(this.accountService.save(reqCreateAccountDto), HttpStatus.OK);
    }


    @PostMapping(AccountConst.API_ACCOUNT_UPDATE)
    public ResponseEntity<?> update(@RequestBody @Valid ReqUpdateAccountDto reqUpdateAccountDto) {
        return new ResponseEntity<>(this.accountService.update(reqUpdateAccountDto), HttpStatus.OK);
    }

    @GetMapping(AccountConst.API_ACCOUNT_TOTAL_PAGE)
    public ResponseEntity<?> getTotalPage() {
        return new ResponseEntity<>(this.accountService.getToTalPage(), HttpStatus.OK);
    }

    @GetMapping(value = AccountConst.API_ACCOUNT_GET_BY_ROLE_NAME, params = "roleName")
    public ResponseEntity<?> getAccountByRoleName(@RequestParam("roleName") String roleName,
                                                  @RequestParam("page") Optional<Integer> page,
                                                  @RequestParam("size") Optional<Integer> size
                                                  ){
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(9), Sort.Direction.DESC, "modifyDate");
        return new ResponseEntity<>(this.accountService.findAccountByRoleName(roleName, pageable), HttpStatus.OK);
    }

    @PostMapping(AccountConst.API_ACCOUNT_REGISTER)
    public ResponseEntity<?> register(@RequestBody @Valid ReqRegisterAccountDto reqRegisterAccountDto){
        return new ResponseEntity<>(this.accountService.register(reqRegisterAccountDto), HttpStatus.OK);
    }

    @GetMapping(AccountConst.API_ACCOUNT_COUNT)
    public ResponseEntity<?> countAccount(){
        return new ResponseEntity<>(accountService.countAccount(), HttpStatus.OK);
    }

}
