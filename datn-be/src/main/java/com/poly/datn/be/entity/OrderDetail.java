package com.poly.datn.be.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;

@Entity
@Table(name = "order_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    @Column(name = "origin_price", nullable = false)
    private Double originPrice;
    @Column(name = "sell_price", nullable = false)
    private Double sellPrice;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", updatable = true, insertable = true)
    private Order order;
    @ManyToOne
    @JoinColumn(name = "attribute_id")
    private Attribute attribute;
}
