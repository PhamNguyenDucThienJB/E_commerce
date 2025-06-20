package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Image;
import com.poly.datn.be.repo.ImageRepo;
import com.poly.datn.be.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
public class ImageServiceImpl implements ImageService {
    @Autowired
    ImageRepo imageRepo;

    @Override
    public Image createImage(Image image) {
        return imageRepo.save(image);
    }

    @Override
    public void deleteImageById(Long id) {
        Optional<Image> optionalImage = imageRepo.findById(id);
        if (!optionalImage.isPresent()){
            throw new AppException("Not Found Image");
        }
        Image image = optionalImage.get();

        imageRepo.delete(image);
    }

    @Override
    public List<Image> getImagesByProductId(Long productId) {
        return imageRepo.findByProductId(productId);
    }

//    @Override
//    public List<Image> getImagesByProductId(Long productId) {
//        return null;
//    }
}
