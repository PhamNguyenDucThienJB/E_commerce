package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.OrderStatusConst;
import com.poly.datn.be.service.OrderStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin("*")
public class OrderStatusApi {
    @Autowired
    OrderStatusService orderStatusService;

    @GetMapping(OrderStatusConst.API_ORDER_STATUS_GET_ALL)
    public ResponseEntity<?> getAllOrderStatus(){
        return new ResponseEntity<>(orderStatusService.getAllOrderStatus(), HttpStatus.OK);
    }
}
