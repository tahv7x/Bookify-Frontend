import api from "../api";

export const registerClient = async (formData: any) => {
  const res = await api.post("/auth/register", {
    nomComplet: formData.nomComplet,
    email: formData.email,
    telephone: formData.telephone,
    adresse: formData.address, // ⭐ هنا تصححات
    password: formData.password,
    role: "CLIENT",
  });

  return res.data;
};
