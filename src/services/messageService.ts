import api from "./api";

export const getConversation = async (otherUserId: number) => {
    const res = await api.get(`/Message/${otherUserId}`);
    return res.data;
};

export const sendMessage = async (receiverId: number, content: string) => {
    const res = await api.post('/Message', { receiverId, content });
    return res.data;
};
