package com.poly.datn.be.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

public interface FileManagerService {
    List<String> saveFile(String folder, MultipartFile[] files);
}
