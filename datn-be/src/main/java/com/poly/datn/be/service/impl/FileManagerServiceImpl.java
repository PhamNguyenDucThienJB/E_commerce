package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.service.FileManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class FileManagerServiceImpl implements FileManagerService {
    @Autowired
    ServletContext app;

    @Override
    public List<String> saveFile(String folder, MultipartFile[] files) {
        List<String> filenames = new ArrayList<>();
       for(MultipartFile file: files){
           String name = System.currentTimeMillis() + file.getOriginalFilename();
           String filename = Integer.toHexString(name.hashCode()) + name.substring(name.lastIndexOf("/"));
           Path path = this.getPath(folder, filename);
           try {
               file.transferTo(path);
               filenames.add(filename);
           }catch (Exception e){
               throw new AppException(e.getMessage());
           }
       }
       return filenames;
    }

    private Path getPath(String folder, String filename){
        File dir = Paths.get(app.getRealPath("/files/"), folder).toFile();
        if(!dir.exists()){
            dir.mkdirs();
        }
        return Paths.get(dir.getAbsolutePath(), filename);
    }
}
