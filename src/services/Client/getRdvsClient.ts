import api from '../api';

export const getClientAppointment = async (userId: number) => {
  const res = await api.get(`/rendezvous/client/${userId}`);

  return res.data.map((r: any) => ({
    id: r.idRendezVous,
    prestataire: r.prestataire?.nomComplet || 'Prestataire',
    specialty: r.prestataire?.specialite || '',
    rawDate: r.dateDebut,
    date: new Date(r.dateDebut).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    time: new Date(r.dateDebut).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    location: r.prestataire?.adresse || 'Casablanca',
    status: (r.statut || '').toUpperCase(),
    avatar: r.prestataire?.avatar ,
    phone: r.prestataire?.telephone || '',
    service: r.service?.nom || '',
    prix: r.service?.prix || 0,
    idPres: r.prestataire?.idPres
  }));
};

export const cancelAppointment = async(rendezVousId:number)=>{
    await api.delete(`/rendezvous/${rendezVousId}`);
};

export const rescheduleAppointment = async (
  rendezVousId: number,
  dateDebut: string,
  dateFin: string
) => {
  const res = await api.put(`/rendezvous/${rendezVousId}/reschedule`, {
    dateDebut,
    dateFin
  });
  return res.data;
};