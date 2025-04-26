package com.poly.datn.be.service;

import com.poly.datn.be.domain.dto.ReqUpdateAccountDetailDto;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;

public interface AccountDetailService {
    AccountDetail findAccountDetail(Long id);

    AccountDetail save(AccountDetail accountDetail);
    AccountDetail update(ReqUpdateAccountDetailDto reqUpdateAccountDetailDto);
    void update(AccountDetail accountDetail);

    AccountDetail findAccountDetailByEmail(String email);
}
