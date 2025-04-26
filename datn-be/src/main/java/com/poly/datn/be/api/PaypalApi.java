package com.poly.datn.be.api;

import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.PaypalPaymentIntent;
import com.poly.datn.be.domain.constant.PaypalPaymentMethod;
import com.poly.datn.be.domain.dto.ReqOrderDto;
import com.poly.datn.be.service.OrderService;
import com.poly.datn.be.service.impl.PaypalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.poly.datn.be.util.PaypalUtil;

import javax.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin("*")
public class PaypalApi {
    public static final String URL_PAYPAL_SUCCESS = "/api/site/pay/success";
    public static final String URL_PAYPAL_CANCEL = "/api/site/pay/cancel";
    private Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    HttpServletRequest request;
    @Autowired
    PaypalService paypalService;
    @Autowired
    OrderService orderService;

    @PostMapping("/api/site/payment")
    public ResponseEntity<?> payment(@RequestBody ReqOrderDto reqOrderDto) {
        String successUrl = PaypalUtil.getBaseUrl(request)  + URL_PAYPAL_SUCCESS;
        String cancelUrl = PaypalUtil.getBaseUrl(request)  + URL_PAYPAL_CANCEL;

        try {
            Payment payment = paypalService.createPayment(
                    reqOrderDto.getTotal(),
                    "USD",
                    PaypalPaymentMethod.paypal,
                    PaypalPaymentIntent.sale,
                    "Thanh toán qua Paypal",
                    cancelUrl,
                    successUrl
            );
            for (Links links : payment.getLinks()) {
                if (links.getRel().equals("approval_url")) {
                    return new ResponseEntity<>(links.getHref(), HttpStatus.OK);
                }
            }
        } catch (PayPalRESTException e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>("Error", HttpStatus.BAD_REQUEST);
    }

    @GetMapping(URL_PAYPAL_CANCEL)
    public ResponseEntity<?> cancel() {
        return new ResponseEntity<>(AppConst.MSG_FAIL_COMMON, HttpStatus.BAD_REQUEST);
    }

    @GetMapping(URL_PAYPAL_SUCCESS)
    public ResponseEntity<?> success(@RequestParam("paymentId") String paymentId,
                                     @RequestParam("PayerID") String payerId) {
        try {
            Payment payment = paypalService.executePayment(paymentId, payerId);
            if (payment.getState().equals("approved")) {
                return new ResponseEntity<>(AppConst.MSG_SUCCESS_COMMON, HttpStatus.OK);
            }
        } catch (PayPalRESTException e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(AppConst.MSG_FAIL_COMMON, HttpStatus.BAD_REQUEST);
    }

}



