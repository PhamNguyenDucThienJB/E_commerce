package com.poly.datn.be.scheduledtasks;
import com.poly.datn.be.service.impl.AccountServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OtpCleanupTasks {
    @Autowired
    private AccountServiceImpl accountService;

//    @Scheduled(fixedRate = 60000) // 60 giây chạy 1 lần
//    public void cleanupExpiredOtps() {
//        accountService.cleanupExpiredOtps();
//    }
}
