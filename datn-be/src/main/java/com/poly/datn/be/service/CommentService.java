package com.poly.datn.be.service;

import com.poly.datn.be.domain.dto.ReqCommentDto;
import com.poly.datn.be.domain.dto.RespCommentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CommentService {
    RespCommentDto createComment(ReqCommentDto reqCommentDto, String username);
    
    RespCommentDto updateComment(Long commentId, ReqCommentDto reqCommentDto, String username);
    
    void deleteComment(Long commentId, String username);
    
    Page<RespCommentDto> getCommentsByProductId(Long productId, Pageable pageable);
    
    List<RespCommentDto> getRepliesByCommentId(Long commentId);
    
    Page<RespCommentDto> getCommentsByUsername(String username, Pageable pageable);
    
    Page<RespCommentDto> getAllCommentsForAdmin(Pageable pageable);
    
    RespCommentDto adminUpdateComment(Long commentId, ReqCommentDto reqCommentDto, String adminUsername);
} 