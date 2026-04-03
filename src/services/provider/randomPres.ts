import api from '../api';

export const getRandomPres = async() =>{
    const res = await api.get('/prestataires/random');
    return res.data;
}