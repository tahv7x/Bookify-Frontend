import api from '../api';

export const createRendezVous = async (data: { idPres: number; idServ: number; DateDebut: string; DateFin: string }) => {
    const res = await api.post('/RendezVous', data);
    return res.data;
};
