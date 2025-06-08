package com.poly.datn.be.api;

import com.poly.datn.be.domain.dto.ReqRatingDto;
import com.poly.datn.be.domain.dto.ReqAdminRatingReplyDto;
import com.poly.datn.be.domain.dto.RespProductRatingDto;
import com.poly.datn.be.domain.dto.RespRatingDto;
import com.poly.datn.be.service.RatingService;
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

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@CrossOrigin("*")
public class RatingApi {

    private final RatingService ratingService;

    // Admin endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<RespRatingDto>> getAllRatingsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(ratingService.getAllRatingsForAdmin(page, size, sortBy, sortDir));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<RespRatingDto>> getRatingsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ResponseEntity.ok(ratingService.getRatingsByProductId(productId, pageable));
    }

    @GetMapping("/product/{productId}/statistics")
    public ResponseEntity<RespProductRatingDto> getProductRatingStatistics(@PathVariable Long productId) {
        return ResponseEntity.ok(ratingService.getProductRatingStatistics(productId));
    }

    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<RespRatingDto>> getRatingsByUser(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ratingService.getRatingsByUsername(authentication.getName(), pageable));
    }

    @GetMapping("/product/{productId}/can-rate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> canUserRateProduct(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ratingService.canUserRateProduct(productId, authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespRatingDto> createRating(
            @Valid @RequestBody ReqRatingDto reqRatingDto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ratingService.createRating(reqRatingDto, authentication.getName()));
    }

    @PutMapping("/{ratingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespRatingDto> updateRating(
            @PathVariable Long ratingId,
            @Valid @RequestBody ReqRatingDto reqRatingDto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ratingService.updateRating(ratingId, reqRatingDto, authentication.getName()));
    }

    @DeleteMapping("/{ratingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long ratingId,
            Authentication authentication
    ) {
        ratingService.deleteRating(ratingId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // Admin reply to rating
    @PostMapping("/admin/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RespRatingDto> createAdminRatingReply(
            @Valid @RequestBody ReqAdminRatingReplyDto reqAdminRatingReplyDto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ratingService.createAdminRatingReply(reqAdminRatingReplyDto, authentication.getName()));
    }

    // Admin update rating endpoint without strict validation
    @PutMapping("/admin/{ratingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RespRatingDto> adminUpdateRating(
            @PathVariable Long ratingId,
            @RequestBody ReqRatingDto reqRatingDto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ratingService.adminUpdateRating(ratingId, reqRatingDto, authentication.getName()));
    }
} 