import request from "@/lib/request-client";
import { EmailBizEnum } from "../constant";

export const getAnnivStatApi = async () => {
  return await request.get("/v1/anniv/stat");
};

export const createAnnivApi = async (data: {}) => {
  return await request.post("/v1/anniv", data);
};

export const getAnnivFeedApi = async (params?) => {
  return await request.get("/v1/anniv/feed", { params: params });
};
