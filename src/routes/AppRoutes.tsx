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
import PublicRoute from "./PublicRoute";
import DashboardClient from "../pages/Client/EspaceC";
import HomeC from "../pages/Client/Home";
import MesRendezVous from "../pages/Client/MesRendezVous";
import FavorisAvis from "../pages/Client/FavorisAvis";
import Messages from "../pages/Client/Messages";
import Profils from "../pages/Client/Profils";
import Explore from "../pages/Client/Explore";
import HelpSupport from "../pages/Client/HelpSupport";
import ServiceProviderProfile from "../components/Client/ProviderProfile";
import HomeP from "../pages/Provider/Home";
import DashboardProvider from "../pages/Provider/Dashboard";
import ProfilsP from "../pages/Provider/Profils";
import MesRendezVousP from "../pages/Provider/MesRendezVous";
import Disponibilites from "../pages/Provider/Disponibilites";
import ProviderOnboarding from "../pages/Provider/ProviderOnboarding";
import ProviderLayout from "../components/Provider/ProviderLayout";
import MesServices from "../pages/Provider/MesServices";
import MesClients from "../pages/Provider/MesClients";

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
        <Route path="/"                    element={<PublicRoute><PageWrapper><Home /></PageWrapper></PublicRoute>} />
        <Route path="/login"               element={<PublicRoute><PageWrapper><Login /></PageWrapper></PublicRoute>} />
        <Route path="/PrestataireRegister" element={<PublicRoute><PageWrapper><PrestataireRegister /></PageWrapper></PublicRoute>} />
        <Route path="/ClientRegister"      element={<PublicRoute><PageWrapper><ClientRegister /></PageWrapper></PublicRoute>} />
        <Route path="/forgot-password"     element={<PublicRoute><PageWrapper><ForgotPassword /></PageWrapper></PublicRoute>} />
        <Route path="/verify-code"         element={<PublicRoute><PageWrapper><VerifyCode /></PageWrapper></PublicRoute>} />
        <Route path="/reset-password"      element={<PublicRoute><PageWrapper><ResetPassword /></PageWrapper></PublicRoute>} />

        <Route path="/Home-Client" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><HomeC /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Explore" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><Explore /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Dashboard-Client" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><DashboardClient /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Mes-Rendez-Vous" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><MesRendezVous /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Messages" element={
          <ProtectedRoute><PageWrapper><Messages /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Favoris" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><FavorisAvis /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Profils" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><Profils /></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Support" element={
          <ProtectedRoute allowedRole="CLIENT"><PageWrapper><HelpSupport /></PageWrapper></ProtectedRoute>
        }/>

        <Route path="/Service-Provider-Profile/:providerId" element={
          <PageWrapper><ServiceProviderProfile /></PageWrapper>
        }/>

        <Route path="/Home-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProviderLayout><HomeP /></ProviderLayout></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Dashboard-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProviderLayout><DashboardProvider /></ProviderLayout></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Profils-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProviderLayout><ProfilsP /></ProviderLayout></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Mes-Rendez-Vous-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProviderLayout><MesRendezVousP /></ProviderLayout></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Disponibilites-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProviderLayout><Disponibilites /></ProviderLayout></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Mes-Services-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProviderLayout><MesServices /></ProviderLayout></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/Mes-Clients-Provider" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProviderLayout><MesClients /></ProviderLayout></PageWrapper></ProtectedRoute>
        }/>
        <Route path="/provider/onboarding" element={
          <ProtectedRoute allowedRole="PRESTATAIRE"><PageWrapper><ProviderOnboarding /></PageWrapper></ProtectedRoute>
        }/>

      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
