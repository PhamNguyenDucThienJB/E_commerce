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
@Table(name = "sales")
@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id",  nullable = false)
    private Long id;
    @Column(name = "name",  nullable = false,length = 50)
    private String name;
    @Column(name = "description", nullable = false, length = 255)
    private String description;
    @Column(name = "create_date", nullable = false)
    private LocalDate createDate;
    @Column(name = "modify_date", nullable = false)
    private LocalDate modifyDate;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    @Column(name = "discount")
    private Integer discount;
    @OneToMany(mappedBy = "sale")
    @JsonIgnore
    private Collection<Product> products;
}
