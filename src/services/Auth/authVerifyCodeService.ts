import api from "../api";

export const verifyCode = async (email: string, code: string) => {
  const res = await api.post("/auth/verify-reset-code", {
    email,
    code,
  });
  return res.data;
};
