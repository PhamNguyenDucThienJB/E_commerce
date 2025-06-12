package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.service.FilesStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
public class FilesStorageServiceImpl implements FilesStorageService {
    @Autowired
    ServletContext app;

    private final Path root = Paths.get(System.getProperty("user.dir"), "uploads");

    @Override
    public void init() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectory(root);
                System.out.println("Created uploads directory successfully: " + root.toAbsolutePath());
            } else {
                System.out.println("Uploads directory already exists: " + root.toAbsolutePath());
            }
            
            // Kiểm tra quyền ghi
            File uploadsDir = root.toFile();
            if (!uploadsDir.canWrite()) {
                System.err.println("WARNING: No write permission to uploads directory: " + root.toAbsolutePath());
                // Thử set quyền ghi
                if (!uploadsDir.setWritable(true)) {
                    System.err.println("CRITICAL: Could not set write permission to uploads directory");
                } else {
                    System.out.println("Successfully set write permission to uploads directory");
                }
            } else {
                System.out.println("Write permission verified for uploads directory");
            }
        } catch (IOException e) {
            System.err.println("Error creating uploads directory: " + e.getMessage());
            throw new RuntimeException("Could not initialize folder for upload!", e);
        }
    }

    @Override
    public void save(MultipartFile file) {
        try {
            // Đảm bảo thư mục tồn tại
            if (!Files.exists(root)) {
                Files.createDirectory(root);
            }
            
            Path targetPath = this.root.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), targetPath);
            System.out.println("Saved file: " + targetPath.toAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error saving file: " + e.getMessage());
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage(), e);
        }
    }

    @Override
    public List<String> upload(MultipartFile[] files) {
        List<String> filenames = new ArrayList<>();
        
        // Đảm bảo thư mục tồn tại
        try {
            if (!Files.exists(root)) {
                Files.createDirectory(root);
                System.out.println("Created uploads directory during file upload");
            }
        } catch (IOException e) {
            System.err.println("Error creating directory during upload: " + e.getMessage());
            throw new AppException("Could not create upload directory: " + e.getMessage());
        }
        
        for (MultipartFile file : files) {
            Path p = this.root.resolve(file.getOriginalFilename());
            try {
                file.transferTo(p);
                filenames.add(file.getOriginalFilename());
                System.out.println("Uploaded file: " + p.toAbsolutePath());
            } catch (Exception e) {
                System.err.println("Error uploading file " + file.getOriginalFilename() + ": " + e.getMessage());
                throw new AppException("Error uploading file " + file.getOriginalFilename() + ": " + e.getMessage());
            }
        }
        return filenames;
    }

    private Path getPath(String folder, String filename) {
        File dir = Paths.get(app.getRealPath("/"), folder).toFile();
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return Paths.get(dir.getAbsolutePath(), filename);
    }

    @Override
    public Resource load(String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(root.toFile());
    }

    @Override
    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.root, 1).filter(path -> !path.equals(this.root)).map(this.root::relativize);
        } catch (IOException e) {
            throw new RuntimeException("Could not load the files!");
        }
    }

}
