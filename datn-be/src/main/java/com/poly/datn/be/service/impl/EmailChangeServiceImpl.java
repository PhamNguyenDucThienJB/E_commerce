package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.dto.ReqChangeEmailDto;
import com.poly.datn.be.domain.dto.ReqVerifyEmailOtpDto;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;
import com.poly.datn.be.entity.EmailChangeOtp;
import com.poly.datn.be.repo.AccountDetailRepo;
import com.poly.datn.be.repo.EmailChangeOtpRepo;
import com.poly.datn.be.service.EmailChangeService;
import com.poly.datn.be.util.MailUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class EmailChangeServiceImpl implements EmailChangeService {

    @Autowired
    private EmailChangeOtpRepo emailChangeOtpRepo;

    @Autowired
    private AccountDetailRepo accountDetailRepo;

    @Override
    @Transactional
    public String initiateEmailChange(Account account, ReqChangeEmailDto reqChangeEmailDto) {
        try {
            // Lấy email hiện tại từ AccountDetail
            AccountDetail accountDetail = accountDetailRepo.findAccountDetailByAccount_Id(account.getId());
            if (accountDetail == null) {
                return "Không tìm thấy thông tin tài khoản";
            }

            String currentEmail = accountDetail.getEmail();
            String newEmail = reqChangeEmailDto.getNewEmail();

            // Kiểm tra email mới có trùng với email hiện tại không
            if (currentEmail.equals(newEmail)) {
                return "Email mới phải khác với email hiện tại";
            }

            // Kiểm tra email mới đã được sử dụng chưa
            AccountDetail existingDetail = accountDetailRepo.findAccountDetailByEmail(newEmail);
            if (existingDetail != null) {
                return "Email này đã được sử dụng bởi tài khoản khác";
            }

            // Xóa các OTP cũ chưa sử dụng
            emailChangeOtpRepo.deleteUnusedOtpsByAccount(account);

            // Tạo OTP mới
            String oldEmailOtp = generateOTP();
            
            EmailChangeOtp emailChangeOtp = new EmailChangeOtp();
            emailChangeOtp.setAccount(account);
            emailChangeOtp.setOldEmail(currentEmail);
            emailChangeOtp.setNewEmail(newEmail);
            emailChangeOtp.setOldEmailOtp(oldEmailOtp);
            emailChangeOtp.setCreatedDate(LocalDateTime.now());
            emailChangeOtp.setExpireDate(LocalDateTime.now().plusMinutes(10));
            
            emailChangeOtpRepo.save(emailChangeOtp);

            // Gửi OTP tới email hiện tại
            MailUtil.sendEmailChangeOTP(currentEmail, oldEmailOtp, "old");

            return "OTP đã được gửi tới email hiện tại của bạn";

        } catch (Exception e) {
            e.printStackTrace();
            return "Có lỗi xảy ra khi gửi OTP: " + e.getMessage();
        }
    }

    @Override
    @Transactional
    public String verifyOldEmailOtp(Account account, ReqVerifyEmailOtpDto reqVerifyEmailOtpDto) {
        try {
            Optional<EmailChangeOtp> otpRecordOpt = emailChangeOtpRepo.findByAccountAndOldEmailOtpAndIsUsedFalse(account, reqVerifyEmailOtpDto.getOtp());
            
            if (!otpRecordOpt.isPresent()) {
                return "Mã OTP không hợp lệ";
            }

            EmailChangeOtp otpRecord = otpRecordOpt.get();

            // Kiểm tra hết hạn
            if (LocalDateTime.now().isAfter(otpRecord.getExpireDate())) {
                return "Mã OTP đã hết hạn";
            }

            // Đánh dấu email cũ đã xác thực
            otpRecord.setOldEmailVerified(true);
            
            // Tạo OTP cho email mới
            String newEmailOtp = generateOTP();
            otpRecord.setNewEmailOtp(newEmailOtp);
            
            emailChangeOtpRepo.save(otpRecord);

            // Gửi OTP tới email mới
            MailUtil.sendEmailChangeOTP(otpRecord.getNewEmail(), newEmailOtp, "new");

            return "Xác thực thành công! OTP đã được gửi tới email mới";

        } catch (Exception e) {
            e.printStackTrace();
            return "Có lỗi xảy ra: " + e.getMessage();
        }
    }

    @Override
    @Transactional
    public String verifyNewEmailOtp(Account account, ReqVerifyEmailOtpDto reqVerifyEmailOtpDto) {
        try {
            Optional<EmailChangeOtp> otpRecordOpt = emailChangeOtpRepo.findByAccountAndNewEmailOtpAndIsUsedFalse(account, reqVerifyEmailOtpDto.getOtp());
            
            if (!otpRecordOpt.isPresent()) {
                return "Mã OTP không hợp lệ";
            }

            EmailChangeOtp otpRecord = otpRecordOpt.get();

            // Kiểm tra hết hạn
            if (LocalDateTime.now().isAfter(otpRecord.getExpireDate())) {
                return "Mã OTP đã hết hạn";
            }

            // Kiểm tra email cũ đã được xác thực chưa
            if (!otpRecord.getOldEmailVerified()) {
                return "Bạn cần xác thực email hiện tại trước";
            }

            // Đánh dấu email mới đã xác thực
            otpRecord.setNewEmailVerified(true);
            emailChangeOtpRepo.save(otpRecord);

            return "Xác thực email mới thành công! Bạn có thể hoàn tất việc đổi email";

        } catch (Exception e) {
            e.printStackTrace();
            return "Có lỗi xảy ra: " + e.getMessage();
        }
    }

    @Override
    @Transactional
    public String completeEmailChange(Account account) {
        try {
            Optional<EmailChangeOtp> otpRecordOpt = emailChangeOtpRepo.findByAccountAndIsUsedFalse(account);
            
            if (!otpRecordOpt.isPresent()) {
                return "Không tìm thấy yêu cầu đổi email";
            }

            EmailChangeOtp otpRecord = otpRecordOpt.get();

            // Kiểm tra cả 2 email đã được xác thực
            if (!otpRecord.getOldEmailVerified() || !otpRecord.getNewEmailVerified()) {
                return "Bạn cần xác thực cả email hiện tại và email mới";
            }

            // Cập nhật email trong AccountDetail
            AccountDetail accountDetail = accountDetailRepo.findAccountDetailByAccount_Id(account.getId());
            accountDetail.setEmail(otpRecord.getNewEmail());
            accountDetailRepo.save(accountDetail);

            // Đánh dấu OTP đã sử dụng
            otpRecord.setIsUsed(true);
            emailChangeOtpRepo.save(otpRecord);

            return "Đổi email thành công!";

        } catch (Exception e) {
            e.printStackTrace();
            return "Có lỗi xảy ra: " + e.getMessage();
        }
    }

    private String generateOTP() {
        Random random = new Random();
        int otpNumber = 100000 + random.nextInt(900000); // 6 digits
        return String.valueOf(otpNumber);
    }
} 