package com.poly.datn.be.service.impl;

import com.poly.datn.be.domain.dto.ReqRatingDto;
import com.poly.datn.be.domain.dto.ReqAdminRatingReplyDto;
import com.poly.datn.be.domain.dto.RespProductRatingDto;
import com.poly.datn.be.domain.dto.RespRatingDto;
import com.poly.datn.be.domain.exception.AppException;
import com.poly.datn.be.entity.Account;
import com.poly.datn.be.entity.AccountDetail;
import com.poly.datn.be.entity.Order;
import com.poly.datn.be.entity.Product;
import com.poly.datn.be.entity.Rating;
import com.poly.datn.be.repo.AccountDetailRepo;
import com.poly.datn.be.repo.AccountRepo;
import com.poly.datn.be.repo.OrderRepo;
import com.poly.datn.be.repo.ProductRepo;
import com.poly.datn.be.repo.RatingRepo;
import com.poly.datn.be.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepo ratingRepo;
    private final ProductRepo productRepo;
    private final AccountRepo accountRepo;
    private final OrderRepo orderRepo;
    private final AccountDetailRepo accountDetailRepo;

    @Override
    public RespRatingDto createRating(ReqRatingDto reqRatingDto, String username) {
        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }

        // Lấy product từ bảng products bằng ID từ reqRatingDto
        Product product = productRepo.findById(reqRatingDto.getProductId())
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND));

        // In thông tin debug
        System.out.println("Đánh giá sản phẩm - Product ID: " + product.getId() + ", Product Name: " + product.getName());

        // Check orderId only for non-admin users
        Order order = null;
        if (reqRatingDto.getOrderId() != null) {
            order = orderRepo.findById(reqRatingDto.getOrderId())
                    .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND));
        } else if (!account.getRole().getName().equals("ADMIN")) {
            throw new AppException("Đơn hàng không được để trống", HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra đơn hàng chỉ khi có order (không phải admin)
        if (order != null) {
            // Kiểm tra xem đơn hàng có thuộc về người dùng không
            if (!order.getAccount().getId().equals(account.getId())) {
                throw new AppException("Bạn không có quyền đánh giá sản phẩm này", HttpStatus.FORBIDDEN);
            }

            // Kiểm tra xem đơn hàng đã hoàn thành chưa
            if (!order.getOrderStatus().getName().equalsIgnoreCase("Đã giao")) {
                throw new AppException("Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã giao", HttpStatus.BAD_REQUEST);
            }
            
            // Kiểm tra xem người dùng đã đánh giá cho đơn hàng này chưa
            Optional<Rating> existingOrderRating = ratingRepo.findByAccountAndProductAndOrderAndIsActiveTrue(account, product, order);
            if (existingOrderRating.isPresent()) {
                throw new AppException("Bạn đã đánh giá sản phẩm cho đơn hàng này rồi", HttpStatus.BAD_REQUEST);
            }
        }

        Rating rating = new Rating();
        rating.setRating(reqRatingDto.getRating());
        rating.setContent(reqRatingDto.getContent());
        rating.setCreatedAt(LocalDateTime.now());
        rating.setUpdatedAt(LocalDateTime.now());
        rating.setProduct(product);
        rating.setAccount(account);
        rating.setOrder(order);
        rating.setIsActive(true);

        Rating savedRating = ratingRepo.save(rating);
        return convertToDto(savedRating);
    }

    @Override
    public RespRatingDto updateRating(Long ratingId, ReqRatingDto reqRatingDto, String username) {
        Rating rating = ratingRepo.findById(ratingId)
                .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", HttpStatus.NOT_FOUND));

        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }

        // Kiểm tra quyền chỉnh sửa
        if (!rating.getAccount().getId().equals(account.getId()) && !account.getRole().getName().equals("ADMIN")) {
            throw new AppException("Bạn không có quyền chỉnh sửa đánh giá này", HttpStatus.FORBIDDEN);
        }

        rating.setRating(reqRatingDto.getRating());
        rating.setContent(reqRatingDto.getContent());
        rating.setUpdatedAt(LocalDateTime.now());

        Rating updatedRating = ratingRepo.save(rating);
        return convertToDto(updatedRating);
    }

    @Override
    public void deleteRating(Long ratingId, String username) {
        Rating rating = ratingRepo.findById(ratingId)
                .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", HttpStatus.NOT_FOUND));

        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }

        // Kiểm tra quyền xóa
        if (!rating.getAccount().getId().equals(account.getId()) && !account.getRole().getName().equals("ADMIN")) {
            throw new AppException("Bạn không có quyền xóa đánh giá này", HttpStatus.FORBIDDEN);
        }

        // Soft delete
        rating.setIsActive(false);
        ratingRepo.save(rating);
    }

    @Override
    public Page<RespRatingDto> getRatingsByProductId(Long productId, Pageable pageable) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND));
        
        Page<Rating> ratings = ratingRepo.findByProductAndIsActiveTrue(product, pageable);
        return ratings.map(this::convertToDto);
    }

    @Override
    public RespProductRatingDto getProductRatingStatistics(Long productId) {
        // Kiểm tra sản phẩm tồn tại
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND));
        
        // Lấy trực tiếp avg_rating từ bảng products thay vì tính toán từ bảng ratings
        Double averageRating = product.getAvgRating() != null ? product.getAvgRating().doubleValue() : 0.0;
        Long totalRatings = ratingRepo.countRatingsByProductId(productId);
        
        RespProductRatingDto dto = new RespProductRatingDto();
        dto.setProductId(productId);
        dto.setAverageRating(averageRating);
        dto.setTotalRatings(totalRatings != null ? totalRatings : 0L);
        
        // Đếm số lượng đánh giá theo số sao
        dto.setFiveStarCount(ratingRepo.countRatingsByProductIdAndStars(productId, 5));
        dto.setFourStarCount(ratingRepo.countRatingsByProductIdAndStars(productId, 4));
        dto.setThreeStarCount(ratingRepo.countRatingsByProductIdAndStars(productId, 3));
        dto.setTwoStarCount(ratingRepo.countRatingsByProductIdAndStars(productId, 2));
        dto.setOneStarCount(ratingRepo.countRatingsByProductIdAndStars(productId, 1));
        
        return dto;
    }

    @Override
    public Page<RespRatingDto> getRatingsByUsername(String username, Pageable pageable) {
        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }
        
        Page<Rating> ratings = ratingRepo.findByAccountId(account.getId(), pageable);
        return ratings.map(this::convertToDto);
    }

    @Override
    public Boolean canUserRateProduct(Long productId, String username) {
        Account account = accountRepo.findAccountByUsername(username);
        if (account == null) {
            throw new AppException("Không tìm thấy tài khoản", HttpStatus.NOT_FOUND);
        }
        
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND));
        
        // Kiểm tra người dùng đã mua sản phẩm này chưa và đơn hàng đã hoàn thành chưa
        Boolean hasBoughtProduct = orderRepo.existsCompletedOrderWithProductForUser(account.getId(), productId);
        
        // Nếu người dùng chưa mua sản phẩm, không cho phép đánh giá
        if (!hasBoughtProduct) {
            return false;
        }
        
        return true;
    }

    @Override
    public Page<RespRatingDto> getAllRatingsForAdmin(Pageable pageable) {
        Page<Rating> ratings = ratingRepo.findAllByIsActiveTrue(pageable);
        return ratings.map(this::convertToDto);
    }

    @Override
    public Page<RespRatingDto> getAllRatingsForAdmin(int page, int size, String sortBy, String sortDir) {
        // Validate sortBy parameter to prevent PropertyReferenceException
        String validSortBy = sortBy;
        if (!isValidSortField(sortBy)) {
            validSortBy = "createdAt"; // fallback to default
        }
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(validSortBy).descending() : Sort.by(validSortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return getAllRatingsForAdmin(pageable);
    }
    
    private boolean isValidSortField(String field) {
        // List of valid fields for sorting Rating entity
        return "id".equals(field) || "rating".equals(field) || "content".equals(field) || 
               "createdAt".equals(field) || "updatedAt".equals(field) || "isActive".equals(field);
    }

    @Override
    @Transactional
    public RespRatingDto createAdminRatingReply(ReqAdminRatingReplyDto reqAdminRatingReplyDto, String adminUsername) {
        // Verify admin exists
        Account admin = accountRepo.findAccountByUsername(adminUsername);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }

        // Get the product
        Product product = productRepo.findById(reqAdminRatingReplyDto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Chuẩn bị nội dung phản hồi, bao gồm ID đánh giá nếu có
        String replyContent;
        if (reqAdminRatingReplyDto.getReplyToRatingId() != null) {
            // Định dạng mới: [ADMIN REPLY TO X] content - để frontend có thể phân tích
            replyContent = String.format("[ADMIN REPLY TO %d] %s", 
                    reqAdminRatingReplyDto.getReplyToRatingId(), 
                    reqAdminRatingReplyDto.getContent());
            
            System.out.println("Admin đang phản hồi cho đánh giá ID: " + reqAdminRatingReplyDto.getReplyToRatingId());
        } else {
            // Định dạng cũ nếu không có replyToRatingId
            replyContent = "[ADMIN REPLY] " + reqAdminRatingReplyDto.getContent();
        }

        // Create admin reply rating without order validation
        Rating rating = new Rating();
        rating.setAccount(admin);
        rating.setProduct(product);
        rating.setOrder(null); // Admin replies don't need orders
        rating.setRating(5); // Default 5 stars for admin replies
        rating.setContent(replyContent);
        rating.setCreatedAt(LocalDateTime.now());
        rating.setUpdatedAt(LocalDateTime.now());
        rating.setIsActive(true);

        Rating savedRating = ratingRepo.save(rating);
        return convertToDto(savedRating);
    }

    @Override
    public RespRatingDto adminUpdateRating(Long ratingId, ReqRatingDto reqRatingDto, String adminUsername) {
        Rating rating = ratingRepo.findById(ratingId)
                .orElseThrow(() -> new AppException("Không tìm thấy đánh giá", HttpStatus.NOT_FOUND));

        Account admin = accountRepo.findAccountByUsername(adminUsername);
        if (admin == null || !admin.getRole().getName().equals("ADMIN")) {
            throw new AppException("Chỉ admin mới có quyền chỉnh sửa", HttpStatus.FORBIDDEN);
        }

        // Admin can update any rating without validation
        rating.setRating(reqRatingDto.getRating());
        rating.setContent(reqRatingDto.getContent());
        rating.setUpdatedAt(LocalDateTime.now());

        Rating updatedRating = ratingRepo.save(rating);
        return convertToDto(updatedRating);
    }

    private RespRatingDto convertToDto(Rating rating) {
        RespRatingDto dto = new RespRatingDto();
        dto.setId(rating.getId());
        dto.setRating(rating.getRating());
        dto.setContent(rating.getContent());
        dto.setCreatedAt(rating.getCreatedAt());
        dto.setUpdatedAt(rating.getUpdatedAt());
        dto.setProductId(rating.getProduct().getId());
        dto.setProductName(rating.getProduct().getName());
        dto.setAccountId(rating.getAccount().getId());
        dto.setUsername(rating.getAccount().getUsername());
        
        // Lấy fullname và avatar từ AccountDetail nếu có
        AccountDetail accountDetail = accountDetailRepo.findAccountDetailByAccount_Id(rating.getAccount().getId());
        if (accountDetail != null) {
            dto.setFullname(accountDetail.getFullname()); // Lấy fullname từ AccountDetail
            // Gán avatar từ accountDetail nếu có thuộc tính này
            // dto.setAccountAvatar(accountDetail.getAvatar());
            // Hiện tại AccountDetail không có avatar nên bỏ qua
        }
        
        // Handle null order for admin replies
        dto.setOrderId(rating.getOrder() != null ? rating.getOrder().getId() : null);
        dto.setIsActive(rating.getIsActive());
        
        return dto;
    }
} 