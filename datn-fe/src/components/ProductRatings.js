import React, { useState, useEffect } from "react";
import { getRatingsByProductId, getRatingsByProductIdWithCacheBust, getProductRatingStatistics, canUserRateProduct, createRating, updateRating, deleteRating, createAdminRatingReply } from "../api/RatingApi";
import { Button, Form, Card, Image, Pagination, ProgressBar, Row, Col, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import format from "date-fns/format";
import { vi } from "date-fns/locale";
import { FaStar, FaRegStar } from "react-icons/fa";

const ProductRatings = ({ productId, user, orderId }) => {
  const [ratings, setRatings] = useState([]);
  const [statistics, setStatistics] = useState({
    averageRating: 0,
    totalRatings: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0
  });
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [newRating, setNewRating] = useState({
    rating: 5,
    content: ""
  });
  const [canRate, setCanRate] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [editData, setEditData] = useState({
    rating: 5,
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
  const [hasNewRatings, setHasNewRatings] = useState(false);
  const [lastRatingCount, setLastRatingCount] = useState(0);
  const [justSentRating, setJustSentRating] = useState(false);
  const [editingAdminReply, setEditingAdminReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [userRatingsCount, setUserRatingsCount] = useState(0);
  const [userRatingStats, setUserRatingStats] = useState({
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0
  });

  useEffect(() => {
    // Tải dữ liệu đánh giá khi component được tạo hoặc khi productId thay đổi
    console.log("ProductRatings - ProductID:", productId);
    console.log("Đang tải đánh giá cho sản phẩm có ID:", productId);
    loadRatings(0);
    loadStatistics();
    if (user) {
      checkCanRate();
    }

    // Set up auto-refresh every 12 seconds to check for new admin replies
    const interval = setInterval(() => {
      if (!loading && !justSentRating && !document.hidden) {
        // Only refresh if page is visible and user didn't just send a rating
        forceRefreshRatings(false);
      }
    }, 12000); // Refresh every 12 seconds (slightly different from comments)
    
    setAutoRefreshInterval(interval);
    
    // Add event listener for when user returns to tab
    const handleFocus = () => {
      if (!loading && !justSentRating) {
        forceRefreshRatings(false);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    
    // Cleanup interval and listeners on component unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [productId, user, orderId]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  const loadRatings = (page) => {
    setLoading(true);
    getRatingsByProductId(productId, page)
      .then((res) => {
        // Group ratings by non-admin ratings and their corresponding admin replies
        const groupedRatings = groupRatingsWithReplies(res.data.content);
        setRatings(groupedRatings);
        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading ratings:", error);
        setLoading(false);
      });
  };

  const forceRefreshRatings = (showLoading = true) => {
    // Force refresh with cache busting
    if (showLoading) {
      setLoading(true);
    }
    
    getRatingsByProductIdWithCacheBust(productId, currentPage, 10, "createdAt", "desc")
      .then((res) => {
        console.log("Force refresh ratings response:", res.data); // Debug log
        
        // Check if there are new admin replies
        const newRatingCount = res.data.totalElements || res.data.content.length;
        if (lastRatingCount > 0 && newRatingCount > lastRatingCount && !justSentRating) {
          // Check if the newest ratings are admin replies (not from current user)
          const newestRatings = res.data.content.slice(0, newRatingCount - lastRatingCount);
          const hasAdminReplies = newestRatings.some(rating => 
            rating.content && rating.content.startsWith('[ADMIN REPLY]')
          );
          
          if (hasAdminReplies) {
            setHasNewRatings(true);
            // Show toast notification for new admin replies
            toast.info("⭐ Có phản hồi mới từ người bán!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            // Auto-clear the notification after 5 seconds
            setTimeout(() => setHasNewRatings(false), 5000);
          }
        }
        
        // Reset the flag after checking
        if (justSentRating) {
          setJustSentRating(false);
        }
        
        setLastRatingCount(newRatingCount);
        
        // Group ratings by non-admin ratings and their corresponding admin replies
        const groupedRatings = groupRatingsWithReplies(res.data.content);
        setRatings(groupedRatings);
        setTotalPages(res.data.totalPages);
        
        if (showLoading) {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error force refreshing ratings:", error);
        if (showLoading) {
          setLoading(false);
        }
        // Fallback to regular refresh if cache bust fails
        getRatingsByProductId(productId, currentPage, 10, "createdAt", "desc")
          .then((res) => {
            const groupedRatings = groupRatingsWithReplies(res.data.content);
            setRatings(groupedRatings);
            setTotalPages(res.data.totalPages);
            if (showLoading) {
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error("Fallback refresh also failed:", err);
            if (showLoading) {
              setLoading(false);
            }
          });
      });
  };

  const groupRatingsWithReplies = (ratingsData) => {
    const userRatings = [];
    const adminReplies = [];
    
    // Separate user ratings and admin replies
    ratingsData.forEach(rating => {
      if (rating.content && rating.content.startsWith('[ADMIN REPLY]')) {
        adminReplies.push({
          ...rating,
          content: rating.content.replace('[ADMIN REPLY] ', '')
        });
      } else {
        userRatings.push(rating);
      }
    });

    // Update the count of actual user ratings (excluding admin replies)
    setUserRatingsCount(userRatings.length);
    
    // Calculate user rating statistics
    const stats = {
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0,
      twoStarCount: 0,
      oneStarCount: 0
    };
    
    userRatings.forEach(rating => {
      if (rating.rating === 5) stats.fiveStarCount++;
      else if (rating.rating === 4) stats.fourStarCount++;
      else if (rating.rating === 3) stats.threeStarCount++;
      else if (rating.rating === 2) stats.twoStarCount++;
      else if (rating.rating === 1) stats.oneStarCount++;
    });
    
    setUserRatingStats(stats);

    // Group user ratings with their admin replies
    return userRatings.map((userRating, index) => {
      // For now, show admin reply only for the first (most recent) rating
      // This matches the typical e-commerce pattern where seller responds generally
      const adminReply = index === 0 && adminReplies.length > 0 ? adminReplies[0] : null;
      
      return {
        ...userRating,
        adminReply: adminReply
      };
    });
  };

  const loadStatistics = () => {
    console.log("Đang gọi API getProductRatingStatistics với productId:", productId);
    getProductRatingStatistics(productId)
      .then((res) => {
        console.log("Kết quả từ API thống kê đánh giá:", res.data);
        // Lưu dữ liệu vào state
        setStatistics({
          averageRating: res.data.averageRating || 0,
          totalRatings: res.data.totalRatings || 0,
          fiveStarCount: res.data.fiveStarCount || 0,
          fourStarCount: res.data.fourStarCount || 0,
          threeStarCount: res.data.threeStarCount || 0,
          twoStarCount: res.data.twoStarCount || 0,
          oneStarCount: res.data.oneStarCount || 0
        });
      })
      .catch((error) => {
        console.error("Lỗi khi tải thống kê đánh giá:", error);
      });
  };

  const checkCanRate = () => {
    canUserRateProduct(productId)
      .then((res) => {
        setCanRate(res.data);
      })
      .catch((error) => {
        console.error("Error checking if user can rate:", error);
        setCanRate(false);
      });
  };

  const handlePageChange = (page) => {
    loadRatings(page);
  };

  const handleRatingChange = (value) => {
    setNewRating({ ...newRating, rating: value });
  };

  const handleEditRatingChange = (value) => {
    setEditData({ ...editData, rating: value });
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (!orderId) {
      toast.warning("Bạn cần mua sản phẩm trước khi đánh giá");
      return;
    }

    // Đảm bảo product_id là ID từ bảng product, không phải từ attribute
    const ratingData = {
      productId: productId, // ID từ bảng product
      orderId: orderId,
      rating: newRating.rating,
      content: newRating.content
    };

    console.log("Đang gửi đánh giá:", ratingData);

    createRating(ratingData)
      .then((response) => {
        console.log("Đánh giá thành công:", response.data);
        toast.success("Đánh giá thành công");
        setNewRating({
          rating: 5,
          content: ""
        });
        setJustSentRating(true); // Mark that user just sent a rating
        // Immediate refresh without loading indicator
        forceRefreshRatings(false);
        loadStatistics();
        setCanRate(false);
        
        // Backup refresh to ensure consistency
        setTimeout(() => {
          forceRefreshRatings(false);
          loadStatistics();
        }, 100);
      })
      .catch((error) => {
        console.error("Lỗi khi gửi đánh giá:", error);
        toast.error("Có lỗi xảy ra khi gửi đánh giá");
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const ratingData = {
      productId: productId,
      orderId: editingRating.orderId,
      rating: editData.rating,
      content: editData.content
    };

    updateRating(editingRating.id, ratingData)
      .then(() => {
        toast.success("Cập nhật đánh giá thành công");
        setEditingRating(null);
        setJustSentRating(true); // Mark that user just sent a rating
        // Immediate refresh without loading indicator
        forceRefreshRatings(false);
        loadStatistics();
        
        // Backup refresh to ensure consistency
        setTimeout(() => {
          forceRefreshRatings(false);
          loadStatistics();
        }, 100);
      })
      .catch((error) => {
        console.error("Error updating rating:", error);
        toast.error("Có lỗi xảy ra khi cập nhật đánh giá");
      });
  };

  // State for custom confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState(null);

  const handleDeleteRating = (ratingId) => {
    setRatingToDelete(ratingId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (!ratingToDelete) return;
    
    deleteRating(ratingToDelete)
      .then(() => {
        toast.success("Xóa đánh giá thành công");
        // Immediate refresh without loading indicator
        forceRefreshRatings(false);
        loadStatistics();
        checkCanRate();
        
        // Backup refresh to ensure consistency
        setTimeout(() => {
          forceRefreshRatings(false);
          loadStatistics();
        }, 100);
        setShowDeleteModal(false);
        setRatingToDelete(null);
      })
      .catch((error) => {
        console.error("Error deleting rating:", error);
        toast.error("Có lỗi xảy ra khi xóa đánh giá");
        setShowDeleteModal(false);
        setRatingToDelete(null);
      });
  };

  const startEdit = (rating) => {
    setEditingRating(rating);
    setEditData({
      rating: rating.rating,
      content: rating.content
    });
  };

  const cancelEdit = () => {
    setEditingRating(null);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    // Determine star color based on rating
    const getStarColor = (rating) => {
      if (rating <= 2) return '#ff4d4f'; // Red for low ratings
      if (rating <= 3) return '#faad14'; // Orange for medium ratings
      return '#fadb14'; // Yellow for good ratings
    };
    
    const starColor = getStarColor(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? starColor : '#e8e8e8', marginRight: '2px' }}>
          {i <= rating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return stars;
  };

  const renderRatingInput = (currentRating, onChange) => {
    const getStarColor = (rating) => {
      if (rating <= 2) return '#ff4d4f';
      if (rating <= 3) return '#faad14';
      return '#fadb14';
    };
    
    return (
      <div className="d-flex align-items-center mb-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <span
            key={value}
            onClick={() => onChange(value)}
            style={{ 
              cursor: "pointer", 
              fontSize: "20px", 
              marginRight: "4px",
              color: value <= currentRating ? getStarColor(currentRating) : '#e8e8e8'
            }}
          >
            {value <= currentRating ? <FaStar /> : <FaRegStar />}
          </span>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    pages.push(
      <Pagination.Item 
        key="first" 
        onClick={() => handlePageChange(0)}
        disabled={currentPage === 0}
      >
        &laquo;
      </Pagination.Item>
    );

    pages.push(
      <Pagination.Item 
        key="prev" 
        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
      >
        &lt;
      </Pagination.Item>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i + 1}
        </Pagination.Item>
      );
    }

    pages.push(
      <Pagination.Item 
        key="next" 
        onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
      >
        &gt;
      </Pagination.Item>
    );

    pages.push(
      <Pagination.Item 
        key="last" 
        onClick={() => handlePageChange(totalPages - 1)}
        disabled={currentPage === totalPages - 1}
      >
        &raquo;
      </Pagination.Item>
    );

    return <Pagination className="mt-3 justify-content-center">{pages}</Pagination>;
  };

  const calculatePercentage = (count) => {
    return userRatingsCount > 0 ? (count / userRatingsCount) * 100 : 0;
  };

  const handleAdminReplySubmit = (e) => {
    e.preventDefault();
    if (!user || user.role !== "ADMIN") {
      toast.warning("Chỉ admin mới có thể trả lời đánh giá");
      return;
    }

    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    const replyData = {
      productId: productId,
      content: replyContent
    };

    createAdminRatingReply(replyData)
      .then(() => {
        toast.success("Phản hồi thành công");
        setReplyingTo(null);
        setReplyContent("");
        // Immediate refresh without loading indicator
        forceRefreshRatings(false);
        
        // Backup refresh to ensure consistency
        setTimeout(() => {
          forceRefreshRatings(false);
        }, 100);
      })
      .catch((error) => {
        console.error("Error creating admin reply:", error);
        toast.error("Có lỗi xảy ra khi gửi phản hồi");
      });
  };

  const startReply = (ratingId) => {
    if (!user || user.role !== "ADMIN") {
      toast.warning("Chỉ admin mới có thể trả lời đánh giá");
      return;
    }
    setReplyingTo(ratingId);
    setReplyContent("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const startEditAdminReply = (adminReply) => {
    setEditingAdminReply(adminReply);
    // Remove [ADMIN REPLY] prefix for editing
    const contentWithoutPrefix = adminReply.content.replace(/^\[ADMIN REPLY\]\s*/, '');
    setEditReplyContent(contentWithoutPrefix);
  };

  const cancelEditAdminReply = () => {
    setEditingAdminReply(null);
    setEditReplyContent("");
  };

  const handleEditAdminReplySubmit = (e) => {
    e.preventDefault();
    if (!user || user.role !== "ADMIN") {
      toast.warning("Chỉ admin mới có thể sửa phản hồi");
      return;
    }

    if (!editReplyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    const replyData = {
      productId: productId,
      content: `[ADMIN REPLY] ${editReplyContent}`
    };

    updateRating(editingAdminReply.id, replyData)
      .then(() => {
        toast.success("Cập nhật phản hồi thành công");
        setEditingAdminReply(null);
        setEditReplyContent("");
        // Immediate refresh without loading indicator
        forceRefreshRatings(false);
        
        // Backup refresh to ensure consistency
        setTimeout(() => {
          forceRefreshRatings(false);
        }, 100);
      })
      .catch((error) => {
        console.error("Error updating admin reply:", error);
        toast.error("Có lỗi xảy ra khi cập nhật phản hồi");
      });
  };

  return (
    <div className="product-ratings mt-5">
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#1a1a1a',
          margin: '0',
          position: 'relative'
        }}>
          Đánh giá sản phẩm ({userRatingsCount})
          {hasNewRatings && (
            <span 
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                backgroundColor: '#ff4d4f',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: 'normal',
                animation: 'pulse 1s infinite'
              }}
            >
              Mới
            </span>
          )}
        </h4>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={() => forceRefreshRatings(true)}
          disabled={loading}
          style={{ 
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '6px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Đang tải...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt me-1"></i>
              Làm mới
            </>
          )}
        </Button>
      </div>

      <div className="mb-5" style={{ 
        backgroundColor: '#fafafa', 
        padding: '24px', 
        borderRadius: '8px',
        border: '1px solid #f0f0f0'
      }}>
        <Row>
          <Col md={4}>
            <div className="text-center">
              <h2 style={{ 
                fontSize: '48px', 
                fontWeight: '700', 
                color: '#333',
                margin: '0 0 8px 0'
              }}>
                {statistics.averageRating !== null && statistics.averageRating !== undefined 
                  ? statistics.averageRating.toFixed(1) 
                  : "0.0"}
              </h2>
              <div className="mb-2" style={{ fontSize: '18px' }}>
                {renderStars(Math.round(statistics.averageRating || 0))}
              </div>
              <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                {userRatingsCount || 0} đánh giá
              </p>
            </div>
          </Col>
          <Col md={8}>
            <div className="d-flex align-items-center mb-2">
              <div style={{ width: "60px", fontSize: "14px", color: "#666" }}>5 sao</div>
              <div className="flex-grow-1 mx-3">
                <div style={{ 
                  backgroundColor: '#e8e8e8', 
                  height: '8px', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      width: `${calculatePercentage(userRatingStats.fiveStarCount)}%`,
                      height: '100%',
                      backgroundColor: '#fadb14',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
              <div style={{ width: "30px", fontSize: "14px", color: "#666", textAlign: "right" }}>
                {userRatingStats.fiveStarCount}
              </div>
            </div>
            <div className="d-flex align-items-center mb-2">
              <div style={{ width: "60px", fontSize: "14px", color: "#666" }}>4 sao</div>
              <div className="flex-grow-1 mx-3">
                <div style={{ 
                  backgroundColor: '#e8e8e8', 
                  height: '8px', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      width: `${calculatePercentage(userRatingStats.fourStarCount)}%`,
                      height: '100%',
                      backgroundColor: '#fadb14',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
              <div style={{ width: "30px", fontSize: "14px", color: "#666", textAlign: "right" }}>
                {userRatingStats.fourStarCount}
              </div>
            </div>
            <div className="d-flex align-items-center mb-2">
              <div style={{ width: "60px", fontSize: "14px", color: "#666" }}>3 sao</div>
              <div className="flex-grow-1 mx-3">
                <div style={{ 
                  backgroundColor: '#e8e8e8', 
                  height: '8px', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      width: `${calculatePercentage(userRatingStats.threeStarCount)}%`,
                      height: '100%',
                      backgroundColor: '#faad14',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
              <div style={{ width: "30px", fontSize: "14px", color: "#666", textAlign: "right" }}>
                {userRatingStats.threeStarCount}
              </div>
            </div>
            <div className="d-flex align-items-center mb-2">
              <div style={{ width: "60px", fontSize: "14px", color: "#666" }}>2 sao</div>
              <div className="flex-grow-1 mx-3">
                <div style={{ 
                  backgroundColor: '#e8e8e8', 
                  height: '8px', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      width: `${calculatePercentage(userRatingStats.twoStarCount)}%`,
                      height: '100%',
                      backgroundColor: '#ff4d4f',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
              <div style={{ width: "30px", fontSize: "14px", color: "#666", textAlign: "right" }}>
                {userRatingStats.twoStarCount}
              </div>
            </div>
            <div className="d-flex align-items-center mb-2">
              <div style={{ width: "60px", fontSize: "14px", color: "#666" }}>1 sao</div>
              <div className="flex-grow-1 mx-3">
                <div style={{ 
                  backgroundColor: '#e8e8e8', 
                  height: '8px', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      width: `${calculatePercentage(userRatingStats.oneStarCount)}%`,
                      height: '100%',
                      backgroundColor: '#ff4d4f',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
              <div style={{ width: "30px", fontSize: "14px", color: "#666", textAlign: "right" }}>
                {userRatingStats.oneStarCount}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {user && canRate && (
        <Card className="mb-4" style={{ border: '1px solid #f0f0f0', borderRadius: '8px', boxShadow: 'none' }}>
          <Card.Body style={{ padding: '20px' }}>
            <h5 className="mb-3" style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
              Viết đánh giá của bạn
            </h5>
            <Form onSubmit={handleRatingSubmit}>
              {renderRatingInput(newRating.rating, handleRatingChange)}
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  value={newRating.content}
                  onChange={(e) => setNewRating({ ...newRating, content: e.target.value })}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    padding: "12px",
                    resize: "none",
                    color: "#000"
                  }}
                />
              </Form.Group>
              <div className="d-flex justify-content-end mt-3">
                <Button 
                  variant="primary" 
                  type="submit"
                  style={{ 
                    fontSize: '14px',
                    padding: '8px 20px',
                    borderRadius: '6px'
                  }}
                >
                  Gửi đánh giá
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {loading ? (
        <p className="text-center">Đang tải đánh giá...</p>
      ) : ratings.length === 0 ? (
        <p className="text-center">Chưa có đánh giá nào cho sản phẩm này.</p>
      ) : (
        <>
          {ratings.map((rating, index) => (
            <div key={rating.id} className="mb-4">
              {/* User Rating */}
              <Card className="rating-card" style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '8px', boxShadow: 'none' }}>
                <Card.Body style={{ padding: '20px' }}>
                  <div className="d-flex align-items-start">
                    <div className="user-avatar" style={{ marginRight: '15px' }}>
                      <Image 
                        src={rating.accountAvatar || "https://via.placeholder.com/40"} 
                        roundedCircle 
                        width={40} 
                        height={40} 
                        style={{ border: '1px solid #e0e0e0', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1" style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0' }}>
                            {rating.fullname || rating.username}
                          </h6>
                          <div className="mb-2" style={{ fontSize: '14px' }}>
                            {renderStars(rating.rating)}
                          </div>
                        </div>
                        <small style={{ color: '#999', fontSize: '12px' }}>
                          {formatDate(rating.createdAt)} | Phân loại hàng: Trắng,L
                        </small>
                      </div>
                      
                      {editingRating && editingRating.id === rating.id ? (
                        <Form onSubmit={handleEditSubmit}>
                          {renderRatingInput(editData.rating, handleEditRatingChange)}
                          <Form.Group>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={editData.content}
                              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                              style={{ 
                                resize: 'none', 
                                borderRadius: '6px', 
                                border: '1px solid #ddd', 
                                fontSize: '14px',
                                padding: '10px',
                                color: '#000'
                              }}
                            />
                          </Form.Group>
                          <div className="d-flex justify-content-end mt-2">
                            <Button 
                              variant="outline-secondary" 
                              size="sm" 
                              className="mr-2" 
                              onClick={cancelEdit}
                              style={{ marginRight: '8px', fontSize: '12px' }}
                            >
                              Hủy
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              type="submit"
                              style={{ fontSize: '12px' }}
                            >
                              Cập nhật
                            </Button>
                          </div>
                        </Form>
                      ) : (
                        <div className="rating-content mb-3">
                          {rating.content ? (
                            <p className="mb-0" style={{ fontSize: '14px', lineHeight: '1.6', color: '#333', margin: '0' }}>
                              {rating.content}
                            </p>
                          ) : (
                            <p className="mb-0 fst-italic" style={{ color: '#999', fontSize: '14px' }}>
                              Không có nội dung đánh giá
                            </p>
                          )}
                        </div>
                      )}
                      
                      {!editingRating && (
                        <div className="d-flex mt-3" style={{ gap: '15px' }}>
                          {user && user.role === "ADMIN" && !rating.adminReply && index === 0 && (
                            <Button 
                              variant="link"
                              size="sm" 
                              className="p-0"
                              style={{ color: '#1890ff', textDecoration: 'none', fontSize: '12px' }}
                              onClick={() => startReply(rating.id)}
                            >
                              <i className="fas fa-reply me-1"></i> Phản hồi
                            </Button>
                          )}
                          <Button 
                            variant="link"
                            size="sm" 
                            className="p-0"
                            style={{ color: '#1890ff', textDecoration: 'none', fontSize: '12px' }}
                            onClick={() => startEdit(rating)}
                            disabled={!(user && (user.id === rating.accountId || user.role === "ADMIN"))}
                          >
                            <i className="fas fa-edit me-1"></i> Chỉnh sửa
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0"
                            style={{ color: '#ff4d4f', textDecoration: 'none', fontSize: '12px' }}
                            onClick={() => handleDeleteRating(rating.id)}
                            disabled={!(user && (user.id === rating.accountId || user.role === "ADMIN"))}
                          >
                            <i className="fas fa-trash-alt me-1"></i> Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Admin Reply Form */}
              {replyingTo === rating.id && (
                <div style={{ marginLeft: '55px', marginTop: '10px' }}>
                  <div style={{ 
                    backgroundColor: '#fafafa', 
                    border: '1px solid #f0f0f0', 
                    borderRadius: '6px',
                    padding: '15px'
                  }}>
                    <h6 className="mb-3" style={{ color: '#666', fontSize: '13px', margin: '0 0 10px 0' }}>
                      Phản hồi của người bán
                    </h6>
                    <Form onSubmit={handleAdminReplySubmit}>
                      <Form.Group>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Nhập phản hồi của bạn..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          style={{
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            padding: "10px",
                            resize: "none",
                            color: "#000"
                          }}
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-end mt-2" style={{ gap: '8px' }}>
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          onClick={cancelReply}
                          style={{ fontSize: '12px' }}
                        >
                          Hủy
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          type="submit"
                          style={{ fontSize: '12px' }}
                        >
                          Gửi phản hồi
                        </Button>
                      </div>
                    </Form>
                  </div>
                </div>
              )}

              {/* Admin Reply Display - Only show for the first rating */}
              {rating.adminReply && index === 0 && (
                <div style={{ marginLeft: '55px', marginTop: '10px' }}>
                  <div style={{ 
                    backgroundColor: '#fafafa', 
                    border: '1px solid #f0f0f0', 
                    borderRadius: '6px',
                    padding: '15px'
                  }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 style={{ 
                        color: '#666', 
                        fontSize: '13px', 
                        margin: '0', 
                        fontWeight: '600' 
                      }}>
                        Phản Hồi Của Người Bán
                      </h6>
                      {user && user.role === "ADMIN" && !editingAdminReply && (
                        <div className="d-flex" style={{ gap: '8px' }}>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0"
                            style={{ 
                              color: '#1890ff', 
                              textDecoration: 'none', 
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => startEditAdminReply(rating.adminReply)}
                          >
                            <i className="fas fa-edit" style={{ fontSize: '10px' }}></i>
                            Sửa
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0"
                            style={{ 
                              color: '#ff4d4f', 
                              textDecoration: 'none', 
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleDeleteRating(rating.adminReply.id)}
                          >
                            <i className="fas fa-trash-alt" style={{ fontSize: '10px' }}></i>
                            Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingAdminReply && editingAdminReply.id === rating.adminReply.id ? (
                      <Form onSubmit={handleEditAdminReplySubmit}>
                        <Form.Group>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={editReplyContent}
                            onChange={(e) => setEditReplyContent(e.target.value)}
                            style={{
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              fontSize: "14px",
                              padding: "10px",
                              resize: "none",
                              backgroundColor: "#fff",
                              color: "#000"
                            }}
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-end mt-2" style={{ gap: '6px' }}>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={cancelEditAdminReply}
                            style={{ 
                              fontSize: '11px', 
                              padding: '4px 12px',
                              borderRadius: '5px'
                            }}
                          >
                            Hủy
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            type="submit"
                            style={{ 
                              fontSize: '11px', 
                              padding: '4px 12px',
                              borderRadius: '5px'
                            }}
                          >
                            Cập nhật
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      <>
                        <p style={{ 
                          fontSize: '14px', 
                          lineHeight: '1.6', 
                          color: '#333',
                          margin: '0 0 8px 0'
                        }}>
                          {rating.adminReply.content}
                        </p>
                        <small style={{ color: '#999', fontSize: '12px' }}>
                          {formatDate(rating.adminReply.createdAt)}
                        </small>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {renderPagination()}
        </>
      )}
      
      {/* Confirm Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <div style={{ 
          border: 'none',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <Modal.Header style={{ 
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e9ecef',
            paddingTop: '15px',
            paddingBottom: '15px'
          }}>
            <Modal.Title style={{ fontSize: '18px', fontWeight: '600' }}>
              Xác nhận xóa
            </Modal.Title>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Close"
            ></button>
          </Modal.Header>
          <Modal.Body style={{ padding: '20px' }}>
            <p style={{ fontSize: '16px', marginBottom: '0' }}>
              Bạn có chắc chắn muốn xóa đánh giá này?
            </p>
          </Modal.Body>
          <Modal.Footer style={{ 
            borderTop: '1px solid #e9ecef',
            padding: '15px 20px'
          }}>
            <Button 
              variant="light" 
              onClick={() => setShowDeleteModal(false)}
              style={{
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: '500'
              }}
            >
              Hủy
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              style={{
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: '500',
                backgroundColor: '#d33',
                borderColor: '#d33'
              }}
            >
              Xóa
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
};

export default ProductRatings; 