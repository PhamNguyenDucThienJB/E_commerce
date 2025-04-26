import Instance from '../axios/Instance'

export const createOrder = (data) =>{
    const url = `/api/site/order/create`;
    return Instance.post(url, data);
}
export const updateOrder = (data) =>{
    const url = `/api/site/order/update`;
    return Instance.post(url, data);
}
export const cancelOrder = (data) =>{
    const url = `/api/site/order/cancel`;
    return Instance.post(url, data);
}
export const getAllOrder = (id, status, page, size) =>{
    const url = `/api/site/order/get-orders?id=${id}&status=${status}&page=${page}&size=${size}`;
    return Instance.get(url);
}

export const getAllOrderAndPagination = (status, page, size) =>{
    const url = `/api/admin/order/get-orders-and-pagination?page=${page}&size=${size}&status=${status}`;
    return Instance.get(url);
}

export const getOrderById = (id) =>{
    const url = `/api/site/order/get-order-by-id?id=${id}`;
    return Instance.get(url);
}

export const getOrderDetailByOrderId = (id) =>{
    const url = `/api/site/order/get-order-detail-by-id?id=${id}`;
    return Instance.get(url);
}

export const updateOrderWithStatus = (orderId, statusId) =>{
    const url = `/api/admin/order/update-order-with-status?id=${orderId}&status=${statusId}`;
    return Instance.get(url);
}
export const getEncodeUrl = (encoded) =>{
    const url = `/api/site/order/base64?encodedUrl=${encoded}`;
    return Instance.get(url);
}
