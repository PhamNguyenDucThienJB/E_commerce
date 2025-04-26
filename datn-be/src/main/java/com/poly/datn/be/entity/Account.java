package com.poly.datn.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.Collection;

@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;
    @Column(name = "password",nullable = false, length = 255)
    private String password;
    @Column(name = "create_date", nullable = false)
    private LocalDate createDate;
    @Column(name = "modify_date", nullable = false)
    private LocalDate modifyDate;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
    @OneToMany(mappedBy = "account")
    @JsonIgnore
    private Collection<Order> orders;
    @OneToMany(mappedBy = "account")
    @JsonIgnore
    private Collection<CartItem> cartItems;
}
