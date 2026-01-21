import request from "@/lib/request-client";
import { EmailBizEnum } from "../constant";


export const sendEmailCodeApi = async (email: string, biz: EmailBizEnum) => {
  return await request.post('/v1/sys/email/send_code', { email: email, biz });
};


export const getTagListApi = async (params?) => {
  return await request.get('/v1/tags', {params: params});
};