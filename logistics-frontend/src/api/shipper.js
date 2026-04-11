import request from "@/utils/request";

export const allOrderApi = () => request.get(`/shipper/order/selectall`);

export const receiveApi = (data) => request.post(`/shipper/order/receive`, data);

export const bindApi = (data) => request.post(`/shipper/vehicle/bind`, data);