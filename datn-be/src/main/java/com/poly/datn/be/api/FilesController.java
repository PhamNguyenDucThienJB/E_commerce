package com.poly.datn.be.api;

import com.poly.datn.be.domain.model.FileInfo;
import com.poly.datn.be.domain.model.ResponseMessage;
import com.poly.datn.be.service.FilesStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
public class FilesController {

  @Autowired
  FilesStorageService storageService;

  @PostMapping("/api/site/upload")
  public ResponseEntity<ResponseMessage> uploadFiles(@RequestParam("file") MultipartFile[] files) {
    String message = "";
    try {
      List<String> fileNames = new ArrayList<>();

      Arrays.asList(files).stream().forEach(file -> {
        storageService.save(file);
        fileNames.add(file.getOriginalFilename());
      });

      message = "Uploaded the files successfully: " + fileNames;
      return ResponseEntity.status(HttpStatus.OK).body(new ResponseMessage(message));
    } catch (Exception e) {
      message = "Fail to upload files!";
      return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
    }
  }

  @PostMapping("/api/site/upload-image")
  public ResponseEntity<?> upload(@RequestParam("file") MultipartFile[] multipartFiles) {
    System.out.println(multipartFiles);
    return new ResponseEntity<>(storageService.upload(multipartFiles), HttpStatus.OK);
  }

  @GetMapping("/files")
  public ResponseEntity<List<FileInfo>> getListFiles() {
    List<FileInfo> fileInfos = storageService.loadAll().map(path -> {
      String filename = path.getFileName().toString();
      String url = MvcUriComponentsBuilder
          .fromMethodName(FilesController.class, "getFile", path.getFileName().toString()).build().toString();

      return new FileInfo(filename, url);
    }).collect(Collectors.toList());

    return ResponseEntity.status(HttpStatus.OK).body(fileInfos);
  }

  @GetMapping("/files/{filename:.+}")
  public ResponseEntity<Resource> getFile(@PathVariable String filename) {
    Resource file = storageService.load(filename);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
        .body(file);
  }

  @GetMapping("/uploads/{filename:.+}")
  public ResponseEntity<byte[]> getUploadedFile(@PathVariable String filename) throws IOException {
    Path filePath = Paths.get("uploads").resolve(filename);
    if (!Files.exists(filePath)) {
      return ResponseEntity.notFound().build();
    }
    
    byte[] fileContent = Files.readAllBytes(filePath);
    String contentType = Files.probeContentType(filePath);
    if (contentType == null) {
      contentType = "application/octet-stream";
    }
    
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .body(fileContent);
  }
}
