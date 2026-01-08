import request from "@/lib/request-client";

export const getRSAPublicKeyApi = async (biz: "user_pwd") => {
  return await request.post("/v1/secret/rsa_public_key", { biz });
};
