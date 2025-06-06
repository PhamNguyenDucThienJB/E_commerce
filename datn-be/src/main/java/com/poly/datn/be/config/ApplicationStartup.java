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
        filesStorageService.init();
        System.out.println("File storage service initialized");
        
        // Ensure uploads directory exists
        try {
            Path uploadsDir = Paths.get("uploads");
            if (!Files.exists(uploadsDir)) {
                Files.createDirectory(uploadsDir);
                System.out.println("Created uploads directory");
            }
        } catch (IOException e) {
            System.err.println("Failed to create uploads directory: " + e.getMessage());
        }
    }
} 