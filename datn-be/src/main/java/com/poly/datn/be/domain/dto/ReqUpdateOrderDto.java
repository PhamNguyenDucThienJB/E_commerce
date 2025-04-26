package com.poly.datn.be.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReqUpdateOrderDto {
    @NotEmpty(message = "Không để trống địa chỉ.")
    private String address;
    @NotEmpty(message = "Không để trống email.")
    private String email;
    @NotEmpty(message = "Không để trống họ tên.")
    private String fullname;
    @NotNull(message = "Không để trống trạng thái thanh toán.")
    private Boolean isPending;
    private String note;
    @NotNull(message = "Không để trống mã đơn hàng.")
    private Long orderId;
    @NotEmpty(message = "Không để trống số điện thoại.")
    private String phone;
}
