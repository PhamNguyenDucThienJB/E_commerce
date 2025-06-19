package com.poly.datn.be.api;

import com.poly.datn.be.domain.dto.ReqChangeEmailDto;
import com.poly.datn.be.domain.dto.ReqVerifyEmailOtpDto;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.repo.AccountRepo;
import com.poly.datn.be.service.EmailChangeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/site/email-change")
@CrossOrigin(origins = "*")
public class EmailChangeApi {

    @Autowired
    private EmailChangeService emailChangeService;

    @Autowired
    private AccountRepo accountRepo;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateEmailChange(@Valid @RequestBody ReqChangeEmailDto reqChangeEmailDto, Principal principal) {
        try {
            Account account = accountRepo.findAccountByUsername(principal.getName());
            if (account == null) {
                return ResponseEntity.badRequest().body(createResponse("error", "Không tìm thấy tài khoản"));
            }

            String result = emailChangeService.initiateEmailChange(account, reqChangeEmailDto);
            
            if (result.contains("OTP đã được gửi")) {
                return ResponseEntity.ok(createResponse("success", result));
            } else {
                return ResponseEntity.badRequest().body(createResponse("error", result));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createResponse("error", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-old-email")
    public ResponseEntity<?> verifyOldEmailOtp(@Valid @RequestBody ReqVerifyEmailOtpDto reqVerifyEmailOtpDto, Principal principal) {
        try {
            Account account = accountRepo.findAccountByUsername(principal.getName());
            if (account == null) {
                return ResponseEntity.badRequest().body(createResponse("error", "Không tìm thấy tài khoản"));
            }

            String result = emailChangeService.verifyOldEmailOtp(account, reqVerifyEmailOtpDto);
            
            if (result.contains("Xác thực thành công")) {
                return ResponseEntity.ok(createResponse("success", result));
            } else {
                return ResponseEntity.badRequest().body(createResponse("error", result));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createResponse("error", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-new-email")
    public ResponseEntity<?> verifyNewEmailOtp(@Valid @RequestBody ReqVerifyEmailOtpDto reqVerifyEmailOtpDto, Principal principal) {
        try {
            Account account = accountRepo.findAccountByUsername(principal.getName());
            if (account == null) {
                return ResponseEntity.badRequest().body(createResponse("error", "Không tìm thấy tài khoản"));
            }

            String result = emailChangeService.verifyNewEmailOtp(account, reqVerifyEmailOtpDto);
            
            if (result.contains("Xác thực email mới thành công")) {
                return ResponseEntity.ok(createResponse("success", result));
            } else {
                return ResponseEntity.badRequest().body(createResponse("error", result));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createResponse("error", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeEmailChange(Principal principal) {
        try {
            Account account = accountRepo.findAccountByUsername(principal.getName());
            if (account == null) {
                return ResponseEntity.badRequest().body(createResponse("error", "Không tìm thấy tài khoản"));
            }

            String result = emailChangeService.completeEmailChange(account);
            
            if (result.contains("Đổi email thành công")) {
                return ResponseEntity.ok(createResponse("success", result));
            } else {
                return ResponseEntity.badRequest().body(createResponse("error", result));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(createResponse("error", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    private Map<String, String> createResponse(String status, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("status", status);
        response.put("message", message);
        return response;
    }
} 