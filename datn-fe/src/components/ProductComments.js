import React, { useState, useEffect } from "react";
import { getCommentsByProductId, getCommentsByProductIdWithCacheBust, getRepliesByCommentId, createComment, updateComment, deleteComment } from "../api/CommentApi";
import { Button, Form, Card, Image, Pagination, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import format from "date-fns/format";
import { vi } from "date-fns/locale";

const ProductComments = ({ productId, user }) => {
  const [comments, setComments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
  const [hasNewComments, setHasNewComments] = useState(false);
  const [lastCommentCount, setLastCommentCount] = useState(0);
  const [justSentComment, setJustSentComment] = useState(false);

  useEffect(() => {
    loadComments(0);
    
    // Set up auto-refresh every 10 seconds to check for new comments from admin
    const interval = setInterval(() => {
      if (!loading && !replyLoading && !document.hidden && !justSentComment) {
        // Only refresh if page is visible and user didn't just send a comment
        forceRefreshComments(false);
      }
    }, 10000); // Refresh every 10 seconds
    
    setAutoRefreshInterval(interval);
    
    // Add event listener for when user returns to tab
    const handleFocus = () => {
      if (!loading && !replyLoading && !justSentComment) {
        forceRefreshComments(false);
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
  }, [productId]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  const loadComments = (page) => {
    setLoading(true);
    getCommentsByProductId(productId, page)
      .then((res) => {
        setComments(res.data.content);
        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading comments:", error);
        setLoading(false);
      });
  };

  const forceRefreshComments = (showLoading = true) => {
    // Force refresh with cache busting
    if (showLoading) {
      setLoading(true);
    }
    
    getCommentsByProductIdWithCacheBust(productId, currentPage, 10, "createdAt", "desc")
      .then((res) => {
        console.log("Force refresh response:", res.data); // Debug log
        
        // Check if there are new comments from admin/seller (not from current user)
        const newCommentCount = res.data.totalElements || res.data.content.length;
        if (lastCommentCount > 0 && newCommentCount > lastCommentCount && !justSentComment) {
          // Check if the newest comments are from admin or other users (not current user)
          const newestComments = res.data.content.slice(0, newCommentCount - lastCommentCount);
          const hasAdminOrOtherUserComments = newestComments.some(comment => 
            comment.role === 'ADMIN' || 
            (user && comment.accountId !== user.id)
          );
          
          if (hasAdminOrOtherUserComments) {
            setHasNewComments(true);
            // Show different notification based on comment source
            const hasAdminComment = newestComments.some(comment => comment.role === 'ADMIN');
            if (hasAdminComment) {
              toast.info("💬 Có phản hồi mới từ người bán!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            } else {
              toast.info("💬 Có bình luận mới!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
            // Auto-clear the notification after 5 seconds
            setTimeout(() => setHasNewComments(false), 5000);
          }
        }
        
        // Reset the flag after checking
        if (justSentComment) {
          setJustSentComment(false);
        }
        
        setLastCommentCount(newCommentCount);
        
        setComments(res.data.content);
        setTotalPages(res.data.totalPages);
        if (showLoading) {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error force refreshing comments:", error);
        if (showLoading) {
          setLoading(false);
        }
        // Fallback to regular refresh if cache bust fails
        getCommentsByProductId(productId, currentPage, 10, "createdAt", "desc")
          .then((res) => {
            setComments(res.data.content);
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

  const handlePageChange = (page) => {
    loadComments(page);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!newComment.trim()) {
      toast.warning("Vui lòng nhập nội dung bình luận");
      return;
    }

    const commentData = {
      productId: productId,
      content: newComment,
      parentCommentId: null
    };

    createComment(commentData)
      .then(() => {
        toast.success("Bình luận thành công");
        setNewComment("");
        setJustSentComment(true); // Mark that user just sent a comment
        // Immediate refresh without loading indicator
        forceRefreshComments(false);
        
        // Backup refresh to ensure consistency
        setTimeout(() => {
          forceRefreshComments(false);
        }, 100);
      })
      .catch((error) => {
        console.error("Error creating comment:", error);
        toast.error("Có lỗi xảy ra khi gửi bình luận");
      });
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Vui lòng đăng nhập để trả lời bình luận");
      return;
    }

    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung trả lời");
      return;
    }

    if (replyLoading) return; // Prevent double submission

    setReplyLoading(true);
    const replyData = {
      productId: productId,
      content: replyContent,
      parentCommentId: replyingTo
    };

    createComment(replyData)
      .then(() => {
        toast.success("Trả lời bình luận thành công");
        setReplyingTo(null);
        setReplyContent("");
        setReplyLoading(false);
        setJustSentComment(true); // Mark that user just sent a comment
        // Immediate refresh without loading indicator
        forceRefreshComments(false);
        setRefreshKey(prev => prev + 1);
        
        // Backup refresh after short delay to ensure data consistency
        setTimeout(() => {
          forceRefreshComments(false);
        }, 200);
      })
      .catch((error) => {
        console.error("Error replying to comment:", error);
        toast.error("Có lỗi xảy ra khi trả lời bình luận");
        setReplyLoading(false);
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim()) {
      toast.warning("Vui lòng nhập nội dung chỉnh sửa");
      return;
    }

    const editData = {
      productId: productId,
      content: editContent
    };

    updateComment(editingComment.id, editData)
      .then(() => {
        toast.success("Chỉnh sửa bình luận thành công");
        setEditingComment(null);
        setEditContent("");
        // Immediate refresh without loading indicator
        forceRefreshComments(false);
        
        // Backup refresh to ensure consistency
        setTimeout(() => {
          forceRefreshComments(false);
        }, 100);
      })
      .catch((error) => {
        console.error("Error updating comment:", error);
        toast.error("Có lỗi xảy ra khi chỉnh sửa bình luận");
      });
  };

    // State for custom confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (!commentToDelete) return;
    
    deleteComment(commentToDelete)
      .then(() => {
        toast.success("Xóa bình luận thành công");
        // Immediate refresh without loading indicator
        forceRefreshComments(false);
        
        // Backup refresh to ensure consistency
        setTimeout(() => {
          forceRefreshComments(false);
        }, 100);
        setShowDeleteModal(false);
        setCommentToDelete(null);
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
        toast.error("Có lỗi xảy ra khi xóa bình luận");
        setShowDeleteModal(false);
        setCommentToDelete(null);
      });
  };

  const startReply = (commentId) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để trả lời bình luận");
      return;
    }
    setReplyingTo(commentId);
    setReplyContent("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const startEdit = (comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
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
        &#8249;
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
        &#8250;
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

  const renderReplies = (replies) => {
    if (!replies || replies.length === 0) return null;

    return replies.map((reply) => (
      <div key={reply.id} style={{ marginLeft: '50px', marginTop: '15px', position: 'relative' }}>
        {/* Connection line */}
        <div style={{
          position: 'absolute',
          left: '-25px',
          top: '20px',
          width: '20px',
          height: '1px',
          backgroundColor: '#e0e0e0'
        }}></div>
        <div style={{
          position: 'absolute',
          left: '-25px',
          top: '-15px',
          width: '1px',
          height: '35px',
          backgroundColor: '#e0e0e0'
        }}></div>
        
        <div style={{ 
          backgroundColor: '#fff',
          padding: '12px 0'
        }}>
          <div className="d-flex align-items-start">
            <div style={{ marginRight: '12px', flexShrink: 0 }}>
              <Image 
                src={reply.accountAvatar || "https://via.placeholder.com/32"} 
                roundedCircle 
                width={32} 
                height={32} 
                style={{ border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', objectFit: 'cover' }}
              />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center mb-1" style={{ gap: '8px' }}>
                <h6 style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#1a1a1a', 
                  margin: '0' 
                }}>
                  {reply.role === 'ADMIN' ? 'Phản Hồi Của Người Bán' : (reply.fullname || reply.username)}
                </h6>
                <small style={{ color: '#8a8a8a', fontSize: '11px' }}>
                  {formatDate(reply.createdAt)}
                </small>
              </div>
              
              {editingComment && editingComment.id === reply.id ? (
                <Form onSubmit={handleEditSubmit}>
                  <Form.Group>
                                          <Form.Control
                        as="textarea"
                        rows={2}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "13px",
                          padding: "8px 12px",
                          resize: "none",
                          backgroundColor: "#fafafa",
                          color: "#000"
                        }}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end mt-2" style={{ gap: '6px' }}>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={cancelEdit}
                      style={{ 
                        fontSize: '11px', 
                        padding: '4px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d0d0d0'
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
                        borderRadius: '6px'
                      }}
                    >
                      Lưu
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <p style={{ 
                    fontSize: '13px', 
                    lineHeight: '1.5', 
                    color: '#333', 
                    margin: '0 0 8px 0',
                    wordWrap: 'break-word'
                  }}>
                    {reply.content}
                  </p>
                  
                                      {user && (user.id === reply.accountId || user.role === "ADMIN") && !editingComment && (
                      <div className="d-flex align-items-center" style={{ gap: '12px', marginTop: '6px' }}>
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
                          onClick={() => startEdit(reply)}
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
                          onClick={() => handleDeleteComment(reply.id)}
                        >
                          <i className="fas fa-trash-alt" style={{ fontSize: '10px' }}></i>
                          Xóa
                        </Button>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="product-comments mt-5">
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
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '10px',
          margin: '0',
          position: 'relative'
        }}>
          Bình luận ({comments.length})
          {hasNewComments && (
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
          onClick={forceRefreshComments}
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
      
      {user && (
        <div className="mb-4" style={{ 
          backgroundColor: '#fafafa',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <Form onSubmit={handleCommentSubmit}>
            <div className="d-flex align-items-start" style={{ gap: '12px' }}>
              <Image 
                src={user.avatar || "https://via.placeholder.com/40"} 
                roundedCircle 
                width={40} 
                height={40} 
                style={{ 
                  border: '2px solid #fff', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
              <div className="flex-grow-1">
                <Form.Group>
                                      <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={`${user.fullname || user.username}, hãy viết bình luận của bạn...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        padding: "12px",
                        resize: "none",
                        backgroundColor: "#fff",
                        color: "#000"
                      }}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end mt-2">
                  <Button 
                    variant="primary" 
                    type="submit"
                    style={{ 
                      fontSize: '13px',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontWeight: '500'
                    }}
                  >
                    Đăng bình luận
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p className="mt-2 mb-0" style={{ color: '#666', fontSize: '14px' }}>
            Đang tải bình luận...
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-5" style={{ 
          backgroundColor: '#fafafa', 
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <i className="fas fa-comments" style={{ fontSize: '48px', color: '#d0d0d0', marginBottom: '12px' }}></i>
          <p style={{ color: '#999', fontSize: '16px', margin: '0' }}>
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: '#fff' }}>
            {comments.map((comment, commentIndex) => (
              <div key={comment.id} style={{ 
                borderBottom: commentIndex < comments.length - 1 ? '1px solid #f0f0f0' : 'none',
                paddingBottom: '20px',
                marginBottom: '20px'
              }}>
                {/* Main Comment */}
                <div style={{ padding: '0' }}>
                  <div className="d-flex align-items-start">
                    <div style={{ marginRight: '12px', flexShrink: 0 }}>
                      <Image 
                        src={comment.accountAvatar || "https://via.placeholder.com/40"} 
                        roundedCircle 
                        width={40} 
                        height={40} 
                        style={{ 
                          border: '2px solid #fff', 
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2" style={{ gap: '8px' }}>
                        <h6 style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#1a1a1a', 
                          margin: '0' 
                        }}>
                          {comment.role === 'ADMIN' ? 'Phản Hồi Của Người Bán' : (comment.fullname || comment.username)}
                        </h6>
                        <small style={{ color: '#8a8a8a', fontSize: '12px' }}>
                          {formatDate(comment.createdAt)}
                        </small>
                      </div>
                      
                      {editingComment && editingComment.id === comment.id ? (
                        <Form onSubmit={handleEditSubmit}>
                          <Form.Group>
                                                          <Form.Control
                                as="textarea"
                                rows={3}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                style={{
                                  border: "1px solid #e0e0e0",
                                  borderRadius: "8px",
                                  fontSize: "14px",
                                  padding: "12px",
                                  resize: "none",
                                  backgroundColor: "#fafafa",
                                  color: "#000"
                                }}
                            />
                          </Form.Group>
                          <div className="d-flex justify-content-end mt-2" style={{ gap: '8px' }}>
                            <Button 
                              variant="outline-secondary" 
                              size="sm" 
                              onClick={cancelEdit}
                              style={{ 
                                fontSize: '12px',
                                padding: '6px 16px',
                                borderRadius: '6px'
                              }}
                            >
                              Hủy
                            </Button>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              type="submit"
                              style={{ 
                                fontSize: '12px',
                                padding: '6px 16px',
                                borderRadius: '6px'
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
                            margin: '0 0 12px 0',
                            wordWrap: 'break-word'
                          }}>
                            {comment.content}
                          </p>
                          
                          <div className="d-flex align-items-center" style={{ gap: '20px' }}>
                            {user && (
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0"
                                style={{ 
                                  color: '#666', 
                                  textDecoration: 'none', 
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onClick={() => startReply(comment.id)}
                              >
                                <i className="fas fa-reply" style={{ fontSize: '11px' }}></i>
                                Trả lời
                              </Button>
                            )}
                            
                            {user && (user.id === comment.accountId || user.role === "ADMIN") && !editingComment && (
                              <>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="p-0"
                                  style={{ 
                                    color: '#1890ff', 
                                    textDecoration: 'none', 
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                  onClick={() => startEdit(comment)}
                                >
                                  <i className="fas fa-edit" style={{ fontSize: '11px' }}></i>
                                  Sửa
                                </Button>
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="p-0"
                                  style={{ 
                                    color: '#ff4d4f', 
                                    textDecoration: 'none', 
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <i className="fas fa-trash-alt" style={{ fontSize: '11px' }}></i>
                                  Xóa
                                </Button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div style={{ marginLeft: '52px', marginTop: '15px' }}>
                    <div style={{ 
                      backgroundColor: '#fafafa', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px',
                      padding: '15px'
                    }}>
                      <Form onSubmit={handleReplySubmit}>
                        <div className="d-flex align-items-start" style={{ gap: '10px' }}>
                          <Image 
                            src={user?.avatar || "https://via.placeholder.com/32"} 
                            roundedCircle 
                            width={32} 
                            height={32} 
                            style={{ 
                              border: '2px solid #fff', 
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                          />
                          <div className="flex-grow-1">
                            <Form.Group>
                                                              <Form.Control
                                  as="textarea"
                                  rows={2}
                                  placeholder="Viết trả lời của bạn..."
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  style={{
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    padding: "10px",
                                    resize: "none",
                                    backgroundColor: "#fff",
                                    color: "#000"
                                  }}
                              />
                            </Form.Group>
                            <div className="d-flex justify-content-end mt-2" style={{ gap: '8px' }}>
                              <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                onClick={cancelReply}
                                style={{ 
                                  fontSize: '11px',
                                  padding: '5px 12px',
                                  borderRadius: '5px'
                                }}
                              >
                                Hủy
                              </Button>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                type="submit"
                                disabled={replyLoading}
                                style={{ 
                                  fontSize: '11px',
                                  padding: '5px 12px',
                                  borderRadius: '5px'
                                }}
                              >
                                {replyLoading ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Đang gửi...
                                  </>
                                ) : (
                                  'Trả lời'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {renderReplies(comment.replies)}
              </div>
            ))}
          </div>
          
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
              Bạn có chắc chắn muốn xóa bình luận này?
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

export default ProductComments; 