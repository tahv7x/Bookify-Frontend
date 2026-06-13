import api from './api';

export interface FaqItem {
  idFaq: number;
  question: string;
  reponse: string;
  dateCreation: string;
}

export const faqService = {
  getFaqs: async (): Promise<FaqItem[]> => {
    const response = await api.get('/Faq');
    return response.data;
  },
  
  addFaq: async (question: string, reponse: string): Promise<any> => {
    const response = await api.post('/Faq', { question, reponse });
    return response.data;
  },

  updateFaq: async (id: number, question: string, reponse: string): Promise<any> => {
    const response = await api.put(`/Faq/${id}`, { question, reponse });
    return response.data;
  },

  deleteFaq: async (id: number): Promise<any> => {
    const response = await api.delete(`/Faq/${id}`);
    return response.data;
  }
};
