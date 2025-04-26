package com.poly.datn.be.entity;

import lombok.*;

import javax.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String content;
    private Boolean read;
    private Boolean deliver;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", updatable = true, insertable = true)
    private Order order;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", updatable = true, insertable = true)
    private Product product;
    private Integer type;
}
