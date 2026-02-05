import request from "../request-client";

export const acceptInviteApi = async (token: string) => {
  return await request.post("/v1/invite/accept", { token });
};

export const declineInviteApi = async (token: string) => {
  return await request.post("/v1/invite/decline", { token });
};

export const previewInviteApi = async (token: string) => {
    return await request.get("/v1/invite/preview", { params: {token} });
  };