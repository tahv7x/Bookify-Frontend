import api from "../api";

export interface ServiceDto {
    idService?: number;
    nom: string;
    description: string;
    prix: number;
    duree: number;
    uniteDuree: string;
}

export const getMyServices = async (): Promise<ServiceDto[]> => {
    const res = await api.get('/Services/mine');
    return res.data;
};

export const addService = async (service: ServiceDto): Promise<any> => {
    const res = await api.post('/Services', service);
    return res.data;
};

export const updateService = async (id: number, service: ServiceDto): Promise<any> => {
    const res = await api.put(`/Services/${id}`, service);
    return res.data;
};

export const deleteService = async (id: number): Promise<any> => {
    const res = await api.delete(`/Services/${id}`);
    return res.data;
};
