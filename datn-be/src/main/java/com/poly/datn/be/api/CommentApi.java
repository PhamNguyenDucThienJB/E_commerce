package com.poly.datn.be.api;

import com.poly.datn.be.domain.dto.ReqCommentDto;
import com.poly.datn.be.domain.dto.RespCommentDto;
import com.poly.datn.be.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CommentApi {

    private final CommentService commentService;

    // Admin endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<RespCommentDto>> getAllCommentsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ResponseEntity.ok(commentService.getAllCommentsForAdmin(pageable));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<RespCommentDto>> getCommentsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ResponseEntity.ok(commentService.getCommentsByProductId(productId, pageable));
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<List<RespCommentDto>> getRepliesByCommentId(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentService.getRepliesByCommentId(commentId));
    }

    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<RespCommentDto>> getCommentsByUser(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(commentService.getCommentsByUsername(authentication.getName(), pageable));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespCommentDto> createComment(
            @Valid @RequestBody ReqCommentDto reqCommentDto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(commentService.createComment(reqCommentDto, authentication.getName()));
    }

    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespCommentDto> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody ReqCommentDto reqCommentDto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, reqCommentDto, authentication.getName()));
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        commentService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // Admin update comment endpoint without strict validation
    @PutMapping("/admin/{commentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RespCommentDto> adminUpdateComment(
            @PathVariable Long commentId,
            @RequestBody ReqCommentDto reqCommentDto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(commentService.adminUpdateComment(commentId, reqCommentDto, authentication.getName()));
    }
}