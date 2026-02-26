import React from "react";
import Navbar from "../../components/Navbar";
import RoleCard from "../../components/RoleCard";
import "../../styles/home.css";
import BlurText from "../../components/textBlur";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-50 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>

      {/* Curved lines decoration */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="lines"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,50 Q25,25 50,50 T100,50"
              fill="none"
              stroke="#0059B2"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lines)" />
      </svg>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-16">
        {/* Hero Section */} 
        <div className="w-full flex flex-col items-center justify-center text-center mb-10">
          <BlurText
            animateBy="words"
            delay={120}
            direction="top"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2"
          >
            Simplifiez Votre rendez-Vous
          </BlurText>
          <BlurText
            animateBy="words"
            delay={220}
            direction="top"
            className="text-xl sm:text-2xl lg:text-3xl text-[#0059B2] font-bold"
          >
            Bienvenue Sur Bookify
          </BlurText>
        </div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <RoleCard
            type="prestataire"
            title="PRESTATAIRES"
            description="Gérez vos disponibilités et vos rendez-vous en ligne."
            features={[
              "Gestion du planning",
              "Gérer les Rendez-vous",
              "Vue journalière",
            ]}
          />

          <RoleCard
            type="client"
            title="CLIENTS"
            description="Réserver un rendez-vous facilement auprès des professionnels."
            features={[
              "Réservation rapide en ligne",
              "Consultation",
              "Notifications et rappels",
            ]}
            isPopular={true}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;