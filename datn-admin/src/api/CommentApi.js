import Instance from '../axios/Instance';

// API cho admin quản lý bình luận
export const getAllCommentsForAdmin = (page = 0, size = 20) => {
    const url = `/api/comments/admin/all?page=${page}&size=${size}`;
    return Instance.get(url);
};

export const deleteComment = (commentId) => {
    const url = `/api/comments/${commentId}`;
    return Instance.delete(url);
};

export const updateComment = (commentId, data) => {
    // Defensive check
    if (!commentId || typeof commentId === 'object') {
        console.error('Invalid commentId:', commentId);
        return Promise.reject(new Error('Invalid commentId'));
    }
    
    // Use admin endpoint with simplified validation
    const url = `/api/comments/admin/${commentId}`;
    return Instance.put(url, data);
};

// Tạo reply bình luận (admin trả lời)
export const createCommentReply = (data) => {
    const url = `/api/comments`;
    return Instance.post(url, data);
}; 