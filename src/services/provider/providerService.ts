import api from "../api";

export const getProviderProfile = async (id : number) =>{
    const res = await api.get(`prestataires/profile/${id}`)
    return res.data;
}