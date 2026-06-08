import api from "../api";

export const resetPassword = async (email: string,code:string, newPassword: string) => {
  const res = await api.post("/auth/reset-password", {
    email,
    code,
    newPassword,
  });
  return res.data;
};
