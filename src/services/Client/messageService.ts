import api from '../api';

export interface Contact {
  id: number;
  providerId?: number;
  name: string;
  specialty: string;
  avatar: string | null;
  unread: number;
  isOnline: boolean;
  lastMessage: string;
  time: string;
}

export interface Message {
  id: number;
  senderId: number;
  content: string;
  sentAt: string;
  lu: boolean;
}

export const getContacts = async (): Promise<Contact[]> => {
  const response = await api.get(`/Message/contacts?_t=${Date.now()}`);
  return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get(`/Message/unread-count?_t=${Date.now()}`);
  return response.data.unreadCount;
};

export const getConversation = async (userId: number): Promise<Message[]> => {
  const response = await api.get(`/Message/${userId}?_t=${Date.now()}`);
  return response.data;
};

export const sendMessage = async (receiverId: number, content: string): Promise<any> => {
  const response = await api.post('/Message', { receiverId, content });
  return response.data;
};
