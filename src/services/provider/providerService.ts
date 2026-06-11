import api from "../api";

export const getProviderProfile = async (id : number) =>{
    const res = await api.get(`prestataires/profile/${id}`);
    return res.data;
};

export const getMyProviderProfile = async () => {
    const res = await api.get('prestataires/mine');
    return res.data;
};

export const updateMyProviderProfile = async (data: {
    nomComplet: string;
    telephone: string;
    adresse: string;
    specialite?: string;
    bio?: string;
    categorie?: string;
    latitude?: number | null;
    longitude?: number | null;
    enLocal?: boolean;
    aDomicile?: boolean;
}) => {
    const res = await api.put('prestataires/mine', data);
    return res.data;
};

export const getMyDisponibilites = async () => {
    const res = await api.get('prestataires/mine/disponibilites');
    return res.data;
};

export const updateMyDisponibilites = async (data: {
    jourSemaine: string;
    heureDebut: string;
    heureFin: string;
    disponible: boolean;
}[]) => {
    const res = await api.put('prestataires/mine/disponibilites', data);
    return res.data;
};

export const getMyServices = async () => {
    const res = await api.get('services/mine');
    return res.data;
};

export const addService = async (data: any) => {
    const res = await api.post('services', data);
    return res.data;
};

export const updateService = async (id: number, data: any) => {
    const res = await api.put(`services/${id}`, data);
    return res.data;
};

export const deleteService = async (id: number) => {
    const res = await api.delete(`services/${id}`);
    return res.data;
};