package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.constant.AppConst;
import com.poly.datn.be.domain.constant.AttributeConst;
import com.poly.datn.be.domain.dto.ReqCacheAttributeDto;
import com.poly.datn.be.domain.dto.RespAttributeDto;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Attribute;
import com.poly.datn.be.entity.OrderDetail;
import com.poly.datn.be.repo.AttributeRepo;
import com.poly.datn.be.service.AttributeService;
import com.poly.datn.be.service.OrderDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AttributeServiceImpl implements AttributeService {
    @Autowired
    OrderDetailService orderDetailService;
    @Autowired
    AttributeRepo attributeRepo;
    @Override
    public Attribute findById(Long id) {
        Optional<Attribute> optionalAttribute = attributeRepo.findById(id);
        if(!optionalAttribute.isPresent()){
            throw new AppException(AttributeConst.ATTRIBUTE_MSG_ERROR_NOT_EXIST);
        }
        return optionalAttribute.get();
    }

    @Override
    @Transactional
    public List<Attribute> cacheAttribute(Long id) {
        List<OrderDetail> orderDetails = orderDetailService.getAllByOrderId(id);
        List<Attribute> attributes = new ArrayList<>();
        for(OrderDetail o: orderDetails){
            Attribute attribute = o.getAttribute();
            attribute.setCache(attribute.getCache() - o.getQuantity());
            attributeRepo.save(attribute);
            attributes.add(attribute);
        }
        return attributes;
    }

    @Override
    public List<Attribute> findAll() {
        return attributeRepo.findAll();
    }

    @Override
    public List<Attribute> backAttribute(Long id) {
        List<OrderDetail> orderDetails = orderDetailService.getAllByOrderId(id);
        List<Attribute> attributes = new ArrayList<>();
        for(OrderDetail o: orderDetails){
            Attribute attribute = o.getAttribute();
            attribute.setCache(attribute.getCache() - o.getQuantity());
            attribute.setStock(attribute.getStock() + o.getQuantity());
            attributeRepo.save(attribute);
            attributes.add(attribute);
        }
        return attributes;
    }

    @Override
    public Attribute save(Attribute attribute) {
        return attributeRepo.save(attribute);
    }

    @Override
    public Attribute getByProductIdAndSize(Long productId, Integer size) {
        return attributeRepo.findByProduct_IdAndSize(productId, size);
    }

    @Override
    public Boolean isValidCart(Long id, Integer quantity) {
        Attribute attribute = findById(id);
        if(quantity > attribute.getStock()){
            throw new AppException(AttributeConst.ATTRIBUTE_MSG_ERROR_NOT_ENOUGH_STOCK);
        }
        return Boolean.TRUE;
    }
}
