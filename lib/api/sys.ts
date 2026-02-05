import request from "@/lib/request-client";
import { EmailBizEnum } from "../constant";


export const sendEmailCodeApi = async (email: string, biz: EmailBizEnum) => {
  return await request.post('/v1/sys/email/send_code', { email: email, biz });
};


export const getTagListApi = async (params?) => {
  return await request.get('/v1/tags', {params: params});
};


export const getGroupListApi = async (params?) => {
  return await request.get('/v1/sys/groups', {params: params});
};

export const getMemberListApi = async (params?) => {
  return await request.get('/v1/sys/members', {params: params});
};

export const getGroupMemberOptionsApi = async (params?) => {
  return await request.get('/v1/sys/groups_members', {params: params});
};


export const createGroupApi = async (data) => {
  return await request.post('/v1/sys/group', data);
};

export const getGroupDetailApi = async (groupId: string) => {
  return await request.get(`/v1/sys/group/${groupId}`);
};
