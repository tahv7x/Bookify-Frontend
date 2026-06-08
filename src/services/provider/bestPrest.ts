import api from "../api";

export const getTopPrestataires = async() => {
    const res = await api.get("stats/top-prestataires");
    return res.data;
}