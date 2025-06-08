package com.poly.datn.be.domain.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.http.HttpStatus;

@Data
@NoArgsConstructor
@ToString
public class AppException extends RuntimeException{
    private String message;
    private HttpStatus status;

    public AppException(String message) {
       this.message = message;
       this.status = HttpStatus.BAD_REQUEST;
    }
    
    public AppException(String message, HttpStatus status) {
       this.message = message;
       this.status = status;
    }
}
