import api from "../api";

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", {
    email,
  });
  return res.data;
};
