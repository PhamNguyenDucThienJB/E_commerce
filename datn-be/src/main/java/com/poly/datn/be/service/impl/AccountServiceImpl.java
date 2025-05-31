package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.constant.AccountConst;
import com.poly.datn.be.domain.dto.*;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.domain.model.OtpEntry;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;
import com.poly.datn.be.entity.Role;
import com.poly.datn.be.entity.VerificationToken;
import com.poly.datn.be.repo.AccountRepo;
import com.poly.datn.be.repo.VerificationTokenRepository;
import com.poly.datn.be.service.AccountDetailService;
import com.poly.datn.be.service.AccountService;
import com.poly.datn.be.service.RoleService;
import com.poly.datn.be.util.ConvertUtil;
import com.poly.datn.be.util.MailUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AccountServiceImpl implements AccountService {
    @Autowired
    AccountRepo accountRepo;
    @Autowired
    AccountDetailService accountDetailService;
    @Autowired
    RoleService roleService;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Override
    public Account findById(Long id) {
        Optional<Account> optionalAccount = accountRepo.findById(id);
        if(!optionalAccount.isPresent()){
            throw new AppException(AccountConst.ACCOUNT_MSG_ERROR_NOT_EXIST);
        }
        return optionalAccount.get();
    }

    @Override
    public List<RespAccountDto> findAllSecond(Pageable pageable) {
        return this.accountRepo.findAllSecond(pageable);
    }

    @Override
    public RespAccountDto findByIdSecond(Long id) {
        return this.accountRepo.findByIdSecond(id);
    }

    @Override
    public RespAccountDto findByUsername(String username) {
        return this.accountRepo.findByUsername(username);
    }

    @Override
    public void deleteOrRestore(Boolean isActive, Long id) {
        this.accountRepo.deleteOrRestore(isActive, id);
    }

    @Override
    public List<Object[]> findAccountByIsActiveOrInactive(Boolean isActive, Pageable pageable) {
        return this.accountRepo.findAccountByIsActiveOrInactive(isActive, pageable);
    }

    @Transactional
    @Modifying
    @Override
    public Account update(ReqUpdateAccountDto reqUpdateAccountDto) {
        Optional<Account> optionalAccount = this.accountRepo.findById(reqUpdateAccountDto.getId());
        if (!optionalAccount.isPresent()) {
            throw new AppException("Tài khoản không tồn tại");
        }else {
            Account account = optionalAccount.get();
            AccountDetail ad = this.accountDetailService.findAccountDetail(account.getId());
            if(account.getRole().getId() == 1){
                if(!reqUpdateAccountDto.getIsActive()){
                    throw new AppException("Không thể dừng hoạt động tài khoản Admin");
                }
                if(reqUpdateAccountDto.getRoleId() != 1){
                    throw new AppException("Không thể thực hiện thao tác này");
                }
            }else{
                if(reqUpdateAccountDto.getRoleId() == 1){
                    throw new AppException("Không thể thực hiện thao tác này");
                }
            }
            if (
                    !reqUpdateAccountDto.getEmail().equals(ad.getEmail())
                            && this.accountDetailService.findAccountDetailByEmail(reqUpdateAccountDto.getEmail()) != null
            ) {
                throw new AppException("Email đã tồn tại");
            }
            account = ConvertUtil.ReqUpdateAccountDtoToAccount(account, reqUpdateAccountDto);
            account = this.accountRepo.save(account);
            AccountDetail accountDetail = ConvertUtil.ReqAccountDtoToAccountDetail(reqUpdateAccountDto);
            this.accountDetailService.update(accountDetail);
            return account;
        }
    }

    @Transactional
    @Modifying
    @Override
    public Account save(ReqCreateAccountDto reqCreateAccountDto) {
        if (this.accountRepo.findAccountByUsername(reqCreateAccountDto.getUsername()) != null) {
            throw new AppException("Username đã tồn tại");
        }
        if (this.accountDetailService.findAccountDetailByEmail(reqCreateAccountDto.getEmail()) != null){
            throw new AppException("Email đã tồn tại");
        }
        Account account = ConvertUtil.ReqCreateAccountDtoToAccount(reqCreateAccountDto);
        account.setId(this.accountRepo.save(account).getId());
        AccountDetail accountDetail = ConvertUtil.ReqAccountDtoToAccountDetail(reqCreateAccountDto);
        accountDetail.setAccount(account);
        this.accountDetailService.save(accountDetail);
        return account;
    }

    @Override
    public Account findAccountByUsername(String username) {
        return this.accountRepo.findAccountByUsername(username);
    }

    @Override
    public Integer getToTalPage() {
        return this.accountRepo.findAll(PageRequest.of(0, 9)).getTotalPages();
    }

    @Override
    public List<RespAccountDto> findAccountByRoleName(String roleName, Pageable pageable) {
        return this.accountRepo.findAccountByRoleName(roleName, pageable);
    }

//    @Transactional
//    @Modifying
//    @Override
//    public RespAccountDto register(ReqRegisterAccountDto reqRegisterAccountDto) {
//        if (this.accountRepo.findAccountByUsername(reqRegisterAccountDto.getUsername()) != null) {
//            throw new AppException("Username đã tồn tại");
//        }
//        if (this.accountDetailService.findAccountDetailByEmail(reqRegisterAccountDto.getEmail()) != null){
//            throw new AppException("Email đã tồn tại");
//        }
//
//        Account account = ConvertUtil.ReqCreateAccountDtoToAccount(reqRegisterAccountDto);
//        account.setPassword(passwordEncoder.encode(account.getPassword()));
//
//        Role role = roleService.findById(3L);
//        account.setRole(role);
//
//        account.setIsActive(false); // Tài khoản chưa active ban đầu
//        account = this.accountRepo.save(account);
//
//        AccountDetail accountDetail = ConvertUtil.ReqAccountDtoToAccountDetail(reqRegisterAccountDto);
//        accountDetail.setAccount(account);
//        accountDetail = this.accountDetailService.save(accountDetail);
//
//        // Tạo token xác minh và gửi email
//        createVerificationToken(account, reqRegisterAccountDto.getEmail());
//
//        RespAccountDto respAccountDto = ConvertUtil.accountToRespAccountDto(account, accountDetail);
//        return respAccountDto;
//    }
        @Transactional
        @Modifying
        @Override
        public RespAccountDto register(ReqRegisterAccountDto reqRegisterAccountDto) {
            if (this.accountRepo.findAccountByUsername(reqRegisterAccountDto.getUsername()) != null) {
                throw new AppException("Username đã tồn tại");
            }

            if (this.accountDetailService.findAccountDetailByEmail(reqRegisterAccountDto.getEmail()) != null) {
                throw new AppException("Email đã tồn tại");
            }

            // ✅ Kiểm tra xác minh email
            Optional<VerificationToken> tokenOpt = verificationTokenRepository
                    .findByPreEmailAndIsClickTrue(reqRegisterAccountDto.getEmail());

            VerificationToken token = tokenOpt.orElseThrow(() -> new AppException("Email chưa được xác minh"));



            Account account = ConvertUtil.ReqCreateAccountDtoToAccount(reqRegisterAccountDto);
            account.setPassword(passwordEncoder.encode(account.getPassword()));
            Role role = roleService.findById(3L);
            account.setRole(role);
            account = this.accountRepo.save(account);

            AccountDetail accountDetail = ConvertUtil.ReqAccountDtoToAccountDetail(reqRegisterAccountDto);
            accountDetail.setAccount(account);
            accountDetail = this.accountDetailService.save(accountDetail);

            RespAccountDto respAccountDto = ConvertUtil.accountToRespAccountDto(account, accountDetail);
            return respAccountDto;
        }

    @Override
    public Integer countAccount() {
        return accountRepo.findAll().size();
    }

//    @Override
//    public void changePassword(ReqChangePasswordDto reqChangePasswordDto) {
//        Account account = this.accountRepo.findAccountByUsername(reqChangePasswordDto.getUsername());
//        if (account == null){
//            throw new AppException("Tài khoản không tồn tại");
//        }
//        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
//        if (!passwordEncoder.matches(account.getPassword(), reqChangePasswordDto.getPassword())) {
//            throw new AppException("Password cũ không đúng!");
//        } else if (!reqChangePasswordDto.getNewPassword().equals(reqChangePasswordDto.getNewPasswordSecond())) {
//            throw new AppException("Password mới không giống nhau");
//        }else {
//            account.setPassword(passwordEncoder.encode(reqChangePasswordDto.getNewPassword().trim()));
//            this.accountRepo.save(account);
//        }
//    }
        @Override
        @Transactional
        public void createVerificationToken(String email) {
            // Xóa token cũ (nếu có)
            tokenRepository.deleteByPreEmail(email);

            String token = UUID.randomUUID().toString();
            VerificationToken verificationToken = new VerificationToken();
            verificationToken.setToken(token);
            verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
            verificationToken.setPreEmail(email);

            tokenRepository.save(verificationToken);



            try {
                MailUtil.sendVerificationEmail(email, token);
            } catch (MessagingException e) {
                throw new AppException("Lỗi gửi email: " + e.getMessage());
            }
        }



    @Transactional
    @Override
    public void forgotPassword(ReqForgotPasswordDto reqForgotPasswordDto) throws MessagingException {
        Account account = this.accountRepo.findAccountByUsername(reqForgotPasswordDto.getUsername());
        if (account == null){
            throw new AppException("Username không tồn tại");
        }else {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String newPassword = String.valueOf(UUID.randomUUID());
            account.setPassword(passwordEncoder.encode(newPassword));
            this.accountRepo.save(account);
            //gửi mail
            AccountDetail accountDetail = this.accountDetailService.findAccountDetail(account.getId());
            MailUtil.sendmailForgotPassword(accountDetail.getEmail(), newPassword);
        }
    }

    @Override
    public AccountDetail update(ReqUpdateAccountDetailDto reqUpdateAccountDetailDto) {
        AccountDetail accountDetail = accountDetailService.findAccountDetail(reqUpdateAccountDetailDto.getId());
        if(!accountDetail.getEmail().equals(reqUpdateAccountDetailDto.getEmail())){
            if (this.accountDetailService.findAccountDetailByEmail(reqUpdateAccountDetailDto.getEmail()) != null){
                throw new AppException("Email đã tồn tại");
            }
        }
        accountDetail.setFullname(reqUpdateAccountDetailDto.getFullname());
        accountDetail.setPhone(reqUpdateAccountDetailDto.getPhone());
        accountDetail.setEmail(reqUpdateAccountDetailDto.getEmail());
        accountDetail.setAddress(reqUpdateAccountDetailDto.getAddress());
        accountDetail.setGender(reqUpdateAccountDetailDto.getGender());
        return accountDetailService.save(accountDetail);
    }

    @Override
    public String findUsernameByEmail(String email) {
        AccountDetail detail = accountDetailService.findAccountDetailByEmail(email);
        return detail != null ? detail.getAccount().getUsername() : null;
    }


    //    public void sendOtpToEmail(String email) throws MessagingException {
//        // Tạo mã OTP 6 số ngẫu nhiên
//        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
//
//        // Đặt thời gian hết hạn OTP (ví dụ 5 phút)
//        LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(5);
//
//        // Lưu OTP vào Map
//        otpStorage.put(email, new OtpEntry(otp, expiredAt));
//
//        // Gửi OTP qua email
//        MailUtil.sendOtpEmail(email, otp);
        //    }
@Transactional
public void verifyTokenAndReturnEmail(String token) {
    VerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new AppException("Token không hợp lệ hoặc đã hết hạn"));

    if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
        tokenRepository.delete(verificationToken);
        throw new AppException("Token đã hết hạn");
    }

    if (verificationToken.isClick()) {
        throw new AppException("Token đã được xác minh trước đó");
    }

    verificationToken.setClick(true);
    tokenRepository.save(verificationToken);

    System.out.println("✅ Token đã xác minh thành công cho email: " + verificationToken.getPreEmail());
}


//    @Override
//    public Account verifyEmailToken(String token) {
//        VerificationToken verificationToken = tokenRepository.findByToken(token)
//                .orElseThrow(() -> new AppException("Token không hợp lệ hoặc đã hết hạn"));
//
//        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
//            tokenRepository.delete(verificationToken);
//            throw new AppException("Token đã hết hạn");
//        }
//
//        Account account = verificationToken;
//
//        // KHÔNG setActive tại đây nữa
//        // => Trả về account (hoặc ID) để frontend cho phép tiếp tục bước nhập mật khẩu
//
//        tokenRepository.delete(verificationToken); // Vẫn xóa token sau khi xác minh
//
//        return account;
//    }
}

//    public void cleanupExpiredOtps() {
//        otpStorage.entrySet().removeIf(entry -> entry.getValue().isExpired());
//    }
//}
