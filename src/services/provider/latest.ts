import api from "../api";

export const  getLatest = async(prestataireId : number) => {
    const res = await api.get(`/stats/${prestataireId}/latest`);
    return res.data;
}