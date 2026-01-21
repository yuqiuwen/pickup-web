import request from "@/lib/request-client";



export const createLikeApi = async (data: {}) => {
  return await request.post("/v1/interaction/like", data);
};


export const createCollectApi = async (data: {}) => {
    return await request.post("/v1/interaction/collect", data);
  };