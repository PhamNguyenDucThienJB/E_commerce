import Instance from '../axios/Instance';

// API cho admin quản lý đánh giá
export const getAllRatingsForAdmin = async (page = 0, size = 20, sortBy = "createdAt", sortDir = "desc") => {
    try {
        const response = await Instance.get(`/api/ratings/admin/all?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ratings for admin:", error);
        throw error;
    }
};

export const deleteRating = (ratingId) => {
    const url = `/api/ratings/${ratingId}`;
    return Instance.delete(url);
};

export const updateRating = (ratingId, data) => {
    // Defensive check
    if (!ratingId || typeof ratingId === 'object') {
        console.error('Invalid ratingId:', ratingId);
        return Promise.reject(new Error('Invalid ratingId'));
    }
    
    // Use admin endpoint with simplified validation
    const url = `/api/ratings/admin/${ratingId}`;
    return Instance.put(url, data);
};

// Tạo reply đánh giá (admin trả lời)
export const createAdminRatingReply = async (replyData) => {
    try {
        const response = await Instance.post("/api/ratings/admin/reply", replyData);
        return response.data;
    } catch (error) {
        console.error("Error creating admin rating reply:", error);
        throw error;
    }
};

export default {
    getAllRatingsForAdmin,
    createAdminRatingReply
}; 