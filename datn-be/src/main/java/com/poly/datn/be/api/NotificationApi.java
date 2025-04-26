package com.poly.datn.be.api;

import com.poly.datn.be.domain.constant.NotificationConst;
import com.poly.datn.be.entity.Notification;
import com.poly.datn.be.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class NotificationApi {
    @Autowired
    NotificationService notificationService;

    @GetMapping(NotificationConst.API_NOTIFICATION_LOAD_UNREAD)
    public ResponseEntity<?> loadNotification(){
        return new ResponseEntity<>(notificationService.loadNotification(false, true), HttpStatus.OK);
    }

    @GetMapping(NotificationConst.API_NOTIFICATION_READ)
    public ResponseEntity<?> readNotification(@RequestParam("id") Long id){
        return new ResponseEntity<>(notificationService.modifyNotification(id), HttpStatus.OK);
    }
    @GetMapping(NotificationConst.API_NOTIFICATION_PUSH)
    public ResponseEntity<?> pushNotification(){
        List<Notification> notifications = notificationService.loadNotification(false, false);
        for (Notification n: notifications){
            n.setDeliver(true);
            notificationService.updateNotification(n);
        }
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }
}
