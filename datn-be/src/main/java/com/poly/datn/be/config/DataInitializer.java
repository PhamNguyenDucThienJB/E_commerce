package com.poly.datn.be.config;

import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;
import com.poly.datn.be.entity.Role;
import com.poly.datn.be.entity.OrderStatus;
import com.poly.datn.be.repo.AccountRepo;
import com.poly.datn.be.service.AccountDetailService;
import com.poly.datn.be.service.RoleService;
import com.poly.datn.be.service.OrderStatusService;
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
    private OrderStatusService orderStatusService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("[DataInitializer] Running data initializer...");
        
        // Initialize Order Statuses first
        initializeOrderStatuses();
        
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

    private void initializeOrderStatuses() {
        System.out.println("[DataInitializer] Initializing Order Statuses...");
        
        // Define order statuses
        String[][] orderStatuses = {
            {"1", "Chờ xác nhận", "Đơn hàng đang chờ xác nhận từ người bán"},
            {"2", "Đã xác nhận", "Đơn hàng đã được xác nhận và đang chuẩn bị"},
            {"3", "Đang vận chuyển", "Đơn hàng đang được vận chuyển"},
            {"4", "Đã giao", "Đơn hàng đã được giao thành công"},
            {"5", "Đã hủy", "Đơn hàng đã bị hủy"},
            {"6", "Đã hoàn trả", "Đơn hàng đã được chấp nhận hoàn trả"},
            {"7", "Chờ xác nhận hoàn trả", "Đang chờ người bán xác nhận yêu cầu hoàn trả"},
            {"8", "Từ chối hoàn trả", "Yêu cầu hoàn trả đã bị từ chối"}
        };

        for (String[] statusData : orderStatuses) {
            Long statusId = Long.parseLong(statusData[0]);
            try {
                // Check if order status already exists
                OrderStatus existingStatus = orderStatusService.getById(statusId);
                if (existingStatus == null) {
                    // Create new order status
                    OrderStatus orderStatus = new OrderStatus();
                    orderStatus.setId(statusId);
                    orderStatus.setName(statusData[1]);
                    orderStatus.setDescription(statusData[2]);
                    orderStatus.setCreateDate(LocalDate.now());
                    orderStatus.setUpdateDate(LocalDate.now());
                    orderStatusService.save(orderStatus);
                    System.out.println("[DataInitializer] Created OrderStatus: " + statusData[1]);
                } else {
                    System.out.println("[DataInitializer] OrderStatus already exists: " + statusData[1]);
                }
            } catch (Exception e) {
                // If getById throws exception when not found, create new status
                OrderStatus orderStatus = new OrderStatus();
                orderStatus.setId(statusId);
                orderStatus.setName(statusData[1]);
                orderStatus.setDescription(statusData[2]);
                orderStatus.setCreateDate(LocalDate.now());
                orderStatus.setUpdateDate(LocalDate.now());
                try {
                    orderStatusService.save(orderStatus);
                    System.out.println("[DataInitializer] Created OrderStatus: " + statusData[1]);
                } catch (Exception ex) {
                    System.out.println("[DataInitializer] Could not create OrderStatus: " + statusData[1] + " - " + ex.getMessage());
                }
            }
        }
    }
} 