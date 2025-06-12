import React, { useState, useEffect } from "react";
import { getRatingsByProductId, getRatingsByProductIdWithCacheBust, getProductRatingStatistics, canUserRateProduct, createRating, updateRating, deleteRating, createAdminRatingReply } from "../api/RatingApi";
import { Button, Form, Card, Image, Pagination, ProgressBar, Row, Col, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import format from "date-fns/format";
import { vi } from "date-fns/locale";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const ProductRatings = ({ productId, user, orderId }) => {
  const [ratings, setRatings] = useState([]);
  const [initialRatings, setInitialRatings] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
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
  const [hasMoreRatings, setHasMoreRatings] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoadTime, setInitialLoadTime] = useState(null);
  const [shownNotificationIds, setShownNotificationIds] = useState(new Set());

  // Số lượng đánh giá hiển thị ban đầu
  const INITIAL_RATINGS_COUNT = 3;

  useEffect(() => {
    // Tải dữ liệu đánh giá khi component được tạo hoặc khi productId thay đổi
    console.log("ProductRatings - ProductID:", productId);
    console.log("Đang tải đánh giá cho sản phẩm có ID:", productId);
    
    // Ghi lại thời gian tải ban đầu
    setInitialLoadTime(new Date());
    
    // Tải dữ liệu đánh giá ban đầu
    initialLoad();

    // Tăng thời gian refresh để tránh quá nhiều request
    const interval = setInterval(() => {
      if (!loading && !document.hidden) {
        // Luôn refresh để kiểm tra phản hồi mới từ admin
        forceRefreshRatings(false);
      }
    }, 30000); // Tăng lên 30 giây để giảm tần suất thông báo
    
    setAutoRefreshInterval(interval);
    
    // Add event listener for when user returns to tab
    const handleFocus = () => {
      if (!loading) {
        // Khi tab được active lại, luôn refresh ngay lập tức
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

  // Lưu trữ ID phản hồi đã hiển thị trong localStorage
  useEffect(() => {
    // Tải danh sách ID phản hồi đã hiển thị từ localStorage khi component mount
    const loadShownNotificationIds = () => {
      try {
        const savedIds = localStorage.getItem(`shown_notification_ids_${productId}`);
        if (savedIds) {
          setShownNotificationIds(new Set(JSON.parse(savedIds)));
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách ID phản hồi đã hiển thị:", error);
      }
    };
    loadShownNotificationIds();
  }, [productId]);

  // Lưu danh sách ID phản hồi đã hiển thị vào localStorage khi thay đổi
  useEffect(() => {
    if (shownNotificationIds.size > 0) {
      try {
        localStorage.setItem(
          `shown_notification_ids_${productId}`, 
          JSON.stringify(Array.from(shownNotificationIds))
        );
      } catch (error) {
        console.error("Lỗi khi lưu danh sách ID phản hồi đã hiển thị:", error);
      }
    }
  }, [shownNotificationIds, productId]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  const initialLoad = async () => {
    try {
      // Lấy tất cả đánh giá trang 0 với size lớn hơn để có nhiều đánh giá
      const response = await getRatingsByProductId(productId, 0, 20);
      const groupedRatings = groupRatingsWithReplies(response.data.content);
      
      // Lưu tất cả đánh giá vào state
      setAllRatings(groupedRatings);
      
      // Lưu các ID phản hồi admin hiện tại vào danh sách đã hiển thị
      const initialAdminReplyIds = new Set(shownNotificationIds);
      response.data.content.forEach(item => {
        if (item.content && (item.content.includes('[ADMIN REPLY]') || item.content.includes('ADMIN REPLY TO'))) {
          initialAdminReplyIds.add(item.id);
        }
      });
      setShownNotificationIds(initialAdminReplyIds);
      
      // Chỉ hiển thị số lượng đánh giá giới hạn ban đầu (3 đánh giá đầu tiên)
      const initialDisplayRatings = groupedRatings.slice(0, INITIAL_RATINGS_COUNT);
      setRatings(initialDisplayRatings);
      setInitialRatings(initialDisplayRatings);
      
      setTotalPages(response.data.totalPages);
      setCurrentPage(0);
      // Có thêm đánh giá để xem nếu tổng số lớn hơn số lượng hiển thị ban đầu
      setHasMoreRatings(groupedRatings.length > INITIAL_RATINGS_COUNT);
      setIsExpanded(false);
      
      loadStatistics();
      if (user) {
        checkCanRate();
      }
    } catch (error) {
      console.error("Error during initial ratings load:", error);
    }
  };

  const loadRatings = (page, append = false) => {
    setLoading(true);
    // Tăng size để lấy nhiều đánh giá hơn trong 1 lần tải
    getRatingsByProductId(productId, page, 20)
      .then((res) => {
        // Group ratings by non-admin ratings and their corresponding admin replies
        const groupedRatings = groupRatingsWithReplies(res.data.content);
        
        if (append) {
          // Thêm đánh giá mới vào danh sách tất cả đánh giá
          const newAllRatings = [...allRatings, ...groupedRatings];
          setAllRatings(newAllRatings);
          // Hiển thị tất cả đánh giá khi xem thêm
          setRatings(newAllRatings);
        } else {
          // Lưu tất cả đánh giá
          setAllRatings(groupedRatings);
          
          // Nếu là trang đầu tiên, chỉ hiển thị số lượng ban đầu
          if (page === 0) {
            const initialDisplayRatings = groupedRatings.slice(0, INITIAL_RATINGS_COUNT);
            setRatings(initialDisplayRatings);
            setInitialRatings(initialDisplayRatings);
            setIsExpanded(false);
          } else {
            setRatings(groupedRatings);
          }
        }
        
        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
        // Determine if there are more ratings to load
        setHasMoreRatings(page < res.data.totalPages - 1 || 
                          (page === 0 && groupedRatings.length > INITIAL_RATINGS_COUNT));
        setLoading(false);
        setLoadingMore(false);
      })
      .catch((error) => {
        console.error("Error loading ratings:", error);
        setLoading(false);
        setLoadingMore(false);
      });
  };

  const forceRefreshRatings = (showLoading = true) => {
    // Force refresh with cache busting
    if (showLoading) {
      setLoading(true);
    }
    
    // Thêm timestamp để đảm bảo không có cache
    const timestamp = new Date().getTime();
    
    getRatingsByProductIdWithCacheBust(productId, 0, 10, "createdAt", "desc")
      .then((res) => {
        console.log("Force refresh ratings response:", res.data); // Debug log
        
        // Check if there are new admin replies
        const newRatingCount = res.data.totalElements || res.data.content.length;
        
        // Lưu dữ liệu đánh giá hiện tại trước khi cập nhật
        const currentRatingsMap = new Map();
        ratings.forEach(rating => {
          currentRatingsMap.set(rating.id, rating);
          // Nếu rating có adminReply, cũng lưu nó
          if (rating.adminReply) {
            currentRatingsMap.set(rating.adminReply.id, rating.adminReply);
          }
        });
        
        // Tìm ra các phản hồi admin mới chưa từng hiển thị thông báo
        const newAdminReplies = res.data.content.filter(item => {
          // Kiểm tra xem có phải phản hồi admin không
          const isAdminReply = item.content && 
            (item.content.includes('[ADMIN REPLY]') || item.content.includes('ADMIN REPLY TO'));
          
          if (!isAdminReply) return false;
          
          // Kiểm tra xem phản hồi này đã hiển thị thông báo chưa
          const notifiedBefore = shownNotificationIds.has(item.id);
          
          // Kiểm tra xem đây có phải là phản hồi mới/cập nhật không
          const existingItem = currentRatingsMap.get(item.id);
          const isNewOrUpdated = !existingItem || 
            new Date(item.updatedAt) > new Date(existingItem.updatedAt);
          
          // Kiểm tra thêm: phản hồi phải được tạo/cập nhật sau khi component được tải
          const isCreatedAfterInitialLoad = initialLoadTime && 
            new Date(item.updatedAt || item.createdAt) > initialLoadTime;
          
          // Chỉ trả về true nếu là phản hồi admin mới, chưa hiển thị thông báo và tạo sau khi trang được tải
          return isAdminReply && !notifiedBefore && isNewOrUpdated && isCreatedAfterInitialLoad;
        });
        
        if (newAdminReplies.length > 0) {
          console.log("Phát hiện phản hồi admin mới:", newAdminReplies.length);
          setHasNewRatings(true);
          
          // Thêm ID của các phản hồi mới vào danh sách đã hiển thị thông báo
          const newIds = new Set(shownNotificationIds);
          newAdminReplies.forEach(reply => {
            newIds.add(reply.id);
            console.log("Đã thêm ID phản hồi vào danh sách đã hiển thị:", reply.id);
          });
          setShownNotificationIds(newIds);
          
          // Chỉ hiển thị một thông báo duy nhất cho tất cả các phản hồi mới
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
        
        // Reset the flag after checking
        if (justSentRating) {
          setJustSentRating(false);
        }
        
        setLastRatingCount(newRatingCount);
        
        // Group ratings by non-admin ratings and their corresponding admin replies
        const groupedRatings = groupRatingsWithReplies(res.data.content);
        setRatings(groupedRatings);
        setTotalPages(res.data.totalPages);
        setCurrentPage(0);
        setHasMoreRatings(res.data.totalPages > 1);
        
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
        getRatingsByProductId(productId, 0, 10, "createdAt", "desc")
          .then((res) => {
            const groupedRatings = groupRatingsWithReplies(res.data.content);
            setRatings(groupedRatings);
            setTotalPages(res.data.totalPages);
            setCurrentPage(0);
            setHasMoreRatings(res.data.totalPages > 1);
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

  const loadMoreRatings = () => {
    if (!loadingMore) {
      setIsExpanded(true);
      
      if (allRatings.length > INITIAL_RATINGS_COUNT) {
        // Nếu đã tải đủ đánh giá, chỉ cần hiển thị tất cả
        setRatings(allRatings);
      } else if (hasMoreRatings) {
        // Nếu chưa tải đủ và còn trang tiếp theo, tải thêm
        setLoadingMore(true);
        const nextPage = currentPage + 1;
        loadRatings(nextPage, true);
      }
    }
  };

  const collapseRatings = () => {
    // Trước khi thu gọn, cần đảm bảo các phản hồi admin được giữ lại
    const updatedInitialRatings = [...initialRatings];
    
    // Tạo Map để theo dõi các đánh giá trong initialRatings theo ID
    const initialRatingsMap = new Map();
    initialRatings.forEach((rating, index) => {
      initialRatingsMap.set(rating.id, index);
    });
    
    // Duyệt qua tất cả đánh giá hiện tại để cập nhật phản hồi admin
    allRatings.forEach(rating => {
      // Nếu đánh giá này có trong initialRatings và có phản hồi admin
      if (initialRatingsMap.has(rating.id) && rating.adminReply) {
        const index = initialRatingsMap.get(rating.id);
        updatedInitialRatings[index].adminReply = rating.adminReply;
      }
    });
    
    // Cập nhật initialRatings với thông tin phản hồi admin mới nhất
    setInitialRatings(updatedInitialRatings);
    
    // Thu gọn về chỉ hiển thị số đánh giá ban đầu
    setRatings(updatedInitialRatings);
    setIsExpanded(false);
  };

  const groupRatingsWithReplies = (ratingsData) => {
    const userRatings = [];
    const adminReplies = [];
    
    // Separate user ratings and admin replies
    ratingsData.forEach(rating => {
      // Hỗ trợ cả định dạng phản hồi cũ và mới
      if (rating.content && (rating.content.startsWith('[ADMIN REPLY') || rating.content.includes('ADMIN REPLY'))) {
        console.log("Phát hiện phản hồi admin:", rating);
        
        // Xử lý cả định dạng cũ và mới
        let replyToId = null;
        // Định dạng mới: [ADMIN REPLY TO X]
        const replyToMatch = rating.content.match(/\[ADMIN REPLY TO (\d+)\]/);
        if (replyToMatch) {
          replyToId = parseInt(replyToMatch[1]);
        }
        
        // Loại bỏ prefix và lưu phản hồi
        const cleanContent = rating.content
          .replace(/\[ADMIN REPLY TO \d+\]/, '')
          .replace('[ADMIN REPLY]', '')
          .trim();
          
        adminReplies.push({
          ...rating,
          content: cleanContent,
          replyToId
        });
        
        console.log("Đã xử lý phản hồi admin:", {
          id: rating.id,
          content: cleanContent,
          replyToId
        });
      } else {
        userRatings.push(rating);
      }
    });

    // Update the count of actual user ratings (excluding admin replies)
    setUserRatingsCount(userRatings.length);
    console.log("Tổng số đánh giá người dùng:", userRatings.length);
    console.log("Tổng số phản hồi admin:", adminReplies.length);
    
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

    // Tạo ánh xạ giữa ID của đánh giá người dùng và phản hồi của admin
    const userRatingMap = new Map();
    userRatings.forEach(rating => {
      userRatingMap.set(rating.id, { ...rating, adminReply: null });
    });
    
    // Gán phản hồi admin cho đánh giá tương ứng
    adminReplies.forEach(reply => {
      if (reply.replyToId && userRatingMap.has(reply.replyToId)) {
        // Nếu có replyToId và tìm thấy đánh giá tương ứng, gán phản hồi
        userRatingMap.get(reply.replyToId).adminReply = reply;
      }
    });
    
    // Chuyển đổi Map thành mảng kết quả
    const mappedRatings = Array.from(userRatingMap.values());
    
    // Sắp xếp để đánh giá có phản hồi admin nằm trên cùng, sau đó theo thời gian mới nhất
    mappedRatings.sort((a, b) => {
      // Nếu a có phản hồi admin và b không có, a hiển thị trước
      if (a.adminReply && !b.adminReply) return -1;
      // Nếu b có phản hồi admin và a không có, b hiển thị trước
      if (!a.adminReply && b.adminReply) return 1;
      // Nếu cả hai đều có hoặc đều không có phản hồi, sắp xếp theo thời gian mới nhất
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return mappedRatings;
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
    
    // Render đúng số sao được đánh giá, không hiển thị nửa sao
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        // Full star
        stars.push(
          <span key={i} style={{ color: starColor, marginRight: '2px' }}>
            <FaStar />
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} style={{ color: '#e8e8e8', marginRight: '2px' }}>
            <FaRegStar />
          </span>
        );
      }
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

    // Đảm bảo chúng ta có id của đánh giá đang được trả lời
    if (!replyingTo) {
      toast.warning("Không xác định được đánh giá cần trả lời");
      return;
    }

    // Chuẩn hóa định dạng phản hồi admin
    const replyData = {
      productId: productId,
      // Sử dụng định dạng cũ vì backend có thể không xử lý được định dạng mới
      content: `[ADMIN REPLY] ${replyContent}`,
      replyToRatingId: replyingTo // Truyền ID đánh giá cần phản hồi như một trường riêng
    };

    console.log("Đang gửi phản hồi admin:", replyData);

    createAdminRatingReply(replyData)
      .then((response) => {
        console.log("Phản hồi thành công:", response.data);
        toast.success("Phản hồi thành công");
        setReplyingTo(null);
        setReplyContent("");
        
        // Reset to page 0 after admin reply
        setCurrentPage(0);
        
        // Refresh page 0 instead of current page
        getRatingsByProductIdWithCacheBust(productId, 0, 10, "createdAt", "desc")
          .then((res) => {
            const groupedRatings = groupRatingsWithReplies(res.data.content);
            setRatings(groupedRatings);
            setTotalPages(res.data.totalPages);
          })
          .catch((error) => {
            console.error("Error refreshing ratings after reply:", error);
            // Fallback to standard loading
            loadRatings(0);
          });
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
    // Lưu id của đánh giá đang được trả lời
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
        
        // Reset to page 0 after editing admin reply
        setCurrentPage(0);
        
        // Refresh page 0 instead of current page
        getRatingsByProductIdWithCacheBust(productId, 0, 10, "createdAt", "desc")
          .then((res) => {
            const groupedRatings = groupRatingsWithReplies(res.data.content);
            setRatings(groupedRatings);
            setTotalPages(res.data.totalPages);
          })
          .catch((error) => {
            console.error("Error refreshing ratings after editing reply:", error);
            // Fallback to standard loading
            loadRatings(0);
          });
      })
      .catch((error) => {
        console.error("Error updating admin reply:", error);
        toast.error("Có lỗi xảy ra khi cập nhật phản hồi");
      });
  };

  // Tính toán đánh giá trung bình chính xác dựa trên dữ liệu thực tế của tất cả đánh giá
  const calculateExactRating = () => {
    // Nếu không có đánh giá nào, trả về 0
    if (!allRatings || allRatings.length === 0) {
      return 0;
    }
    
    // Nếu chỉ có 1 đánh giá, trả về chính xác giá trị đánh giá đó
    if (allRatings.length === 1) {
      return allRatings[0].rating;
    }
    
    // Nếu có nhiều đánh giá, tính tổng số sao và chia cho số lượng đánh giá
    let totalStars = 0;
    let totalRatings = 0;
    
    // Duyệt qua tất cả đánh giá và tính tổng (sử dụng allRatings thay vì ratings)
    allRatings.forEach(rating => {
      if (rating && rating.rating) {
        totalStars += rating.rating;
        totalRatings++;
      }
    });
    
    // Tính trung bình, làm tròn đến 1 chữ số thập phân và trả về
    const avgRating = totalRatings > 0 ? totalStars / totalRatings : 0;
    return Math.round(avgRating * 10) / 10; // Làm tròn đến 1 chữ số thập phân
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
                {/* Hiển thị số sao trung bình với tối đa 1 chữ số thập phân */}
                {calculateExactRating().toFixed(1)}
              </h2>
              <div className="mb-2" style={{ fontSize: '18px' }}>
                {/* Hiển thị sao dựa trên giá trị đánh giá chính xác */}
                {renderStars(calculateExactRating())}
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
          <div className="ratings-list">
            {ratings.map((rating, index) => (
              <div 
                key={rating.id} 
                className="mb-4 p-4" 
                style={{ 
                  backgroundColor: rating.adminReply ? '#fafff7' : '#fff',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Hiển thị đánh giá của người dùng */}
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
                  <>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 5px 0' }}>
                          {rating.fullname || rating.username || "Người dùng ẩn danh"}
                        </h5>
                        <div className="mb-1">
                          {renderStars(rating.rating)}
                        </div>
                      </div>
                      <small style={{ color: '#999', fontSize: '12px' }}>
                        {formatDate(rating.createdAt)} | Phân loại hàng: Trắng,L
                      </small>
                    </div>
                    <p style={{ fontSize: '14px', margin: '0 0 15px 0' }}>{rating.content}</p>
                    
                    {/* Hiển thị nút Chỉnh sửa/Xóa nếu đánh giá là của người dùng hiện tại */}
                    {user && (user.id === rating.accountId || user.role === "ADMIN") && (
                      <div className="rating-actions d-flex">
                        {user.id === rating.accountId && (
                          <>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-primary p-0 me-3"
                              onClick={() => startEdit(rating)}
                              style={{ fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', height: '28px' }}
                            >
                              <i className="far fa-edit me-1"></i> Chỉnh sửa
                            </Button>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-danger p-0"
                              onClick={() => handleDeleteRating(rating.id)}
                              style={{ fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', height: '28px' }}
                            >
                              <i className="far fa-trash-alt me-1"></i> Xóa
                            </Button>
                          </>
                        )}
                        {/* Thêm nút Trả lời cho admin */}
                        {user.role === "ADMIN" && !rating.adminReply && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-primary p-0 me-3"
                            onClick={() => startReply(rating.id)}
                            style={{ fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', height: '28px' }}
                          >
                            <i className="far fa-comment me-1"></i> Trả lời
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {/* Hiển thị phản hồi của admin nếu có */}
                {rating.adminReply && (
                  <div 
                    className="mt-3 pt-3" 
                    style={{ 
                      borderTop: '1px dashed #e8e8e8',
                      paddingLeft: '20px'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        margin: '0',
                        color: '#389e0d'
                      }}>
                        <i className="fas fa-store me-1"></i> Phản Hồi Của Người Bán
                      </h6>
                      <small style={{ color: '#999', fontSize: '12px' }}>
                        {formatDate(rating.adminReply.createdAt)}
                      </small>
                    </div>
                    
                    {editingAdminReply && editingAdminReply.id === rating.adminReply.id ? (
                      <Form onSubmit={handleEditAdminReplySubmit}>
                        <Form.Group className="mb-3">
                          <Form.Control 
                            as="textarea" 
                            rows={3}
                            value={editReplyContent}
                            onChange={(e) => setEditReplyContent(e.target.value)}
                            placeholder="Nhập nội dung phản hồi..."
                            required
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={cancelEditAdminReply}
                            className="me-2"
                          >
                            Hủy
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            type="submit"
                          >
                            Cập nhật
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      <>
                        <p style={{ fontSize: '14px', margin: '0 0 10px 0' }}>
                          {rating.adminReply.content}
                        </p>
                        {/* Hiển thị nút chỉnh sửa phản hồi cho admin */}
                        {user && user.role === "ADMIN" && (
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-primary p-0"
                              onClick={() => startEditAdminReply(rating.adminReply)}
                              style={{ fontSize: '13px', textDecoration: 'none' }}
                            >
                              <i className="far fa-edit me-1"></i> Sửa phản hồi
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {/* Form trả lời của admin */}
                {replyingTo === rating.id && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px dashed #e8e8e8' }}>
                    <Form onSubmit={handleAdminReplySubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <span style={{ color: '#389e0d', fontWeight: '500' }}>
                            <i className="fas fa-store me-1"></i> Phản hồi với tư cách người bán
                          </span>
                        </Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={3}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Nhập nội dung phản hồi..."
                          required
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-end">
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          onClick={cancelReply}
                          className="me-2"
                        >
                          Hủy
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          type="submit"
                        >
                          Gửi phản hồi
                        </Button>
                      </div>
                    </Form>
                  </div>
                )}
              </div>
            ))}
            
            {/* Nút xem thêm và thu gọn */}
            <div className="d-flex justify-content-center mt-4">
              {isExpanded && (
                <Button 
                  variant="outline-secondary" 
                  onClick={collapseRatings}
                  style={{
                    borderRadius: '20px',
                    padding: '8px 24px',
                    fontSize: '14px',
                    marginRight: '12px'
                  }}
                >
                  <i className="fas fa-chevron-up me-2"></i>
                  Thu gọn
                </Button>
              )}
              
              {(hasMoreRatings || (allRatings.length > INITIAL_RATINGS_COUNT && !isExpanded)) && (
                <Button 
                  variant="outline-primary" 
                  onClick={loadMoreRatings}
                  disabled={loadingMore}
                  style={{
                    borderRadius: '20px',
                    padding: '8px 24px',
                    fontSize: '14px'
                  }}
                >
                  {loadingMore ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-chevron-down me-2"></i>
                      Xem thêm đánh giá
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
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