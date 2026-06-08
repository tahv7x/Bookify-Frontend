// services/userService.ts
import api from "../api";

export async function updateUser(id: number, data: any) {
  const res = await api.put(`/utilisateur/${id}`, data);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
}
