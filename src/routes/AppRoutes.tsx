import { Routes, Route } from "react-router-dom";
import Home from "../pages/Auth/Home";
import Login from "../pages/Auth/Login";
import ClientRegister from "../pages/Auth/ClientRegister";
import PrestataireRegister from "../pages/Auth/PrestataireRegister";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import VerifyCode from "../pages/Auth/VerifyCode";
import ResetPassword from "../pages/Auth/ResetPassword";
import DashboardClient from "../pages/Client/Dashboard";
import HomeC from "../pages/Client/Home";
import MesRendezVous from "../pages/Client/MesRendezVous";
import Profils from "../pages/Client/Profils";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/PrestataireRegister" element={<PrestataireRegister />} />
    <Route path="/ClientRegister" element={<ClientRegister />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/verify-code" element={<VerifyCode />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/Dashboard-Client" element={<DashboardClient />} />
    <Route path="/Home-Client" element={<HomeC />} />
    <Route path="/Mes-Rendez-Vous" element={<MesRendezVous />} />
    <Route path="/Profils" element={<Profils />} />
  </Routes>
);

export default AppRoutes;
