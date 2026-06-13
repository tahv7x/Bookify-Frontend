import api from "../api";

export const getRendezVousById = async (id: number) => {
  const res = await api.get(`/RendezVous/${id}`);
  return res.data;
};

export const createRendezVous = async (data: {
  idPres: number;
  idServ: number;
  DateDebut: string;
  DateFin: string;
  Lieu: string;
}) => {
  const res = await api.post("/RendezVous", data);
  return res.data;
};

export const proposeAlternativeDate = async (
  rendezVousId: number,
  proposedDate: string,
  proposedEndDate: string,
  messageContent?: string,
) => {
  const res = await api.put(`/RendezVous/${rendezVousId}/propose-alternative`, {
    proposedDate,
    proposedEndDate,
    messageContent,
  });
  return res.data;
};

export const acceptAlternativeDate = async (
  rendezVousId: number,
  proposedDate: string,
  proposedEndDate: string,
) => {
  const res = await api.put(`/RendezVous/${rendezVousId}/accept-proposal`, {
    proposedDate,
    proposedEndDate,
  });
  return res.data;
};
