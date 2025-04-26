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
@Table(name = "Attribute")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Attribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "name", nullable = true, length = 50)
    private String name;
    @Column(name = "size", nullable = false)
    private Integer size;
    @Column(name = "price", nullable = false)
    private Double price;
    @Column(name = "stock", nullable = false)
    private Integer stock;
    @Column(name = "cache", nullable = false)
    private Integer cache;
    @Column(name = "create_date", nullable = false)
    private LocalDate createDate;
    @Column(name = "modify_date", nullable = false)
    private LocalDate modifyDate;
    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;
    @OneToMany(mappedBy = "attribute")
    @JsonIgnore
    private Collection<OrderDetail> orderDetails;
    @OneToMany(mappedBy = "attribute")
    @JsonIgnore
    private Collection<CartItem> cartItems;
}
