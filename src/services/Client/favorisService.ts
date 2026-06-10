import axios from "axios";

const API_URL = "http://localhost:5148/api/Favoris";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const toggleFavori = async (idPres: number) => {
  const response = await axios.post(`${API_URL}/toggle/${idPres}`, {}, getAuthConfig());
  return response.data; // { isFavorited: boolean }
};

export const checkFavori = async (idPres: number) => {
  const response = await axios.get(`${API_URL}/check/${idPres}`, getAuthConfig());
  return response.data; // { isFavorited: boolean }
};

export const getMyFavorites = async () => {
  const response = await axios.get(`${API_URL}/my-favorites`, getAuthConfig());
  return response.data;
};
