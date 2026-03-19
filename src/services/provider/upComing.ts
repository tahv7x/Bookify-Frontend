import api from "../api";

export const getUpcoming = async (prestataireId: number) => {
  const res = await api.get(`/stats/${prestataireId}/upcoming`);
  return res.data;
};