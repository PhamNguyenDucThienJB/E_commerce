package com.poly.datn.be.service.impl;

import com.poly.datn.be.entity.Image;
import com.poly.datn.be.repo.ImageRepo;
import com.poly.datn.be.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ImageServiceImpl implements ImageService {
    @Autowired
    ImageRepo imageRepo;

    @Override
    public Image createImage(Image image) {
        return imageRepo.save(image);
    }
}
