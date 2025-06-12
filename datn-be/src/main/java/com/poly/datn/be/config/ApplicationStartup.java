package com.poly.datn.be.config;

import com.poly.datn.be.service.FilesStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class ApplicationStartup implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private FilesStorageService filesStorageService;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("Initializing file storage service...");
        try {
            filesStorageService.init();
            System.out.println("File storage service initialized");
        } catch (Exception e) {
            System.err.println("Error initializing file storage service: " + e.getMessage());
        }
        
        // Không cần tạo thư mục uploads lần nữa vì đã được xử lý trong filesStorageService.init()
    }
} 