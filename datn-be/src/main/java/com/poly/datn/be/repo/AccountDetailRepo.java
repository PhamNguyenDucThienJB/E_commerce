package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.Date;

@Repository
public interface AccountDetailRepo extends JpaRepository<AccountDetail, Long> {
    AccountDetail findAccountDetailByAccount_Id(Long id);

    @Transactional
    @Modifying
    @Query("update AccountDetail a set a.fullname = ?1, a.gender = ?2, a.phone = ?3, " +
            "a.email = ?4, a.address = ?5, a.birthDate = ?6 where a.account.id = ?7")
    void update(String fullname, String gender, String phone, String email, String address, LocalDate birthDate, Long id);

    AccountDetail findAccountDetailByEmail(String email);
}
