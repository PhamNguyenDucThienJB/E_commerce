package com.poly.datn.be.service;

import com.poly.datn.be.domain.dto.ReqChangeEmailDto;
import com.poly.datn.be.domain.dto.ReqVerifyEmailOtpDto;
import com.poly.datn.be.entity.Account;

public interface EmailChangeService {
    String initiateEmailChange(Account account, ReqChangeEmailDto reqChangeEmailDto);
    String verifyOldEmailOtp(Account account, ReqVerifyEmailOtpDto reqVerifyEmailOtpDto);
    String verifyNewEmailOtp(Account account, ReqVerifyEmailOtpDto reqVerifyEmailOtpDto);
    String completeEmailChange(Account account);
} 