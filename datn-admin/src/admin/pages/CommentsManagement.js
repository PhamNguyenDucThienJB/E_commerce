import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap";
import { getAllCommentsForAdmin, deleteComment, createCommentReply, updateComment } from "../../api/CommentApi";

const CommentsManagement = () => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadComments();
  }, [page]);

  const loadComments = () => {
    getAllCommentsForAdmin(page - 1, 20)
      .then((resp) => {
        setComments(resp.data.content);
        setTotal(resp.data.totalPages);
      })
      .catch((error) => {
        console.error("Lỗi khi tải bình luận:", error);
        toast.error("Không thể tải danh sách bình luận");
      });
  };

  const onChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleShowReplyModal = (comment) => {
    setSelectedComment(comment);
    setReplyContent("");
    setShowReplyModal(true);
  };

  const handleCloseReplyModal = () => {
    setShowReplyModal(false);
    setSelectedComment(null);
    setReplyContent("");
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung trả lời");
      return;
    }

    const replyData = {
      productId: selectedComment.productId,
      content: `[ADMIN REPLY] ${replyContent}`,
      parentCommentId: selectedComment.parentCommentId || selectedComment.id
    };

    createCommentReply(replyData)
      .then(() => {
        toast.success("Trả lời bình luận thành công");
        handleCloseReplyModal();
        loadComments();
      })
      .catch((error) => {
        console.error("Lỗi khi trả lời bình luận:", error);
        toast.error("Không thể trả lời bình luận");
      });
  };

  const handleShowDeleteModal = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  const handleDeleteComment = () => {
    deleteComment(commentToDelete.id)
      .then(() => {
        toast.success("Xóa bình luận thành công");
        handleCloseDeleteModal();
        loadComments();
      })
      .catch((error) => {
        console.error("Lỗi khi xóa bình luận:", error);
        toast.error("Không thể xóa bình luận");
      });
  };

  const handleShowEditModal = (comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingComment(null);
    setEditContent("");
  };

  const handleSubmitEdit = () => {
    if (!editContent.trim()) {
      toast.warning("Vui lòng nhập nội dung");
      return;
    }

    const editData = {
      content: editContent,
      productId: editingComment.productId
      // parentCommentId not needed for admin endpoint
    };

    updateComment(editingComment.id, editData)
      .then(() => {
        toast.success("Cập nhật bình luận thành công");
        handleCloseEditModal();
        loadComments();
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật bình luận:", error);
        toast.error("Không thể cập nhật bình luận");
      });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const isReply = (comment) => {
    return comment.parentCommentId !== null;
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
        <h3>Quản lý Bình luận</h3>
      </div>
      
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="bg-light">
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Khách hàng</th>
              <th scope="col">Sản phẩm</th>
              <th scope="col">Loại</th>
              <th scope="col">Nội dung</th>
              <th scope="col">Ngày tạo</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {comments && comments.map((comment, index) => (
              <tr key={comment.id}>
                <th scope="row">{(page - 1) * 20 + index + 1}</th>
                <td>
                  <div>
                    <strong>{comment.fullname || comment.username}</strong>
                  </div>
                  <small className="text-muted">@{comment.username}</small>
                </td>
                <td>
                  <div>
                    <strong>{comment.productName}</strong>
                  </div>
                  <small className="text-muted">ID: {comment.productId}</small>
                </td>
                <td>
                  {isReply(comment) ? (
                    <span className="badge bg-info">Trả lời</span>
                  ) : (
                    <span className="badge bg-primary">Bình luận</span>
                  )}
                </td>
                <td>
                  <div style={{ maxWidth: "300px", wordWrap: "break-word" }}>
                    {comment.content}
                  </div>
                  {isReply(comment) && (
                    <small className="text-muted">
                      <i className="fa fa-reply" aria-hidden="true"></i> Trả lời cho bình luận #{comment.parentCommentId}
                    </small>
                  )}
                </td>
                <td>
                  <small>{formatDate(comment.createdAt)}</small>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleShowReplyModal(comment)}
                      title="Trả lời bình luận"
                    >
                      <i className="fa fa-reply" aria-hidden="true"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleShowEditModal(comment)}
                      title="Sửa bình luận"
                    >
                      <i className="fa fa-edit" aria-hidden="true"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleShowDeleteModal(comment)}
                      title="Xóa bình luận"
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

      {/* Modal trả lời bình luận */}
      <Modal show={showReplyModal} onHide={handleCloseReplyModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Trả lời bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComment && (
            <div>
              <div className="mb-3">
                <strong>Khách hàng:</strong> {selectedComment.fullname || selectedComment.username}
              </div>
              <div className="mb-3">
                <strong>Sản phẩm:</strong> {selectedComment.productName}
              </div>
              <div className="mb-3">
                <strong>Loại:</strong> {isReply(selectedComment) ? "Trả lời" : "Bình luận gốc"}
              </div>
              <div className="mb-3">
                <strong>Nội dung bình luận:</strong>
                <div className="p-2 bg-light rounded">
                  {selectedComment.content}
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
          Bạn có chắc chắn muốn xóa bình luận này không?
          {commentToDelete && (
            <div className="mt-2">
              <strong>Khách hàng:</strong> {commentToDelete.fullname || commentToDelete.username}<br/>
              <strong>Sản phẩm:</strong> {commentToDelete.productName}<br/>
              <strong>Nội dung:</strong> {commentToDelete.content.substring(0, 100)}...
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteComment}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal sửa bình luận */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sửa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingComment && (
            <div>
              <div className="mb-3">
                <strong>Khách hàng:</strong> {editingComment.fullname || editingComment.username}
              </div>
              <div className="mb-3">
                <strong>Sản phẩm:</strong> {editingComment.productName}
              </div>
              <div className="mb-3">
                <strong>Loại:</strong> {isReply(editingComment) ? "Trả lời" : "Bình luận gốc"}
              </div>
              <Form.Group>
                <Form.Label><strong>Nội dung:</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Nhập nội dung bình luận..."
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

export default CommentsManagement; 