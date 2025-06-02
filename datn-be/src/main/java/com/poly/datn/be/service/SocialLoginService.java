package com.poly.datn.be.service;
 
public interface SocialLoginService {
    String authenticateWithGoogle(String idToken) throws Exception;
    String authenticateWithFacebook(String accessToken) throws Exception;
} 