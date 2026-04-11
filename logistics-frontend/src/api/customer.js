import request from "@/utils/request";

export const estimateApi = (destination) => request.post(`/user/order/estimate`, destination);

export const submitApi = (data) => request.post(`/user/order/submit`, data);

export const pageApi = (userId, raw = false) => request.post(`/user/order/page`, raw ? userId : { userId });
