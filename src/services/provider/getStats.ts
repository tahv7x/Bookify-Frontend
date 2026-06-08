import api from "../api";

export const getStats = async(prestataireId: number) => {
    const res = await api.get(`/stats/${prestataireId}`);
    return res.data;
}