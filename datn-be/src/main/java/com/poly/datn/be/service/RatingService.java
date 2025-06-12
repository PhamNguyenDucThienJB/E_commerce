package com.poly.datn.be.service;

import com.poly.datn.be.domain.dto.ReqRatingDto;
import com.poly.datn.be.domain.dto.ReqAdminRatingReplyDto;
import com.poly.datn.be.domain.dto.RespProductRatingDto;
import com.poly.datn.be.domain.dto.RespRatingDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RatingService {
    RespRatingDto createRating(ReqRatingDto reqRatingDto, String username);
    
    RespRatingDto updateRating(Long ratingId, ReqRatingDto reqRatingDto, String username);
    
    void deleteRating(Long ratingId, String username);
    
    Page<RespRatingDto> getRatingsByProductId(Long productId, Pageable pageable);
    
    RespProductRatingDto getProductRatingStatistics(Long productId);
    
    Page<RespRatingDto> getRatingsByUsername(String username, Pageable pageable);
    
    Boolean canUserRateProduct(Long productId, String username);
    
    // Admin methods
    Page<RespRatingDto> getAllRatingsForAdmin(Pageable pageable);

    Page<RespRatingDto> getAllRatingsForAdmin(int page, int size, String sortBy, String sortDir);

    RespRatingDto createAdminRatingReply(ReqAdminRatingReplyDto reqAdminRatingReplyDto, String adminUsername);
    
    RespRatingDto adminUpdateRating(Long ratingId, ReqRatingDto reqRatingDto, String adminUsername);
} 