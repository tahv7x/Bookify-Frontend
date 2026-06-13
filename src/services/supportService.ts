import api from './api';

export interface Ticket {
  idTicket: number;
  userName: string;
  userEmail: string;
  subject: string;
  preview: string;
  status: string;
  date: string;
  messages: Message[];
}

export interface Message {
  from: "user" | "admin";
  text: string;
  time: string;
}

export const supportService = {
  getTickets: async (): Promise<Ticket[]> => {
    const response = await api.get('/Support/tickets');
    return response.data;
  },
  
  getTicket: async (id: number): Promise<Ticket> => {
    const response = await api.get(`/Support/tickets/${id}`);
    return response.data;
  },

  createTicket: async (subject: string, message: string): Promise<any> => {
    const response = await api.post('/Support/tickets', { subject, message });
    return response.data;
  },

  addMessage: async (id: number, text: string): Promise<any> => {
    const response = await api.post(`/Support/tickets/${id}/messages`, { text });
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<any> => {
    const response = await api.put(`/Support/tickets/${id}/status`, { status });
    return response.data;
  }
};
