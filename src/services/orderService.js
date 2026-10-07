import api from './api';

export const createOrder = async (orderRequest) => {
    const response = await api.post('/orders', orderRequest);
    return response.data; 
};

export const getMyOrders = async () => {
    const response = await api.get('/orders/my-orders');
    return response.data.object;
};


export const getAllOrders = async () => {
    const response = await api.get('/orders/all');
    return response.data.object;
};

export const updateOrderStatus = async (orderId, status) => {
    
    const response = await api.patch(`/orders/${orderId}/status?status=${status}`);
    return response.data.object;
};