package com.poly.datn.be.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.poly.datn.be.domain.constant.RoleConst;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;
import com.poly.datn.be.entity.Role;
import com.poly.datn.be.jwt.JwtTokenProvider;
import com.poly.datn.be.repo.AccountDetailRepo;
import com.poly.datn.be.repo.AccountRepo;
import com.poly.datn.be.repo.RoleRepo;
import com.poly.datn.be.service.SocialLoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.UUID;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SocialLoginServiceImpl implements SocialLoginService {

    private static final Logger log = LoggerFactory.getLogger(SocialLoginServiceImpl.class);

    @Autowired
    private AccountRepo accountRepo;
    
    @Autowired
    private AccountDetailRepo accountDetailRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RetryTemplate retryTemplate;

    @Autowired
    private WebClient oauth2WebClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String authenticateWithGoogle(String idToken) throws Exception {
        try {
            return retryTemplate.execute(context -> {
                // Xác thực token với Google API
                String googleUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
                String response = oauth2WebClient.get()
                        .uri(googleUrl)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofSeconds(30))
                        .retry(3)
                        .block();

                // Parse response
                JsonNode root = objectMapper.readTree(response);
                String email = root.get("email").asText();
                String name = root.has("name") ? root.get("name").asText() : "";

                // Tìm hoặc tạo tài khoản cho người dùng
                Account account = findOrCreateAccount(email, name);

                // Tạo JWT token cho người dùng
                return jwtTokenProvider.generateToken(account.getUsername());
            });
        } catch (Exception e) {
            log.error("Error during Google authentication: ", e);
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage());
        }
    }

    @Override
    public String authenticateWithFacebook(String accessToken) throws Exception {
        // Lấy thông tin người dùng từ Facebook API
        String facebookUrl = "https://graph.facebook.com/me?fields=email,name&access_token=" + accessToken;
        String response = oauth2WebClient.get()
                .uri(facebookUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Parse response
        JsonNode root = objectMapper.readTree(response);
        String email = root.has("email") ? root.get("email").asText() : "";
        String name = root.has("name") ? root.get("name").asText() : "";

        // Nếu không lấy được email, tạo một email giả dựa trên ID Facebook
        if (email.isEmpty() && root.has("id")) {
            String facebookId = root.get("id").asText();
            email = facebookId + "@facebook.com";
        }

        // Tìm hoặc tạo tài khoản cho người dùng
        Account account = findOrCreateAccount(email, name);

        // Tạo JWT token cho người dùng
        return jwtTokenProvider.generateToken(account.getUsername());
    }

    private Account findOrCreateAccount(String email, String name) {
        // Tìm AccountDetail bằng email
        AccountDetail accountDetail = accountDetailRepo.findAccountDetailByEmail(email);
        if (accountDetail != null) {
            // Cập nhật tên hiển thị nếu thay đổi từ social login
            if (name != null && !name.isEmpty() && !name.equals(accountDetail.getFullname())) {
                accountDetail.setFullname(name);
                accountDetailRepo.save(accountDetail);
            }
            return accountDetail.getAccount();
        }

        // Tạo tài khoản mới
        Account newAccount = new Account();
        // Đảm bảo username là duy nhất
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        
        while (accountRepo.findAccountByUsername(username) != null) {
            username = baseUsername + counter++;
        }
        
        newAccount.setUsername(username);
        newAccount.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newAccount.setCreateDate(LocalDate.now());
        newAccount.setModifyDate(LocalDate.now());
        newAccount.setIsActive(true);
        
        // Gán vai trò khách hàng
        Role role = roleRepo.findRoleByName(RoleConst.ROLE_CUSTOMER);
        if (role != null) {
            newAccount.setRole(role);
        }
        
        // Lưu Account trước
        Account savedAccount = accountRepo.save(newAccount);
        
        // Tạo và lưu AccountDetail
        AccountDetail newAccountDetail = new AccountDetail();
        newAccountDetail.setFullname(name);
        newAccountDetail.setEmail(email);
        newAccountDetail.setAccount(savedAccount);
        // Các giá trị mặc định cho các trường bắt buộc
        newAccountDetail.setGender("Nam");
        newAccountDetail.setPhone("Không có");
        newAccountDetail.setAddress("Không có");
        newAccountDetail.setBirthDate(LocalDate.now());
        
        accountDetailRepo.save(newAccountDetail);
        
        return savedAccount;
    }
} 