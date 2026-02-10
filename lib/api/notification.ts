

import request from "@/lib/request-client";

export const getRemindNtfyApi = async (params) => {
    return await request.get("/v1/notification/remind", { params: params });
};


export const getSysNtfyApi = async (params) => {
    return await request.get("/v1/notification/sys", { params: params });
};


export const getAnnounceNtfyApi = async (params) => {
    return await request.get("/v1/notification/announce", { params: params });
};


export const updateNtfyCursorApi = async (data: object = {}) => {
    return await request.post("/v1/notification/cursor", data);
};

export const getUnreadCountApi = async () => {
    return await request.get("/v1/notification/unread");
};

export const resetAllUnreadCountApi = async () => {
    return await request.get("/v1/notification/reset_all");
};