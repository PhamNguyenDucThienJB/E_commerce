package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.dto.ReqCommentDto;
import com.poly.datn.be.domain.dto.RespCommentDto;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;
import com.poly.datn.be.entity.Comment;
import com.poly.datn.be.entity.Product;
import com.poly.datn.be.repo.AccountDetailRepo;
import com.poly.datn.be.repo.AccountRepo;
import com.poly.datn.be.repo.CommentRepo;
import com.poly.datn.be.repo.ProductRepo;
import com.poly.datn.be.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepo commentRepo;
    private final ProductRepo productRepo;
    private final AccountRepo accountRepo;
    private final AccountDetailRepo accountDetailRepo;

    @Override
    public RespCommentDto createComment(ReqCommentDto reqCommentDto, String username) {
        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }

        Product product = productRepo.findById(reqCommentDto.getProductId())
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND));

        Comment comment = new Comment();
        comment.setContent(reqCommentDto.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        comment.setProduct(product);
        comment.setAccount(account);
        comment.setIsActive(true);

        // Nếu là reply cho comment khác
        if (reqCommentDto.getParentCommentId() != null) {
            Comment parentComment = commentRepo.findById(reqCommentDto.getParentCommentId())
                    .orElseThrow(() -> new AppException("Không tìm thấy bình luận gốc", HttpStatus.NOT_FOUND));
            comment.setParent(parentComment);
        }

        Comment savedComment = commentRepo.save(comment);
        return convertToDto(savedComment);
    }

    @Override
    public RespCommentDto updateComment(Long commentId, ReqCommentDto reqCommentDto, String username) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new AppException("Không tìm thấy bình luận", HttpStatus.NOT_FOUND));

        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }

        // Kiểm tra quyền chỉnh sửa
        if (!comment.getAccount().getId().equals(account.getId()) && !account.getRole().getName().equals("ADMIN")) {
            throw new AppException("Bạn không có quyền chỉnh sửa bình luận này", HttpStatus.FORBIDDEN);
        }

        comment.setContent(reqCommentDto.getContent());
        comment.setUpdatedAt(LocalDateTime.now());

        Comment updatedComment = commentRepo.save(comment);
        return convertToDto(updatedComment);
    }

    @Override
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new AppException("Không tìm thấy bình luận", HttpStatus.NOT_FOUND));

        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }

        // Kiểm tra quyền xóa
        if (!comment.getAccount().getId().equals(account.getId()) && !account.getRole().getName().equals("ADMIN")) {
            throw new AppException("Bạn không có quyền xóa bình luận này", HttpStatus.FORBIDDEN);
        }

        // Soft delete
        comment.setIsActive(false);
        commentRepo.save(comment);
    }

    @Override
    public Page<RespCommentDto> getCommentsByProductId(Long productId, Pageable pageable) {
        Page<Comment> comments = commentRepo.findParentCommentsByProductId(productId, pageable);
        return comments.map(comment -> {
            RespCommentDto dto = convertToDto(comment);
            List<Comment> replies = commentRepo.findByParentIdAndIsActiveTrue(comment.getId());
            dto.setReplies(replies.stream().map(this::convertToDto).collect(Collectors.toList()));
            return dto;
        });
    }

    @Override
    public List<RespCommentDto> getRepliesByCommentId(Long commentId) {
        List<Comment> replies = commentRepo.findByParentIdAndIsActiveTrue(commentId);
        return replies.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public Page<RespCommentDto> getCommentsByUsername(String username, Pageable pageable) {
        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }
        
        Page<Comment> comments = commentRepo.findByAccountIdAndIsActiveTrue(account.getId(), pageable);
        return comments.map(this::convertToDto);
    }

    @Override
    public Page<RespCommentDto> getAllCommentsForAdmin(Pageable pageable) {
        Page<Comment> comments = commentRepo.findAllByIsActiveTrueOrderByCreatedAtDesc(pageable);
        return comments.map(this::convertToDto);
    }

    @Override
    public RespCommentDto adminUpdateComment(Long commentId, ReqCommentDto reqCommentDto, String adminUsername) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new AppException("Không tìm thấy bình luận", HttpStatus.NOT_FOUND));

        Account admin = accountRepo.findAccountByUsername(adminUsername);
        if (admin == null || !admin.getRole().getName().equals("ADMIN")) {
            throw new AppException("Chỉ admin mới có quyền chỉnh sửa", HttpStatus.FORBIDDEN);
        }

        // Admin can update any comment without validation
        comment.setContent(reqCommentDto.getContent());
        comment.setUpdatedAt(LocalDateTime.now());

        Comment updatedComment = commentRepo.save(comment);
        return convertToDto(updatedComment);
    }

    private RespCommentDto convertToDto(Comment comment) {
        RespCommentDto dto = new RespCommentDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setProductId(comment.getProduct().getId());
        dto.setProductName(comment.getProduct().getName());
        dto.setAccountId(comment.getAccount().getId());
        dto.setUsername(comment.getAccount().getUsername());
        
        // Lấy fullname và avatar từ AccountDetail nếu có
        AccountDetail accountDetail = accountDetailRepo.findAccountDetailByAccount_Id(comment.getAccount().getId());
        if (accountDetail != null) {
            dto.setFullname(accountDetail.getFullname()); // Lấy fullname từ AccountDetail
            // Gán avatar từ accountDetail nếu có thuộc tính này
            // dto.setAccountAvatar(accountDetail.getAvatar());
            // Hiện tại AccountDetail không có avatar nên bỏ qua
        }
        
        if (comment.getParent() != null) {
            dto.setParentCommentId(comment.getParent().getId());
        }
        
        dto.setReplies(new ArrayList<>());
        dto.setIsActive(comment.getIsActive());
        
        return dto;
    }
} 