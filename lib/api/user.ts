import request from "@/lib/request-client";



export const updateMeApi = async (data={}) => {
  return await request.put('/v1/me', data);
};


export const getUserStatsApi = async () => {
  return await request.get('/v1/me/stats');
};


export const getUserSettingsApi = async () => {
  return await request.get('/v1/me/settings');
};

export const UpdateUserSettingsApi = async (data={}) => {
  return await request.post('/v1/me/settings', data);
};