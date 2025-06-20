package com.poly.datn.be.service;

import com.poly.datn.be.entity.Image;

import java.util.List;

public interface ImageService {
    Image createImage(Image image);
    void deleteImageById(Long id);
    List<Image> getImagesByProductId(Long productId);
}
