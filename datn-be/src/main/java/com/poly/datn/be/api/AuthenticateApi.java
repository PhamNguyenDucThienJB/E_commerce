package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.AccountConst;
import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.RoleConst;
import com.poly.datn.be.domain.dto.ReqForgotPasswordDto;
import com.poly.datn.be.domain.dto.SocialLoginRequest;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.domain.model.CustomUserDetails;
import com.poly.datn.be.domain.payload.LoginRequest;
import com.poly.datn.be.domain.payload.LoginResponse;
import com.poly.datn.be.entity.Role;
import com.poly.datn.be.jwt.JwtTokenProvider;
import com.poly.datn.be.service.AccountService;
import com.poly.datn.be.service.SocialLoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
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

    @Autowired
    private SocialLoginService socialLoginService;

    @PostMapping("/api/site/login")
    public LoginResponse authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Login request received: " + loginRequest);
            String username;
            
            // Simplified login logic - directly use email and ignore validation
            if (loginRequest.getEmail() != null) {
                // Just try to authenticate directly with email as username
                try {
                    Authentication authentication = authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
                    );
                    
                    if (loginRequest.getAdmin() != null && loginRequest.getAdmin()) {
                        if(authentication.getAuthorities().toArray()[0].toString().equals(RoleConst.ROLE_CUSTOMER)) {
                            throw new AppException(AccountConst.ACCOUNT_MSG_ERROR_ACCESS_DENIED);
                        }
                    }
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    String jwt = tokenProvider.generateToken((CustomUserDetails) authentication.getPrincipal());
                    return new LoginResponse(jwt);
                } catch (Exception e) {
                    // If direct authentication fails, try to find username by email
                    username = accountService.findUsernameByEmail(loginRequest.getEmail());
                    if (username == null) {
                        throw new AppException("Email không tồn tại hoặc chưa được xác minh!");
                    }
                }
            } else if (loginRequest.getUsername() != null) {
                username = loginRequest.getUsername();
            } else {
                throw new AppException("Vui lòng cung cấp tên đăng nhập hoặc email!");
            }

            // Authenticate with username
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword())
            );
            
            if(loginRequest.getAdmin() != null && loginRequest.getAdmin()){
                if(authentication.getAuthorities().toArray()[0].toString().equals(RoleConst.ROLE_CUSTOMER)){
                    throw new AppException(AccountConst.ACCOUNT_MSG_ERROR_ACCESS_DENIED);
                }
            }
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken((CustomUserDetails) authentication.getPrincipal());
            return new LoginResponse(jwt);
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
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

    @PostMapping("/api/site/oauth2/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody SocialLoginRequest request) {
        try {
            String token = socialLoginService.authenticateWithGoogle(request.getToken());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            throw new AppException("Lỗi đăng nhập từ Google: " + e.getMessage());
        }
    }

    @PostMapping("/api/site/auth/facebook")
    public ResponseEntity<?> authenticateWithFacebook(@RequestBody SocialLoginRequest request) {
        try {
            String token = socialLoginService.authenticateWithFacebook(request.getAccessToken());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            throw new AppException("Lỗi đăng nhập từ Facebook: " + e.getMessage());
        }
    }
}
