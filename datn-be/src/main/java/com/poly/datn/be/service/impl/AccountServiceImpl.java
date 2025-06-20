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
import java.util.*;
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
            ReqUpdateAccountDetailDto detailDto = new ReqUpdateAccountDetailDto();
            detailDto.setId(ad.getId());
            detailDto.setFullname(reqUpdateAccountDto.getFullName());
            detailDto.setGender(reqUpdateAccountDto.getGender());
            detailDto.setPhone(reqUpdateAccountDto.getPhone());
            detailDto.setEmail(reqUpdateAccountDto.getEmail());
            detailDto.setAddress(reqUpdateAccountDto.getAddress());
            detailDto.setBirthDate(reqUpdateAccountDto.getBirthDate());
            this.accountDetailService.update(detailDto);
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
        // 1. Tìm account by Email
        Account account = this.accountRepo.findAccountByEmail(reqForgotPasswordDto.getEmail());
        if (account == null) {
            throw new AppException("Email không tồn tại");
        }

        // 2. Sinh mật khẩu mới (plain text)
        String newPasswordPlain = generateRandomPassword(8);

        // 3. Mã hóa mật khẩu
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String hashedPassword = passwordEncoder.encode(newPasswordPlain);

        // 4. Lưu mật khẩu đã mã hóa vào database
        account.setPassword(hashedPassword);
        this.accountRepo.save(account);

        // 5. Gửi mật khẩu chưa mã hóa qua email cho người dùng
        AccountDetail accountDetail = this.accountDetailService.findAccountDetail(account.getId());
        MailUtil.sendmailForgotPassword(accountDetail.getEmail(), newPasswordPlain);
    }

    // Hàm sinh mật khẩu ngẫu nhiên
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }

    @Override
    public AccountDetail update(ReqUpdateAccountDetailDto reqUpdateAccountDetailDto) {
        System.out.println("=== SITE UPDATE DEBUG ===");
        System.out.println("Input DTO ID: " + reqUpdateAccountDetailDto.getId());
        System.out.println("Input DTO birthDate: " + reqUpdateAccountDetailDto.getBirthDate());
        
        AccountDetail accountDetail = accountDetailService.findAccountDetail(reqUpdateAccountDetailDto.getId());
        System.out.println("Found AccountDetail ID: " + accountDetail.getId());
        System.out.println("Current birthDate in DB: " + accountDetail.getBirthDate());
        
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
        accountDetail.setBirthDate(reqUpdateAccountDetailDto.getBirthDate());
        
        System.out.println("About to save birthDate: " + accountDetail.getBirthDate());
        AccountDetail saved = accountDetailService.save(accountDetail);
        System.out.println("Saved birthDate: " + saved.getBirthDate());
        System.out.println("=== END SITE UPDATE DEBUG ===");
        
        return saved;
    }

    @Override
    public String findUsernameByEmail(String email) {
        AccountDetail detail = accountDetailService.findAccountDetailByEmail(email);
        return detail != null ? detail.getAccount().getUsername() : null;
    }

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
}
