package com.poly.datn.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Date;

@Entity
@Table(name = "account_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AccountDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "fullname", nullable = false, length = 50)
    private String fullname;
    @Column(name = "gender", nullable = false, length = 10)
    private String gender;
    @Column(name = "phone", nullable = false, length = 11)
    private String phone;
    @Column(name = "email", nullable = false, length = 50)
    private String email;
    @Column(name = "address", nullable = false, length = 265)
    private String address;
    @Column(name = "birthdate", nullable = false)
    private LocalDate birthDate;
    @OneToOne
    @JoinColumn(name = "account_id", unique = true)
    private Account account;
}
