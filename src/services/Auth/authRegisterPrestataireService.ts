import api from "../api";

export const registerPrestataire = async (formData: any) => {
  const res = await api.post("/auth/register", {
    nomComplet: formData.nomComplet,
    email: formData.email,
    telephone: formData.telephone,
    adresse: formData.address,
    password: formData.password,
    role: "PRESTATAIRE",
  });

  return res.data;
};
