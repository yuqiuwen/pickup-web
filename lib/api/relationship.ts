import request from "@/lib/request-client";


export const getLikesCollectApi = async (params?) => {
    return await request.get("/v1/relationship/like_collect", { params: params });
}