import api from "../api";

export const getDisponibilites = async (prestataireId: number) => {
    const res = await api.get(`/Disponibilites/${prestataireId}`);
    return res.data;
};

export const getMyDisponibilites = async () => {
    const res = await api.get('/Disponibilites/mine');
    return res.data;
};

export const addDisponibilite = async (data: { Jour: string, HeureDebut: string, HeureFin: string, Disponible: boolean }) => {
    const res = await api.post('/Disponibilites', data);
    return res.data;
};

export const updateDisponibilite = async (id: number, data: { Jour: string, HeureDebut: string, HeureFin: string, Disponible: boolean }) => {
    const res = await api.put(`/Disponibilites/${id}`, data);
    return res.data;
};

export const deleteDisponibilite = async (id: number) => {
    const res = await api.delete(`/Disponibilites/${id}`);
    return res.data;
};
