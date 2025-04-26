package com.poly.datn.be.repo;

import com.poly.datn.be.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepo extends JpaRepository<Role, Long> {

    Role findRoleByName(String name);
}
