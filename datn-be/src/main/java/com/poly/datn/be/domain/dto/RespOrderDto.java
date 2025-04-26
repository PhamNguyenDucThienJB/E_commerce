package com.poly.datn.be.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.OrderDetail;
import com.poly.datn.be.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.Column;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.sql.Date;
import java.time.LocalDate;
import java.util.Collection;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class RespOrderDto {
    private Long id;
    private String fullname;
    private String phone;
    private String address;
    private Double total;
    private String note;
    private Date shipDate;
    private LocalDate createDate;
    private Boolean isPending;
    private Account account;
    private OrderStatus orderStatus;
}
