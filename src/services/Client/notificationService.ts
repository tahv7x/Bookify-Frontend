import api from '../api';

export interface Notification{
    id:number;
    title:string;
    message:string;
    isRead:boolean;
    createdAt:string;
    rendezVousId:number;
}

export const getNotifications = async() : Promise<Notification[]> =>{
    const res = await api.get(`/notifications`);
    return res.data;
};

export const markAsRead = async(notificationId:number) : Promise<Notification[]> => {
    const res = await api.put(`/notifications/${notificationId}/read`);
    return res.data;
}
export const deleteNotification = async(notificationId:number) : Promise<void> =>{
    await api.delete(`/notification/${notificationId}`);
}