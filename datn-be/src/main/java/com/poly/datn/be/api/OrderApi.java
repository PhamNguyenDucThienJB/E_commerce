package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.OrderConst;
import com.poly.datn.be.domain.dto.ReqCancelOrder;
import com.poly.datn.be.domain.dto.ReqOrderDto;
import com.poly.datn.be.domain.dto.ReqUpdateOrderDto;
import com.poly.datn.be.domain.dto.ReqUpdateStatusOrder;
import com.poly.datn.be.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Optional;

@RestController
@CrossOrigin("*")
public class OrderApi {
    @Autowired
    OrderService orderService;

    @GetMapping(OrderConst.API_ORDER_GET_ALL_BY_ACCOUNT)
    public ResponseEntity<?> getOrders(@RequestParam("id")Long id,
                                       @RequestParam("status") Optional<Long> status,
                                       @RequestParam("page")Optional<Integer> page,
                                       @RequestParam("size")Optional<Integer> size){
        Sort sort = Sort.by(Sort.Direction.DESC,"modifyDate");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8),sort);
        return new ResponseEntity<>(orderService.findOrderByAccountIdAndOrderStatusId(id, status.orElse(0L), pageable), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_PAGE_ORDER)
    public ResponseEntity<?> getPageOrders(@RequestParam("id")Long id,
                                       @RequestParam("page")Optional<Integer> page,
                                       @RequestParam("size")Optional<Integer> size){
        Sort sort = Sort.by(Sort.Direction.DESC,"modifyDate");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8),sort);
        return new ResponseEntity<>(orderService.findOrderByAccount_Id(id, pageable), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_PAGE_ORDER_BY_YEAR_AND_MONTH)
    public ResponseEntity<?> getOrderByOrderStatusAndYearAndMonth(@RequestParam("id")Long id,
                                           @RequestParam("year") Integer year,
                                           @RequestParam("month") Integer month,
                                           @RequestParam("page")Optional<Integer> page,
                                           @RequestParam("size")Optional<Integer> size){
        Sort sort = Sort.by(Sort.Direction.DESC,"modifyDate");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8),sort);
        return new ResponseEntity<>(orderService.findOrderByOrderStatusAndYearAndMonth(id, year, month, pageable), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_PAGE_ORDER_BETWEEN_DATE)
    public ResponseEntity<?> findOrderBetweenDate(@RequestParam("id")Long id,
                                                                  @RequestParam("from") String from,
                                                                  @RequestParam("to") String to,
                                                                  @RequestParam("page")Optional<Integer> page,
                                                                  @RequestParam("size")Optional<Integer> size){
        Sort sort = Sort.by(Sort.Direction.DESC,"modifyDate");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8),sort);
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDate fromDate = LocalDate.parse(from, dtf);
        LocalDate toDate = LocalDate.parse(to, dtf);
        return new ResponseEntity<>(orderService.findOrderBetweenDate(id, fromDate, toDate, pageable), HttpStatus.OK);
    }
    @PostMapping(OrderConst.API_ORDER_CANCEL)
    public ResponseEntity<?> cancelOrder(@RequestBody ReqCancelOrder reqCancelOrder){
        return new ResponseEntity<>(orderService.cancelOrder(reqCancelOrder), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_UPDATE_STATUS)
    public ResponseEntity<?> updateOrderWithStatus(@RequestParam("id")Long orderId,
                                       @RequestParam("status") Long statusId){
        return new ResponseEntity<>(orderService.updateOrderWithStatus(orderId, statusId), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_GET_ALL_AND_PAGINATION)
    public ResponseEntity<?> getOrdersAndPagination(@RequestParam("page") Optional<Integer> page,
                                                    @RequestParam("size") Optional<Integer> size,
                                                    @RequestParam("status") Optional<Long> status){
        Sort sort = Sort.by(Sort.Direction.DESC, "modifyDate");
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8),sort);
        return new ResponseEntity<>(orderService.getAllOrdersAndPagination(status.orElse(0L), pageable), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_GET_BY_ID)
    public ResponseEntity<?> getOrderById(@RequestParam("id")Long id){
        return new ResponseEntity<>(orderService.getByOrderId(id), HttpStatus.OK);
    }
    @PostMapping(OrderConst.API_ORDER_CREATE)
    public ResponseEntity<?> createOrder(@Valid @RequestBody ReqOrderDto reqOrderDto){
        return new ResponseEntity<>(orderService.createOrder(reqOrderDto), HttpStatus.OK);
    }
    @PostMapping(OrderConst.API_ORDER_UPDATE)
    public ResponseEntity<?> updateOrder(@Valid @RequestBody ReqUpdateOrderDto reqUpdateOrderDto){
        return new ResponseEntity<>(orderService.updateOrder(reqUpdateOrderDto), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_DETAIL_GET_BY_ID)
    public ResponseEntity<?> getOrderDetailByOrderId(@RequestParam("id")Long id){
        return new ResponseEntity<>(orderService.getAllByOrderId(id), HttpStatus.OK);
    }

    @GetMapping(OrderConst.API_ORDER_PAGE_REPORT_PRODUCT)
    public ResponseEntity<?> reportByProduct(@RequestParam("page") Optional<Integer> page,
                                             @RequestParam("size") Optional<Integer> size){
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8));
        return new ResponseEntity<>(orderService.reportByProduct(pageable), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_PAGE_ORDER_BY_PRODUCT)
    public ResponseEntity<?> getOrderByProduct(@RequestParam("id") Long id,
                                               @RequestParam("page") Optional<Integer> page,
                                             @RequestParam("size") Optional<Integer> size){
        Pageable pageable = PageRequest.of(page.orElse(1) - 1, size.orElse(8), Sort.Direction.DESC, "modifyDate");
        return new ResponseEntity<>(orderService.findOrderByProduct(id, pageable), HttpStatus.OK);
    }

    @GetMapping(OrderConst.API_ORDER_LIST_AMOUNT_YEAR)
    public ResponseEntity<?> reportAmountYear(){
        return new ResponseEntity<>(orderService.reportAmountYear(), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_LIST_AMOUNT_MONTH)
    public ResponseEntity<?> reportAmountMonth(@RequestParam("year") Integer year){
        return new ResponseEntity<>(orderService.reportAmountMonth(year), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_BASE64)
    public ResponseEntity<?> encode(@RequestParam("encodedUrl") String encodedUrl){
        return new ResponseEntity<>(new String(Base64.getUrlDecoder().decode(encodedUrl)), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_COUNT)
    public ResponseEntity<?> countOrder(){
        return new ResponseEntity<>(orderService.countOrder(), HttpStatus.OK);
    }
    @GetMapping(OrderConst.API_ORDER_COUNT_BY_NAME)
    public ResponseEntity<?> countOrderByName(){
        return new ResponseEntity<>(orderService.countOrderByName(), HttpStatus.OK);
    }
    @PostMapping(OrderConst.API_PROCESS_ORDER)
    public ResponseEntity<?> processOrder(@RequestBody ReqUpdateStatusOrder reqUpdateStatusOrder){
        return new ResponseEntity<>(orderService.processOrder(reqUpdateStatusOrder), HttpStatus.OK);
    }
    @PostMapping(OrderConst.API_SHIP_ORDER)
    public ResponseEntity<?> shipOrder(@RequestBody ReqUpdateStatusOrder reqUpdateStatusOrder){
        return new ResponseEntity<>(orderService.shipOrder(reqUpdateStatusOrder), HttpStatus.OK);
    }
    @PostMapping(OrderConst.API_SUCCESS_ORDER)
    public ResponseEntity<?> successOrder(@RequestBody ReqUpdateStatusOrder reqUpdateStatusOrder){
        return new ResponseEntity<>(orderService.successOrder(reqUpdateStatusOrder), HttpStatus.OK);
    }
    @PostMapping(OrderConst.API_CANCEL_ORDER)
    public ResponseEntity<?> cancelOrder(@RequestBody ReqUpdateStatusOrder reqUpdateStatusOrder){
        return new ResponseEntity<>(orderService.cancelOrder(reqUpdateStatusOrder), HttpStatus.OK);
    }
}
