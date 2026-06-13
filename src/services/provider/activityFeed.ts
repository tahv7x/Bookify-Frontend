import api from "../api";

export interface ActivityItem {
  id: number;
  type: 'message' | 'avis' | 'rendezvous' | 'notification';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  // Message specific
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
  // Avis specific
  rating?: number;
  clientName?: string;
  clientAvatar?: string;
  serviceName?: string;
  // RendezVous specific
  statut?: string;
  servicePrice?: number;
  dateDebut?: string;
  dateFin?: string;
  lieu?: string;
  // Notification specific
  rendezVousId?: number;
}

export const getActivityFeed = async (prestataireId: number, limit = 50): Promise<ActivityItem[]> => {
  const res = await api.get(`/stats/${prestataireId}/activity-feed?limit=${limit}`);
  return res.data;
};