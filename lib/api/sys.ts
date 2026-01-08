import request from "@/lib/request-client";

type sendEmailBiz = 'login' | 'sign' | 'set_pwd' | 'bind_phone' | 'revoke';


export const sendEmailCodeApi = async (email: string, biz: sendEmailBiz) => {
  return await request.post('/v1/sys/email/send_code', { email: email, biz });
};