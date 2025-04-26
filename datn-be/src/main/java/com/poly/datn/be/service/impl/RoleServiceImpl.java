package com.poly.datn.be.service.impl;

import com.poly.datn.be.entity.Role;
import com.poly.datn.be.repo.RoleRepo;
import com.poly.datn.be.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl implements RoleService {
    @Autowired
    RoleRepo roleRepo;

    @Override
    public Role findById(Long id) {
        return roleRepo.findById(id).get();
    }
}
