package com.poly.datn.be.domain.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@ToString
public class AppException extends RuntimeException{
    private String message;

    public AppException(String message) {
       this.message = message;
    }
}
