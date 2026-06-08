import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
import ServiceProviderProfile from "../components/Client/ProviderProfile";
import HomeP from "../pages/Provider/Home";
import DashboardProvider from "../pages/Provider/Dashboard";
import ProfilsP from "../pages/Provider/Profils";
import MesRendezVousP from "../pages/Provider/MesRendezVous";

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
    animate={{ 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transitionEnd: { filter: "none", transform: "none" }
    }}
    exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
    transition={{ duration: 0.15, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                    element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login"               element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/PrestataireRegister" element={<PageWrapper><PrestataireRegister /></PageWrapper>} />
        <Route path="/ClientRegister"      element={<PageWrapper><ClientRegister /></PageWrapper>} />
        <Route path="/forgot-password"     element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/verify-code"         element={<PageWrapper><VerifyCode /></PageWrapper>} />
        <Route path="/reset-password"      element={<PageWrapper><ResetPassword /></PageWrapper>} />

        <Route path="/Home-Client" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><HomeC /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Dashboard-Client" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><DashboardClient /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Mes-Rendez-Vous" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><MesRendezVous /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Profils" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><Profils /></PageWrapper></ProtectedRoute>
        }/>

        <Route path="/Service-Provider-Profile/:providerId" element={
          <PageWrapper><ServiceProviderProfile /></PageWrapper>
        }/>

        <Route path="/Home-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><HomeP /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Dashboard-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><DashboardProvider /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Profils-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProfilsP /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Mes-Rendez-Vous-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><MesRendezVousP /></PageWrapper></ProtectedRoute>
        }/>

      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
