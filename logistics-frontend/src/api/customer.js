import request from "@/utils/request";


export const queryPageApi = (name,begin,end,page,pageSize) => request.get(`/clazzs?name=${name}&begin=${begin}&end=${end}&page=${page}&pageSize=${pageSize}`);

export const estimateApi = (destination) => request.post(`/user/order/estimate`, destination);

export const submitApi = (data) => request.post(`/user/order/submit`, data);

export const pageApi = (userId) => request.get(`/user/order/page?userId=${userId}`);
