import { Routes, Route } from "react-router-dom";
import Home from "../pages/Auth/Home";
import Login from "../pages/Auth/Login";
import ClientRegister from "../pages/Auth/ClientRegister";
import PrestataireRegister from "../pages/Auth/PrestataireRegister";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import VerifyCode from "../pages/Auth/VerifyCode";
import ResetPassword from "../pages/Auth/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import DashboardClient from "../pages/Client/Dashboard";
import HomeC from "../pages/Client/Home";
import MesRendezVous from "../pages/Client/MesRendezVous";
import Profils from "../pages/Client/Profils";
import ServiceProviders from "../components/Client/ServiceProviders";
import ServiceProviderProfile from "../components/Client/ProviderProfile";
import HomeP from "../pages/Provider/Home";
import DashboardProvider from "../pages/Provider/Dashboard";
import ProfilsP from "../pages/Provider/Profils";
import MesRendezVousP from "../pages/Provider/MesRendezVous";

const AppRoutes = () => (
  <Routes>

    <Route path="/"                    element={<Home />} />
    <Route path="/login"               element={<Login />} />
    <Route path="/PrestataireRegister" element={<PrestataireRegister />} />
    <Route path="/ClientRegister"      element={<ClientRegister />} />
    <Route path="/forgot-password"     element={<ForgotPassword />} />
    <Route path="/verify-code"         element={<VerifyCode />} />
    <Route path="/reset-password"      element={<ResetPassword />} />

    <Route path="/Home-Client" element={
      <ProtectedRoute allowedRole="CLIENT"><HomeC /></ProtectedRoute>
    }/>
    <Route path="/Dashboard-Client" element={
      <ProtectedRoute allowedRole="CLIENT"><DashboardClient /></ProtectedRoute>
    }/>
    <Route path="/Mes-Rendez-Vous" element={
      <ProtectedRoute allowedRole="CLIENT"><MesRendezVous /></ProtectedRoute>
    }/>
    <Route path="/Profils" element={
      <ProtectedRoute allowedRole="CLIENT"><Profils /></ProtectedRoute>
    }/>
    <Route path="/Service-Providers/:serviceName" element={
      <ProtectedRoute allowedRole="CLIENT"><ServiceProviders /></ProtectedRoute>
    }/>
    <Route path="/Service-Provider-Profile/:providerId" element={
      <ServiceProviderProfile />
    }/>

    <Route path="/Home-Provider" element={
      <ProtectedRoute allowedRole="PRESTATAIRE"><HomeP /></ProtectedRoute>
    }/>
    <Route path="/Dashboard-Provider" element={
      <ProtectedRoute allowedRole="PRESTATAIRE"><DashboardProvider /></ProtectedRoute>
    }/>
    <Route path="/Profils-Provider" element={
      <ProtectedRoute allowedRole="PRESTATAIRE"><ProfilsP /></ProtectedRoute>
    }/>
    <Route path="/Mes-Rendez-Vous-Provider" element={
      <ProtectedRoute allowedRole="PRESTATAIRE"><MesRendezVousP /></ProtectedRoute>
    }/>

  </Routes>
);

export default AppRoutes;
