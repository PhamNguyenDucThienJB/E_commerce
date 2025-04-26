package com.poly.datn.be.scheduledtasks;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.entity.Attribute;
import com.poly.datn.be.entity.Notification;
import com.poly.datn.be.entity.Product;
import com.poly.datn.be.entity.Voucher;
import com.poly.datn.be.service.AttributeService;
import com.poly.datn.be.service.NotificationService;
import com.poly.datn.be.service.ProductService;
import com.poly.datn.be.service.VoucherService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Component
@Slf4j
public class ScheduledTasks {
    @Autowired
    VoucherService voucherService;

    @Autowired
    ProductService productService;

    @Autowired
    NotificationService notificationService;

    @Autowired
    AttributeService attributeService;

    @Scheduled(cron = "59 59 23 ? * * ")
    public void scanVoucher(){
        List<Voucher> vouchers = voucherService.findAll();
        for(Voucher v: vouchers){
            if(v.getExpireDate().isBefore(LocalDate.now())){
                v.setIsActive(AppConst.CONST_IN_ACTIVE);
                voucherService.saveVoucher(v);
            }
        }
    }

    @Scheduled(cron = "0 40 13 ? * * ")
    public void scanProduct(){
        List<Product> products = productService.findAll();
        for(Product p: products){
            Collection<Attribute> attributes = p.getAttributes();
            for(Attribute a: attributes){
                Notification notification = null;
                if(a.getStock() <= 1){
                    notification = new Notification();
                    notification.setRead(false);
                    notification.setDeliver(false);
                    notification.setType(3);
                    notification.setContent(String.format("Sản phẩm %s size %d sắp hết, kiểm tra ngay nào", a.getName(), a.getSize()));
                    notification.setProduct(p);
                    notificationService.createNotification(notification);
                }
            }
        }
    }
}
