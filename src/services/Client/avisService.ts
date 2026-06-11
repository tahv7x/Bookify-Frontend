import api from '../api';

export interface CreateAvisDto {
    idPrestataire: number;
    idRendezVous?: number;
    note: number;
    commentaire: string;
}

export const getAvisByClient = async (clientId: number) => {
    try {
        const response = await api.get(`/Avis/client/${clientId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des avis du client:", error);
        throw error;
    }
};

export const getAvisByPrestataire = async (prestataireId: number) => {
    try {
        const response = await api.get(`/Avis/prestataire/${prestataireId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des avis du prestataire:", error);
        throw error;
    }
};

export const createAvis = async (clientId: number, data: CreateAvisDto) => {
    try {
        const response = await api.post(`/Avis/${clientId}`, data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création de l'avis:", error);
        throw error;
    }
};

export const deleteAvis = async (id: number) => {
    try {
        const response = await api.delete(`/Avis/${id}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la suppression de l'avis:", error);
        throw error;
    }
};
