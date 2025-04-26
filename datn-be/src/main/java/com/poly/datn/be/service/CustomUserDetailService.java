package com.poly.datn.be.service;

import com.poly.datn.be.domain.constant.AccountConst;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.domain.model.CustomUserDetails;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.repo.AccountRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailService implements UserDetailsService {
    @Autowired
    private AccountRepo accountRepo;

    @Override
    public UserDetails loadUserByUsername(String username){
        Account account = accountRepo.findAccountByUsername(username);
        if(account == null){
            throw new UsernameNotFoundException(username);
        }
        if(!account.getIsActive()){
            throw new AppException(AccountConst.ACCOUNT_MSG_ERROR_LOCK);
        }
        return new CustomUserDetails(account);
    }
}
