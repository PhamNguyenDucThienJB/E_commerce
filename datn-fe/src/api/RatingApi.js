import Instance from "../axios/Instance";
import { BASE_URL } from "../common/constant";

export const getRatingsByProductId = (productId, page = 0, size = 10, sortBy = "createdAt", direction = "desc") => {
  return Instance.get(`/api/ratings/product/${productId}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
};

export const getRatingsByProductIdWithCacheBust = (productId, page = 0, size = 10, sortBy = "createdAt", direction = "desc") => {
  const timestamp = new Date().getTime();
  return Instance.get(`/api/ratings/product/${productId}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}&_t=${timestamp}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

export const getProductRatingStatistics = (productId) => {
  return Instance.get(`/api/site/product/${productId}/ratings/statistics`);
};

export const getUserRatings = (page = 0, size = 10) => {
  return Instance.get(`/api/ratings/user?page=${page}&size=${size}`);
};

export const canUserRateProduct = (productId) => {
  return Instance.get(`/api/ratings/product/${productId}/can-rate`);
};

export const createRating = (ratingData) => {
  return Instance.post(`/api/ratings`, ratingData);
};

export const updateRating = (ratingId, ratingData) => {
  return Instance.put(`/api/ratings/${ratingId}`, ratingData);
};

export const deleteRating = (ratingId) => {
  return Instance.delete(`/api/ratings/${ratingId}`);
};

export const createAdminRatingReply = (replyData) => {
  return Instance.post(`/api/ratings/admin/reply`, replyData);
}; 