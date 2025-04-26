package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.AccountConst;
import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.RoleConst;
import com.poly.datn.be.domain.dto.ReqForgotPasswordDto;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.domain.model.CustomUserDetails;
import com.poly.datn.be.domain.payload.LoginRequest;
import com.poly.datn.be.domain.payload.LoginResponse;
import com.poly.datn.be.entity.Role;
import com.poly.datn.be.jwt.JwtTokenProvider;
import com.poly.datn.be.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import javax.validation.Valid;

@RestController
public class AuthenticateApi {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtTokenProvider tokenProvider;

    @Autowired
    AccountService accountService;

    @PostMapping("/api/site/login")
    public LoginResponse authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Xác thực từ username và password.
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            if(loginRequest.getAdmin()){
                if(authentication.getAuthorities().toArray()[0].toString().equals(RoleConst.ROLE_CUSTOMER)){
                    throw new AppException(AccountConst.ACCOUNT_MSG_ERROR_ACCESS_DENIED);
                }
            }
            // Nếu không xảy ra exception tức là thông tin hợp lệ
            // Set thông tin authentication vào Security Context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Trả về jwt cho người dùng.
            String jwt = tokenProvider.generateToken((CustomUserDetails) authentication.getPrincipal());
            return new LoginResponse(jwt);
        } catch (Exception e) {
            throw new AppException(AccountConst.ACCOUNT_MSG_ERROR_SIGN_IN);
        }
    }

    @GetMapping(AccountConst.API_ACCOUNT_FIND_ME)
    public ResponseEntity<?> getUser(@RequestParam("token") String token) {
        if(tokenProvider.validateToken(token)){
            String username = tokenProvider.getUsernameFromJWT(token);
            return new ResponseEntity<>(accountService.findByUsername(username), HttpStatus.OK);
        }
        return null;
    }
    @PostMapping(AccountConst.API_ACCOUNT_FORGOT_PASSWORD)
    public ResponseEntity<?> forgotPassword(@RequestBody ReqForgotPasswordDto reqForgotPasswordDto) throws MessagingException {
        accountService.forgotPassword(reqForgotPasswordDto);
        return new ResponseEntity<>("Mật khẩu mới đã được gửi về mail!", HttpStatus.OK);
    }
}
