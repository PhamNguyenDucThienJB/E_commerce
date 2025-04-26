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
@Table(name = "order_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OrderStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "name", length = 50, nullable = false)
    private String name;
    @Column(name = "description", length = 255, nullable = false)
    private String description;
    @Column(name = "create_date", nullable = false)
    private LocalDate createDate;
    @Column(name = "update_date", nullable = false)
    private LocalDate updateDate;
    @OneToMany(mappedBy = "orderStatus")
    @JsonIgnore
    private Collection<Order> orders;
}
