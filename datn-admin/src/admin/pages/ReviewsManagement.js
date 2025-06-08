import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap";
import { getAllRatingsForAdmin, deleteRating, createAdminRatingReply, updateRating } from "../../api/RatingApi";

const ReviewsManagement = () => {
  const [ratings, setRatings] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [editRatingValue, setEditRatingValue] = useState(5);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadRatings();
  }, [page]);

  const loadRatings = async () => {
    try {
      const response = await getAllRatingsForAdmin(page - 1, 20);
      setRatings(response.content);
      setTotal(response.totalPages);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
      toast.error("Không thể tải danh sách đánh giá");
    }
  };

  const onChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleShowReplyModal = (rating) => {
    setSelectedRating(rating);
    setReplyContent("");
    setShowReplyModal(true);
  };

  const handleCloseReplyModal = () => {
    setShowReplyModal(false);
    setSelectedRating(null);
    setReplyContent("");
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung trả lời");
      return;
    }

    const replyData = {
      productId: selectedRating.productId,
      content: replyContent // Không cần thêm [ADMIN REPLY] prefix ở đây vì backend sẽ thêm
    };

    try {
      await createAdminRatingReply(replyData);
      toast.success("Trả lời đánh giá thành công");
      handleCloseReplyModal();
      loadRatings();
    } catch (error) {
      console.error("Lỗi khi trả lời đánh giá:", error);
      toast.error("Không thể trả lời đánh giá");
    }
  };

  const handleShowDeleteModal = (rating) => {
    setRatingToDelete(rating);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setRatingToDelete(null);
  };

  const handleDeleteRating = () => {
    deleteRating(ratingToDelete.id)
      .then(() => {
        toast.success("Xóa đánh giá thành công");
        handleCloseDeleteModal();
        loadRatings();
      })
      .catch((error) => {
        console.error("Lỗi khi xóa đánh giá:", error);
        toast.error("Không thể xóa đánh giá");
      });
  };

  const handleShowEditModal = (rating) => {
    setEditingRating(rating);
    setEditRatingValue(rating.rating);
    
    // Remove [ADMIN REPLY] prefix for editing if it exists
    let contentForEdit = rating.content || "";
    if (contentForEdit.startsWith('[ADMIN REPLY]')) {
      contentForEdit = contentForEdit.replace('[ADMIN REPLY]', '').trim();
    }
    
    setEditContent(contentForEdit);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingRating(null);
    setEditRatingValue(5);
    setEditContent("");
  };

  const handleSubmitEdit = async () => {
    // Check if original content had [ADMIN REPLY] prefix
    let finalContent = editContent;
    let finalRating = editRatingValue;
    
    if (editingRating.content && editingRating.content.startsWith('[ADMIN REPLY]')) {
      finalContent = `[ADMIN REPLY] ${editContent}`;
      finalRating = 5; // Admin replies always have 5 stars
    }
    
    const editData = {
      rating: finalRating,
      content: finalContent,
      productId: editingRating.productId
      // No orderId needed for admin endpoint
    };

    try {
      await updateRating(editingRating.id, editData);
      toast.success("Cập nhật đánh giá thành công");
      handleCloseEditModal();
      loadRatings();
    } catch (error) {
      console.error("Lỗi khi cập nhật đánh giá:", error);
      toast.error("Không thể cập nhật đánh giá");
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`fa fa-star ${index < rating ? "text-warning" : "text-muted"}`}
        aria-hidden="true"
      ></i>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  var rows = new Array(total).fill(0).map((zero, index) => (
    <li
      className={page === index + 1 ? "page-item active" : "page-item"}
      key={index}
    >
      <button
        className="page-link"
        style={{ borderRadius: 50 }}
        onClick={() => onChangePage(index + 1)}
      >
        {index + 1}
      </button>
    </li>
  ));

  return (
    <div className="card">
      <div className="card__header mb-4">
        <h3>Quản lý Đánh giá</h3>
      </div>
      
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="bg-light">
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Khách hàng</th>
              <th scope="col">Sản phẩm</th>
              <th scope="col">Đánh giá</th>
              <th scope="col">Nội dung</th>
              <th scope="col">Ngày tạo</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {ratings && ratings.map((rating, index) => (
              <tr key={rating.id}>
                <th scope="row">{(page - 1) * 20 + index + 1}</th>
                <td>
                  <div>
                    <strong>{rating.fullname || rating.username}</strong>
                  </div>
                  <small className="text-muted">@{rating.username}</small>
                </td>
                <td>
                  <div>
                    <strong>{rating.productName}</strong>
                  </div>
                  <small className="text-muted">ID: {rating.productId}</small>
                </td>
                <td>
                  <div>{renderStars(rating.rating)}</div>
                  <small>({rating.rating}/5 sao)</small>
                </td>
                <td>
                  <div style={{ maxWidth: "300px", wordWrap: "break-word" }}>
                    {rating.content && rating.content.startsWith('[ADMIN REPLY]') ? (
                      <div>
                        <span className="badge bg-info mb-1">Phản hồi người bán</span>
                        <div>{rating.content.replace('[ADMIN REPLY]', '').trim()}</div>
                      </div>
                    ) : (
                      rating.content || <em className="text-muted">Không có nội dung</em>
                    )}
                  </div>
                </td>
                <td>
                  <small>{formatDate(rating.createdAt)}</small>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {/* Only show reply button for user ratings, not admin replies */}
                    {(!rating.content || !rating.content.startsWith('[ADMIN REPLY]')) && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleShowReplyModal(rating)}
                        title="Trả lời đánh giá"
                      >
                        <i className="fa fa-reply" aria-hidden="true"></i>
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleShowEditModal(rating)}
                      title={rating.content && rating.content.startsWith('[ADMIN REPLY]') ? "Sửa phản hồi" : "Sửa đánh giá"}
                    >
                      <i className="fa fa-edit" aria-hidden="true"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleShowDeleteModal(rating)}
                      title={rating.content && rating.content.startsWith('[ADMIN REPLY]') ? "Xóa phản hồi" : "Xóa đánh giá"}
                    >
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center mt-3">
          <li className={page === 1 ? "page-item disabled" : "page-item"}>
            <button
              className="page-link"
              style={{ borderRadius: 50 }}
              onClick={() => onChangePage(1)}
            >
              {`<<`}
            </button>
          </li>
          {rows}
          <li className={page === total ? "page-item disabled" : "page-item"}>
            <button
              className="page-link"
              style={{ borderRadius: 50 }}
              onClick={() => onChangePage(total)}
            >
              {`>>`}
            </button>
          </li>
        </ul>
      </nav>

      {/* Modal trả lời đánh giá */}
      <Modal show={showReplyModal} onHide={handleCloseReplyModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Trả lời đánh giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRating && (
            <div>
              <div className="mb-3">
                <strong>Khách hàng:</strong> {selectedRating.fullname || selectedRating.username}
              </div>
              <div className="mb-3">
                <strong>Sản phẩm:</strong> {selectedRating.productName}
              </div>
              <div className="mb-3">
                <strong>Đánh giá:</strong> {renderStars(selectedRating.rating)} ({selectedRating.rating}/5 sao)
              </div>
              <div className="mb-3">
                <strong>Nội dung đánh giá:</strong>
                <div className="p-2 bg-light rounded">
                  {selectedRating.content || <em>Không có nội dung</em>}
                </div>
              </div>
              <Form.Group>
                <Form.Label><strong>Trả lời của Admin:</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nhập nội dung trả lời..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReplyModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmitReply}>
            Gửi trả lời
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa đánh giá này không?
          {ratingToDelete && (
            <div className="mt-2">
              <strong>Khách hàng:</strong> {ratingToDelete.fullname || ratingToDelete.username}<br/>
              <strong>Sản phẩm:</strong> {ratingToDelete.productName}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteRating}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal sửa đánh giá */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRating && editingRating.content && editingRating.content.startsWith('[ADMIN REPLY]') 
              ? 'Sửa phản hồi người bán' 
              : 'Sửa đánh giá'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingRating && (
            <div>
              <div className="mb-3">
                <strong>Khách hàng:</strong> {editingRating.fullname || editingRating.username}
              </div>
              <div className="mb-3">
                <strong>Sản phẩm:</strong> {editingRating.productName}
              </div>
              {/* Only show star rating for regular ratings, not admin replies */}
              {(!editingRating.content || !editingRating.content.startsWith('[ADMIN REPLY]')) && (
                <Form.Group className="mb-3">
                  <Form.Label><strong>Số sao:</strong></Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fa fa-star ${star <= editRatingValue ? "text-warning" : "text-muted"}`}
                        style={{ cursor: "pointer", fontSize: "20px" }}
                        onClick={() => setEditRatingValue(star)}
                      ></i>
                    ))}
                    <span className="ms-2">({editRatingValue}/5 sao)</span>
                  </div>
                </Form.Group>
              )}
              <Form.Group>
                <Form.Label><strong>Nội dung:</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Nhập nội dung đánh giá..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmitEdit}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewsManagement; 