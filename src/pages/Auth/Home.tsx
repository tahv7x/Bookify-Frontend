import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  Stethoscope,
  Wrench,
  Scissors,
  Scale,
  Menu,
  X,
  Sun,
  Moon,
  BarChart3,
  Zap,
  Bell,
  Lock,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// IMPORT DYAL L'CONTEXT GLOBAL
import { useTheme } from "../../context/ThemeContext";

import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";
import ScrollProgress from "../../components/ScrollProgress";
import AnimatedCounter from "../../components/AnimatedCounter";
import TestimonialCarousel from "../../components/TestimonialCarousel";
import FAQAccordion from "../../components/FAQAccordion";

// 7iydna : Variants bach maydirch l'erreur dyal Vite
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// BACKGROUND VERIZON-STYLE (M9AD L'LIGHT W DARK MODE)
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Vague 1: Top Right */}
      <motion.div
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-[#1A6FD1]/5 dark:bg-[#1A6FD1]/10 blur-[80px] md:blur-[120px] opacity-100"
      />

      {/* Vague 2: Bottom Left */}
      <motion.div
        animate={{
          rotate: [360, 270, 180, 90, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -left-[10%] w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-[#004a96]/5 dark:bg-[#004a96]/20 blur-[80px] md:blur-[120px] opacity-100"
      />
      
      {/* Daw weste l'page */}
      <motion.div
        animate={{
          y: ["-5%", "5%", "-5%"],
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#1A6FD1]/5 dark:bg-[#1A6FD1]/5 blur-[80px] md:blur-[120px]"
      />
    </div>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Nkhdmo b ThemeContext db
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') { 
        if (window.scrollY > lastScrollY && window.scrollY > 100) { 
          // If scroll down and we are past the top threshold, hide the navbar
          setShowNavbar(false);
          setOpen(false); // also close mobile menu if scrolling down
        } else { 
          // If scroll up, show the navbar
          setShowNavbar(true);  
        }
        
        // Remember current page location to use in the next move
        setLastScrollY(window.scrollY); 
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  // Fonction dédiée au scroll pour éviter les bugs CSS avec overflow-x-hidden
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    setOpen(false); // Fermer le menu mobile si ouvert
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stats = [
    { icon: CheckCircle2, value: 12500, suffix: "+", label: "Rendez-vous confirmés" },
    { icon: Users, value: 98, suffix: "%", label: "Satisfaction client" },
    { icon: Stethoscope, value: 450, suffix: "+", label: "Professionnels vérifiés" },
    { icon: TrendingUp, value: 7, suffix: "k", label: "Utilisateurs actifs" },
  ];

  const testimonials = [
    {
      id: "1",
      name: "Sophie Martin",
      role: "Client, Paris",
      avatar: "SM",
      quote: "Bookify m'a vraiment simplifié la vie. Plus de coups de fil, plus d'attente. Je réserve en 30 secondes!",
      rating: 5,
    },
    {
      id: "2",
      name: "Dr. Karim Bennani",
      role: "Médecin, Casablanca",
      avatar: "KB",
      quote: "La plateforme est intuitive et mes patients adorent. J'ai augmenté mes rendez-vous de 40% en trois mois.",
      rating: 5,
    },
    {
      id: "3",
      name: "Amélie Dupont",
      role: "Coiffeuse, Lyon",
      avatar: "AD",
      quote: "Fini les no-shows grâce aux rappels automatiques. Les paiements en ligne rendent tout plus professionnel.",
      rating: 5,
    },
    {
      id: "4",
      name: "Thomas Laurent",
      role: "Client, Marseille",
      avatar: "TL",
      quote: "J'ai enfin trouvé un mécanicien de confiance proche de chez moi. Service impeccable et transparent.",
      rating: 5,
    },
  ];

  const faqItems = [
    {
      id: "1",
      icon: Clock,
      question: "Combien de temps faut-il pour réserver?",
      answer: "La plupart des réservations se font en moins d'une minute. Cherchez le professionnel, choisissez un créneau disponible et confirmez. C'est tout! Les rappels automatiques vous seront envoyés avant votre rendez-vous.",
    },
    {
      id: "2",
      icon: Shield,
      question: "Comment vérifiez-vous les professionnels?",
      answer: "Tous nos professionnels passent par une vérification complète d'identité et de diplômes. Les avis des utilisateurs aident aussi à maintenir la qualité de la plateforme. Seuls les pros vérifiés peuvent exercer sur Bookify.",
    },
    {
      id: "3",
      icon: CreditCard,
      question: "Les paiements sont-ils sécurisés?",
      answer: "Oui, nous utilisons un chiffrement SSL et des paiements via partenaires de confiance. Aucune information bancaire n'est stockée sur nos serveurs. Vos données sont en sécurité.",
    },
    {
      id: "4",
      icon: MessageSquare,
      question: "Puis-je modifier ou annuler ma réservation?",
      answer: "Bien sûr! Vous pouvez annuler gratuitement jusqu'à 24h avant votre rendez-vous. Pour les modifications, contactez directement le professionnel via la plateforme.",
    },
    {
      id: "5",
      icon: Zap,
      question: "Qu'est-ce qui me pousse à choisir Bookify?",
      answer: "Réservation instantanée, pros vérifiés, paiements sécurisés, rappels automatiques, et une communauté de confiance. Pas d'application complexe, juste une marketplace efficace.",
    },
    {
      id: "6",
      icon: BarChart3,
      question: "Que gagnent les professionnels?",
      answer: "Plus de visibilité, plus de clients, une gestion agenda simplifiée, et des outils pour gérer votre activité. Les pros qui utilisent Bookify rapportent une augmentation moyenne de 35% de leurs rendez-vous.",
    },
  ];

  return (
    <div className="relative min-h-screen font-poppins antialiased overflow-x-hidden bg-[#FAFAFA] text-slate-900 dark:bg-[#0f1117] dark:text-[#e2e8f0] bg-dot-pattern transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&display=swap');
        html { scroll-behavior: smooth; }
        body, div, p, a, button, span { font-family: 'Poppins', sans-serif; }
        .font-fraunces { font-family: 'Fraunces', serif !important; }

        /* Subtle Dot Grid pattern for background */
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(26, 111, 209, 0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>

      <ScrollProgress />
      
      {/* Background Animated m9ad l'light w dark */}
      <AnimatedBackground />

      {/* NAVBAR */}
      <header 
        className={`sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-[#0f1117]/70 border-b border-slate-200/60 dark:border-[#2d3148]/60 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}
      >  
        <nav className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between py-4">          
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={theme === "dark" ? logoDark : logoLight}
              alt="Bookify"
              className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-slate-600 dark:text-[#8892a4]">
            <a href="#stats" onClick={(e) => handleScroll(e, 'stats')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Résultats</a>
            <a href="#services" onClick={(e) => handleScroll(e, 'services')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Services</a>
            <a href="#how" onClick={(e) => handleScroll(e, 'how')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Comment ça marche</a>
            <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">FAQ</a>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-10 w-10 md:h-11 md:w-11 grid place-items-center rounded-xl border border-slate-300 dark:border-[#2d3148] bg-white/60 dark:bg-[#1a1d27]/50 backdrop-blur-md text-slate-700 dark:text-[#e2e8f0] hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-[#1a1d27] transition-all duration-300 shadow-sm"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
            </button>
            <Link to="/login" className="hidden md:inline-flex px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-[#2d3148] bg-white/60 dark:bg-[#1a1d27]/50 backdrop-blur-md text-slate-700 dark:text-[#e2e8f0] hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-[#1a1d27] transition-all shadow-sm">
              Se connecter
            </Link>
            <Link to="/ClientRegister" className="hidden md:inline-flex px-6 py-2.5 text-sm rounded-xl text-white font-medium bg-gradient-to-br from-[#004a96] to-[#1A6FD1] shadow-[0_0_6px_-2px_#1A6FD1] hover:shadow-[0_0_10px_-2px_#1A6FD1] transition-all">
              S'inscrire
            </Link>
            <button className="md:hidden text-slate-900 dark:text-white" onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
        {open && (
          <div className="md:hidden border-t border-slate-200 dark:border-[#2d3148] bg-white dark:bg-[#0f1117] px-6 py-4 flex flex-col gap-3 text-sm font-medium">
            <a href="#stats" onClick={(e) => handleScroll(e, 'stats')} className="cursor-pointer">Résultats</a>
            <a href="#services" onClick={(e) => handleScroll(e, 'services')} className="cursor-pointer">Services</a>
            <a href="#how" onClick={(e) => handleScroll(e, 'how')} className="cursor-pointer">Comment ça marche</a>
            <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="cursor-pointer">FAQ</a>
            <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#2d3148] text-left mt-2">Se connecter</Link>
            <Link to="/ClientRegister" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-white bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-center">
              S'inscrire
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid lg:grid-cols-12 gap-12 items-center"
        >
          <div className="lg:col-span-7">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/60 backdrop-blur text-xs font-medium text-slate-600 dark:text-[#8892a4] mb-8 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#1A6FD1]" />
              Réservation simplifiée · marketplace de pros vérifiés
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-poppins font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-slate-900 dark:text-white"
            >
              Arrêtez de chercher{" "}
              <br />
              Commencez à{" "}
              <span className="font-fraunces font-semibold bg-gradient-to-br from-[#004a96] to-[#1A6FD1] bg-clip-text text-transparent">
                Réserver
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-base sm:text-lg text-slate-600 dark:text-[#8892a4] max-w-xl leading-relaxed"
            >
              Médecins, mécaniciens, coiffeurs, avocats, ménage… Réservez en temps réel auprès de professionnels vérifiés près de chez vous.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
              <Link to="/" className="group inline-flex items-center justify-center sm:justify-start gap-2 px-6 py-3.5 rounded-xl text-white font-medium bg-gradient-to-br from-[#004a96] to-[#1A6FD1] shadow-[0_4px_12px_-2px_#1A6FD1] hover:shadow-[0_6px_16px_-2px_#1A6FD1] transition-all hover:-translate-y-0.5">
                Trouver un professionnel
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/PrestataireRegister" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-[#2d3148] bg-white/60 dark:bg-transparent text-slate-800 dark:text-[#e2e8f0] font-medium hover:shadow-sm hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-[#1a1d27] transition-all hover:-translate-y-0.5">
                Devenir Prestataire
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 text-sm text-slate-600 dark:text-[#8892a4]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-[#F8FAFC] dark:border-[#0f1117] bg-gradient-to-br from-[#1A6FD1] to-[#004a96]"
                    />
                  ))}
                </div>
                <span className="font-medium">+7k utilisateurs actifs</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-[#1A6FD1] text-[#1A6FD1]" />
                ))}
                <span className="ml-1 font-medium">4.3/5</span>
              </div>
            </motion.div>
          </div>

          {/* Floating booking card */}
          <motion.div variants={fadeUp} className="lg:col-span-5 relative">
            <div className="relative flex items-center justify-center" style={{ perspective: '1000px', minHeight: '520px' }}>

              {/* Particles */}
              {[
                { left: '20%', delay: 0, duration: 8, size: 4 },
                { left: '35%', delay: 2, duration: 11, size: 3 },
                { left: '60%', delay: 4, duration: 9, size: 5 },
                { left: '75%', delay: 1, duration: 13, size: 3 },
                { left: '50%', delay: 6, duration: 10, size: 4 },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, opacity: 0, scale: 1 }}
                  animate={{ y: -300, opacity: [0, 1, 0.6, 0], scale: 0.4 }}
                  transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
                  className="absolute bottom-[10%] rounded-full bg-[#1A6FD1]/40 pointer-events-none"
                  style={{ left: p.left, width: p.size, height: p.size }}
                />
              ))}

              {/* 3D card wrapper */}
              <motion.div
                animate={{
                  rotateX: [4, 2, 6, 4],
                  rotateY: [-6, 4, -3, -6],
                  y: [0, -14, -6, 0],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: 'preserve-3d', position: 'relative', zIndex: 10 }}
              >

                {/* Pill TL */}
                <motion.div
                  animate={{ y: [0, 8, 0], x: [0, 4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -left-8 hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/96 dark:bg-[#1a1d27]/96 border border-slate-200/70 dark:border-[#2d3148] backdrop-blur shadow-[0_8px_28px_rgba(26,111,209,0.15)] z-20"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  <span className="text-xs text-slate-800 dark:text-[#e2e8f0] whitespace-nowrap font-medium">RDV confirmé en 12s</span>
                </motion.div>

                {/* Pill BR */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -right-8 hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/96 dark:bg-[#1a1d27]/96 border border-slate-200/70 dark:border-[#2d3148] backdrop-blur shadow-[0_8px_28px_rgba(26,111,209,0.15)] z-20"
                >
                  <Star className="h-3.5 w-3.5 fill-[#1A6FD1] text-[#1A6FD1]" />
                  <span className="text-xs text-slate-800 dark:text-[#e2e8f0] whitespace-nowrap font-medium">4.9 · 312 avis</span>
                </motion.div>

                {/* Pill TM */}
                <motion.div
                  animate={{ y: [0, 6, 0], x: [0, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 right-10 hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/96 dark:bg-[#1a1d27]/96 border border-slate-200/70 dark:border-[#2d3148] backdrop-blur shadow-[0_8px_28px_rgba(26,111,209,0.15)] z-20"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs text-slate-800 dark:text-[#e2e8f0] whitespace-nowrap font-medium">Disponible maintenant</span>
                </motion.div>

                {/* THE CARD */}
                <motion.div
                  className="relative rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/95 dark:bg-[#1a1d27]/90 backdrop-blur-xl p-6 overflow-hidden"
                  style={{
                    boxShadow: '0 20px 40px -12px rgba(26,111,209,0.15), 0 8px 16px -8px rgba(0,0,0,0.06)',
                    width: '380px',
                  }}
                >
                  <div
                    className="pointer-events-none absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 40%, rgba(180,210,255,0.6) 60%, transparent)' }}
                  />

                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-[13px] bg-gradient-to-br from-[#004a96] to-[#1A6FD1] grid place-items-center shadow-[0_4px_12px_rgba(26,111,209,0.4)]">
                        <Stethoscope className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">Dr. Amélie Laurent</p>
                        <p className="text-[10px] text-slate-500 dark:text-[#8892a4]">Médecin généraliste · Paris 11</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1A6FD1]/10 text-[#1A6FD1] text-[10px] font-semibold">
                      <Shield className="h-3 w-3" /> Vérifié
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {["Lun", "Mar", "Mer", "Jeu"].map((d, i) => (
                      <div
                        key={d}
                        className={`text-center py-2.5 rounded-[13px] border transition-all ${
                          i === 1
                            ? "border-[#1A6FD1] bg-gradient-to-b from-[#1A6FD1]/12 to-transparent text-slate-900 dark:text-white shadow-[0_2px_8px_rgba(26,111,209,0.15)]"
                            : "border-slate-200 dark:border-[#2d3148] text-slate-400 dark:text-[#8892a4]"
                        }`}
                      >
                        <p className="text-[10px] font-medium">{d}</p>
                        <p className="text-sm font-bold mt-1">{12 + i}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] font-medium text-slate-400 dark:text-[#8892a4] mb-2">Créneaux disponibles</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {["09:00", "10:30", "14:00", "15:30", "16:45", "17:30"].map((t, i) => (
                      <button
                        key={t}
                        className={`py-2 rounded-xl text-xs border transition-all ${
                          i === 2
                            ? "border-[#1A6FD1] bg-[#1A6FD1]/10 text-slate-900 dark:text-white font-semibold shadow-[0_2px_8px_rgba(26,111,209,0.15)]"
                            : "border-slate-200 dark:border-[#2d3148] text-slate-600 dark:text-[#e2e8f0] hover:border-[#1A6FD1]/40 hover:bg-slate-50 dark:hover:bg-[#1a1d27]/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button className="w-full py-3 rounded-[15px] text-white font-semibold text-sm bg-gradient-to-br from-[#004a96] to-[#1A6FD1] shadow-[0_6px_20px_-6px_rgba(26,111,209,0.5),0_1px_0_rgba(255,255,255,0.2)_inset] hover:shadow-[0_8px_25px_-6px_rgba(26,111,209,0.6)] transition-all">
                    Confirmer le rendez-vous
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS SECTION */}
      <section id="stats" className="scroll-mt-28 mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-28 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold text-[#1A6FD1] uppercase tracking-widest mb-3">
            Chiffres clés
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-slate-900 dark:text-white"
          >
            Une plateforme en pleine croissance
          </motion.h2>
        </motion.div>
        <AnimatedCounter stats={stats} />
      </section>

      {/* SERVICES MARQUEE */}
      <section
        id="services"
        className="scroll-mt-28 relative border-y border-slate-200 dark:border-[#2d3148]/60 bg-white/60 dark:bg-[#1a1d27]/30 backdrop-blur overflow-hidden z-10"
      >
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#F8FAFC] dark:from-[#0f1117] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#F8FAFC] dark:from-[#0f1117] to-transparent" />
        <div className="py-6 flex overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="flex shrink-0 w-max gap-12 px-6"
          >
            {Array.from({ length: 6 }).flatMap((_, loop) =>
              [
                { icon: Stethoscope, label: "Santé" },
                { icon: Wrench, label: "Mécanique" },
                { icon: Scissors, label: "Beauté" },
                { icon: Scale, label: "Juridique" },
                { icon: Sparkles, label: "Ménage" },
                { icon: Calendar, label: "Coaching" },
                { icon: Shield, label: "Sécurité" },
                { icon: Users, label: "Événementiel" },
              ].map((s, i) => (
                <div
                  key={`${loop}-${i}`}
                  className="flex items-center gap-2 text-slate-500 dark:text-[#8892a4] text-xs font-semibold uppercase tracking-widest whitespace-nowrap hover:text-[#1A6FD1] transition-colors cursor-pointer"
                >
                  <s.icon className="h-4 w-4 text-[#1A6FD1]" />
                  <span>{s.label}</span>
                </div>
              )),
            )}
          </motion.div>
        </div>
      </section>

      {/* BENTO VALUE PROP */}
      <section id="pro" className="scroll-mt-28 mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-28 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold text-[#1A6FD1] uppercase tracking-widest mb-3">
            Une plateforme, deux mondes
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-slate-900 dark:text-white leading-tight"
          >
            Pensé pour les clients.{" "}
            <span className="font-fraunces font-semibold bg-gradient-to-br from-[#004a96] to-[#1A6FD1] bg-clip-text text-transparent">
              Conçu pour les pros.
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-max md:auto-rows-[280px]"
        >
          <motion.div variants={fadeUp} className="md:col-span-2 md:row-span-2 group relative rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md p-6 md:p-8 overflow-hidden hover:border-[#1A6FD1]/50 hover:-translate-y-1 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(26,111,209,0.2)] transition-all duration-300">
            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#1A6FD1]/15 blur-3xl pointer-events-none" />
            <Clock className="h-8 w-8 text-[#1A6FD1] mb-6" />
            <h3 className="font-poppins font-bold text-2xl md:text-3xl text-slate-900 dark:text-white mb-3">Gagnez du temps</h3>
            <p className="text-slate-600 dark:text-[#8892a4] max-w-md mb-8 text-sm md:text-base">
              Fini les coups de fil et les files d'attente. Comparez les disponibilités en temps réel et réservez en quelques secondes, 24/7.
            </p>
            <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full ${
                    i <= 4 ? "bg-gradient-to-r from-[#004a96] to-[#1A6FD1]" : "bg-slate-200 dark:bg-[#2d3148]"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md p-6 hover:border-[#1A6FD1]/50 hover:-translate-y-1 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(26,111,209,0.2)] transition-all duration-300">
            <Shield className="h-7 w-7 text-[#1A6FD1] mb-4" />
            <h3 className="font-poppins font-semibold text-lg text-slate-900 dark:text-white mb-2">Pros vérifiés</h3>
            <p className="text-sm text-slate-600 dark:text-[#8892a4]">Diplômes et identités contrôlés.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md p-6 hover:border-[#1A6FD1]/50 hover:-translate-y-1 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(26,111,209,0.2)] transition-all duration-300">
            <Star className="h-7 w-7 text-[#1A6FD1] mb-4" />
            <h3 className="font-poppins font-semibold text-lg text-slate-900 dark:text-white mb-2">Avis authentiques</h3>
            <p className="text-sm text-slate-600 dark:text-[#8892a4]">Notes issues de vrais rendez-vous.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="md:col-span-2 rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md p-6 md:p-8 hover:border-[#1A6FD1]/40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(26,111,209,0.2)] transition-all relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-[#004a96]/15 blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4 relative">
              <TrendingUp className="h-8 w-8 text-[#1A6FD1] flex-shrink-0" />
              <div>
                <h3 className="font-poppins font-bold text-xl md:text-2xl text-slate-900 dark:text-white mb-2">Plus de clients, moins d'admin</h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-[#8892a4] max-w-md">
                  Agenda intelligent, rappels automatiques, paiements en ligne. Concentrez-vous sur votre métier.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md p-6 hover:border-[#1A6FD1]/50 hover:-translate-y-1 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(26,111,209,0.2)] transition-all duration-300">
            <Users className="h-7 w-7 text-[#1A6FD1] mb-4" />
            <h3 className="font-poppins font-semibold text-lg text-slate-900 dark:text-white mb-2">Communauté</h3>
            <p className="text-sm text-slate-600 dark:text-[#8892a4]">+12 000 utilisateurs actifs.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-28 mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-28 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold text-[#1A6FD1] uppercase tracking-widest mb-3">
            Comment ça marche
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-slate-900 dark:text-white"
          >
            Trois étapes.{" "}
            <span className="font-fraunces font-semibold bg-gradient-to-br from-[#004a96] to-[#1A6FD1] bg-clip-text text-transparent">
              C'est tout.
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="relative grid md:grid-cols-3 gap-8"
        >
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#1A6FD1]/40 to-transparent" />
          {[
            { icon: Search, title: "Cherchez", desc: "Filtrez par métier, ville, disponibilité ou note." },
            { icon: Calendar, title: "Réservez", desc: "Choisissez un créneau et confirmez en un clic." },
            { icon: CheckCircle2, title: "C'est fait", desc: "Recevez vos rappels, payez, laissez un avis." },
          ].map((step, i) => (
            <motion.div key={step.title} variants={fadeUp} className="relative text-center">
              <div className="relative mx-auto h-20 w-20 mb-6 rounded-2xl bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-[#2d3148] grid place-items-center shadow-[0_8px_20px_-10px_rgba(26,111,209,0.2)] hover:shadow-[0_12px_30px_-10px_rgba(26,111,209,0.4)] transition-shadow">
                <step.icon className="h-8 w-8 text-[#1A6FD1]" />
                <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-[#004a96] to-[#1A6FD1] grid place-items-center text-xs font-bold text-white shadow-sm">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-poppins font-bold text-xl md:text-2xl text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-slate-600 dark:text-[#8892a4] max-w-xs mx-auto text-sm md:text-base">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TESTIMONIALS */}
      <div className="relative z-10">
        <TestimonialCarousel testimonials={testimonials} />
      </div>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-28 relative z-10">
        <FAQAccordion items={faqItems} />
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-20 md:pb-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/80 backdrop-blur-xl p-8 md:p-16 lg:p-20 text-center shadow-[0_20px_60px_-15px_rgba(26,111,209,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#004a96]/10 via-transparent to-[#1A6FD1]/10" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[#1A6FD1]/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-slate-900 dark:text-white max-w-2xl mx-auto leading-tight">
              Votre prochain rendez-vous est à un{" "}
              <span className="font-fraunces font-semibold bg-gradient-to-br from-[#004a96] to-[#1A6FD1] bg-clip-text text-transparent">
                clic.
              </span>
            </h2>
            <p className="mt-5 text-slate-600 dark:text-[#8892a4] max-w-lg mx-auto text-base md:text-lg">
              Rejoignez des milliers de clients et professionnels qui ont choisi Bookify.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link to="/ClientRegister" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-medium bg-gradient-to-br from-[#004a96] to-[#1A6FD1] shadow-[0_4px_12px_-2px_#1A6FD1] hover:shadow-[0_6px_16px_-2px_#1A6FD1] transition-all hover:-translate-y-0.5">
                Commencer gratuitement <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/PrestataireRegister" className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-slate-300 dark:border-[#2d3148] text-slate-800 dark:text-[#e2e8f0] font-medium hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-[#1a1d27] hover:-translate-y-0.5 transition-all shadow-sm">
                Devenir Prestataire
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-[#2d3148]/60 bg-white/60 dark:bg-[#0f1117]/80 backdrop-blur relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <img
                src={theme === "dark" ? logoDark : logoLight}
                alt="Bookify"
                className="h-12 w-auto object-contain mb-4"
              />
              <p className="text-sm text-slate-600 dark:text-[#8892a4] max-w-sm">
                La marketplace qui connecte clients et professionnels vérifiés. Réservations instantanées, en toute confiance.
              </p>
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-semibold mb-4 text-sm">Produit</p>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-[#8892a4]">
                <li><a href="#stats" onClick={(e) => handleScroll(e, 'stats')} className="hover:text-[#1A6FD1] transition-colors cursor-pointer">Résultats</a></li>
                <li><a href="#services" onClick={(e) => handleScroll(e, 'services')} className="hover:text-[#1A6FD1] transition-colors cursor-pointer">Services</a></li>
                <li><a href="#pro" onClick={(e) => handleScroll(e, 'pro')} className="hover:text-[#1A6FD1] transition-colors cursor-pointer">Pour les pros</a></li>
                <li><a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="hover:text-[#1A6FD1] transition-colors cursor-pointer">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-slate-900 dark:text-white font-semibold mb-4 text-sm">Légal</p>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-[#8892a4]">
                <li><a href="#" className="hover:text-[#1A6FD1] transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-[#1A6FD1] transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-[#1A6FD1] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-[#2d3148]/60 flex flex-col md:flex-row justify-between gap-4 text-xs font-medium text-slate-500 dark:text-[#8892a4]">
            <p>© {new Date().getFullYear()} Bookify. Tous droits réservés.</p>
            <p>Fait avec passion à Casablanca.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}