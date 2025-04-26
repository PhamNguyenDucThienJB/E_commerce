package com.poly.datn.be.repo;

import com.poly.datn.be.domain.dto.RespAccountDto;
import com.poly.datn.be.entity.Account;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface AccountRepo extends JpaRepository<Account, Long> {

    @Query("SELECT distinct new com.poly.datn.be.domain.dto.RespAccountDto( a.id, a.username, a.createDate, a.modifyDate, a.isActive , r.name," +
            " ad.fullname, ad.gender, ad.phone, ad.email, ad.address, ad.birthDate ) FROM Account a " +
            "inner join AccountDetail ad on a.id = ad.account.id " +
            "inner join Role r on a.role.id = r.id")
    List<RespAccountDto> findAllSecond(Pageable pageable);

    @Query("SELECT new com.poly.datn.be.domain.dto.RespAccountDto(a.id, a.username, a.createDate, a.modifyDate, a.isActive , r.name," +
            " ad.fullname, ad.gender, ad.phone, ad.email, ad.address, ad.birthDate) FROM Account a " +
            "inner join AccountDetail ad on a.id = ad.account.id " +
            "inner join Role r on a.role.id = r.id where a.id = ?1")
    RespAccountDto findByIdSecond(Long id);

    @Query("SELECT new com.poly.datn.be.domain.dto.RespAccountDto(a.id, a.username, a.createDate, a.modifyDate, a.isActive , r.name," +
            " ad.fullname, ad.gender, ad.phone, ad.email, ad.address, ad.birthDate) FROM Account a " +
            "inner join AccountDetail ad on a.id = ad.account.id " +
            "inner join Role r on a.role.id = r.id where a.username = ?1")
    RespAccountDto findByUsername(String username);

    @Transactional
    @Modifying
    @Query("update Account a set a.isActive = ?1 where a.id = ?2")
    void deleteOrRestore(Boolean isActive, Long id);

    @Query("SELECT a.id, a.username, a.createDate, a.modifyDate, a.isActive , r.name," +
            " ad.fullname, ad.gender, ad.phone, ad.email, ad.address, ad.birthDate FROM Account a " +
            "inner join AccountDetail ad on a.id = ad.account.id " +
            "inner join Role r on a.role.id = r.id where a.isActive = ?1")
    List<Object[]> findAccountByIsActiveOrInactive(Boolean isActive, Pageable pageable);

    Account findAccountByUsername(String username);

    @Query("SELECT new com.poly.datn.be.domain.dto.RespAccountDto( a.id, a.username, a.createDate, a.modifyDate, a.isActive , r.name," +
            " ad.fullname, ad.gender, ad.phone, ad.email, ad.address, ad.birthDate ) FROM Account a " +
            "inner join AccountDetail ad on a.id = ad.account.id " +
            "inner join Role r on a.role.id = r.id where a.role.name = ?1")
    List<RespAccountDto> findAccountByRoleName(String name, Pageable pageable);

}
