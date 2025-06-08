import Instance from "../axios/Instance";
import { BASE_URL } from "../common/constant";

export const getCommentsByProductId = (productId, page = 0, size = 10, sortBy = "createdAt", direction = "desc") => {
  return Instance.get(`/api/comments/product/${productId}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
};

export const getCommentsByProductIdWithCacheBust = (productId, page = 0, size = 10, sortBy = "createdAt", direction = "desc") => {
  const timestamp = new Date().getTime();
  return Instance.get(`/api/comments/product/${productId}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}&_t=${timestamp}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

export const getRepliesByCommentId = (commentId) => {
  return Instance.get(`/api/comments/${commentId}/replies`);
};

export const getUserComments = (page = 0, size = 10) => {
  return Instance.get(`/api/comments/user?page=${page}&size=${size}`);
};

export const createComment = (commentData) => {
  return Instance.post(`/api/comments`, commentData);
};

export const updateComment = (commentId, commentData) => {
  return Instance.put(`/api/comments/${commentId}`, commentData);
};

export const deleteComment = (commentId) => {
  return Instance.delete(`/api/comments/${commentId}`);
}; 