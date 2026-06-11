import api from '../api';

export const toggleFavori = async (idPres: number) => {
  const response = await api.post(`/Favoris/toggle/${idPres}`);
  return response.data; // { isFavorited: boolean }
};

export const checkFavori = async (idPres: number) => {
  const response = await api.get(`/Favoris/check/${idPres}`);
  return response.data; // { isFavorited: boolean }
};

export const getMyFavorites = async () => {
  const response = await api.get(`/Favoris/my-favorites`);
  return response.data;
};
