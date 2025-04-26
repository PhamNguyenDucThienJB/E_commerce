package com.poly.datn.be.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "image_link", nullable = false, length = 255)
    private String imageLink;
    @Column(name = "create_date", nullable = false)
    private LocalDate createDate;
    @Column(name = "modify_date", nullable = false)
    private LocalDate modifyDate;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;
}
