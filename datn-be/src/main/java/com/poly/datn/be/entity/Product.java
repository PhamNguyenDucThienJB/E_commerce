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
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "name", nullable = false, length = 50)
    private String name;
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;
    @Column(name = "description", nullable = false, length = 1000)
    private String description;
    @Column(name = "create_date", nullable = false)
    private LocalDate createDate;
    @Column(name = "modify_date", nullable = false)
    private LocalDate modifyDate;
    @Column(name = "view", nullable = false)
    private Long view;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;
    @ManyToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;
    @OneToMany(mappedBy = "product")
    @JsonIgnore
    private Collection<ProductCategory> productCategories;
    @OneToMany(mappedBy = "product")
    private Collection<Image> images;
    @OneToMany(mappedBy = "product", fetch = FetchType.EAGER)
    private Collection<Attribute> attributes;
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @JsonIgnore
    private Collection<Notification> notifications;
}
