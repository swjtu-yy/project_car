import request from "@/utils/request";

export const allOrderApi = () => request.get(`/shipper/order/selectall`);

export const receiveApi = (data) => request.post(`/carrier/order/receive`, data);

export const locationApi = (data) => request.post(`/carrier/vehicle/location`, data);

export const arriveApi = (data) => request.post(`/carrier/order/arrive`, data);

