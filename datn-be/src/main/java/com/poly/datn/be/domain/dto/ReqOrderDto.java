package com.poly.datn.be.domain.dto;

import com.poly.datn.be.entity.OrderDetail;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.Collection;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ReqOrderDto {
    @NotEmpty(message = "Không để trống họ tên.")
    private String fullname;
    @NotEmpty(message = "Không để trống số điện thoại.")
    private String phone;
    @NotEmpty(message = "Không để trống địa chỉ.")
    private String address;
    private String note;
    @NotNull(message = "Không để trống tổng tiền.")
    @Min(value = 0, message = "Tổng tiền lớn hơn 0.")
    private Double total;
    @NotEmpty(message = "Không để trống email.")
    private String email;
    @NotNull(message = "Không để trống trạng thái thanh toán.")
    private Boolean isPending;
    @NotNull(message = "Không để trống mã tài khoản.")
    private Long accountId;
    @NotEmpty(message = "Không để trống chi tiết đơn hàng.")
    private Collection<OrderDetail> orderDetails;
    private String code;
    private String payment;
}
