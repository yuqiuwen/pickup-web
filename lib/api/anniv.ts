import request from "@/lib/request-client";

export const getAnnivStatApi = async () => {
  return await request.get("/v1/anniv/stat");
};

export const createAnnivApi = async (data: {}) => {
  return await request.post("/v1/anniv", data);
};

export const getAnnivFeedApi = async (params?) => {
  return await request.get("/v1/anniv/feed", { params: params });
};

export const getAnnivItemApi = async (annivId: string) => {
  return await request.get(`/v1/anniv/${annivId}`);
};
