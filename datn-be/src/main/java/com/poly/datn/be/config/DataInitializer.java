package com.poly.datn.be.config;

import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;
import com.poly.datn.be.entity.Role;
import com.poly.datn.be.repo.AccountRepo;
import com.poly.datn.be.service.AccountDetailService;
import com.poly.datn.be.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private AccountRepo accountRepo;

    @Autowired
    private AccountDetailService accountDetailService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("[DataInitializer] Running data initializer...");
        // Retrieve admin role
        Role adminRole = roleService.findById(1L);
        // Check existing account with username 'admin'
        Account existing = accountRepo.findAccountByUsername("admin");
        if (existing == null) {
            System.out.println("[DataInitializer] No 'admin' user; creating new admin...");
            Account admin = new Account();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setCreateDate(LocalDate.now());
            admin.setModifyDate(LocalDate.now());
            admin.setIsActive(true);
            admin.setRole(adminRole);
            admin = accountRepo.save(admin);
            AccountDetail detail = new AccountDetail();
            detail.setFullname("Administrator");
            detail.setGender("Other");
            detail.setPhone("0123456789");
            detail.setEmail("admin@example.com");
            detail.setAddress("Admin Address");
            detail.setBirthDate(LocalDate.of(1990, 1, 1));
            detail.setAccount(admin);
            accountDetailService.save(detail);
            System.out.println("[DataInitializer] Default admin created: username=admin, password=Admin@123");
        } else if (!existing.getRole().getId().equals(adminRole.getId())) {
            System.out.println("[DataInitializer] 'admin' user found with wrong role; updating to admin...");
            existing.setRole(adminRole);
            existing.setPassword(passwordEncoder.encode("Admin@123"));
            existing.setModifyDate(LocalDate.now());
            existing.setIsActive(true);
            accountRepo.save(existing);
            AccountDetail detail = accountDetailService.findAccountDetail(existing.getId());
            if (detail != null) {
                detail.setFullname("Administrator");
                detail.setGender("Other");
                detail.setPhone("0123456789");
                detail.setEmail("admin@example.com");
                detail.setAddress("Admin Address");
                detail.setBirthDate(LocalDate.of(1990, 1, 1));
                accountDetailService.save(detail);
            } else {
                detail = new AccountDetail();
                detail.setFullname("Administrator");
                detail.setGender("Other");
                detail.setPhone("0123456789");
                detail.setEmail("admin@example.com");
                detail.setAddress("Admin Address");
                detail.setBirthDate(LocalDate.of(1990, 1, 1));
                detail.setAccount(existing);
                accountDetailService.save(detail);
            }
            System.out.println("[DataInitializer] Updated existing user to admin: username=admin, password=Admin@123");
        } else {
            System.out.println("[DataInitializer] 'admin' user with admin role exists; skipping.");
        }
    }
} 