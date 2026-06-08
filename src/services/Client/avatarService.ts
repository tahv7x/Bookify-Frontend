import api from '../api'

export const uploadAvatar = async (userId: number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post(`/utilisateur/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return res.data.avatarUrl;
};

export const deleteAvatar = async (userId:number): Promise<void> => {
    await api.delete(`/utilisateur/${userId}/avatar`);
}
