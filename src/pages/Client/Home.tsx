import React, { useState, useEffect } from 'react';
import { Hospital, Sparkles, Briefcase, Wrench, Calendar, Shield, Star, ChevronRight, Clock, MapPin, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../services/api';

const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // 1. L'effet li kaybloqui l'scroll mli l'menu kaykon m7loul
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  useEffect(() => { 
    const h = () => setIsScrolled(window.scrollY > 20); 
    window.addEventListener('scroll', h); 
    return () => window.removeEventListener('scroll', h); 
  }, []);
  
  const scrollToSection = (id: string) => { 
    const s = document.getElementById(id); 
    if (s) {
      const y = s.getBoundingClientRect().top + window.pageYOffset - 80; 
      window.scrollTo({ top: y, behavior: "smooth" });
    } 
  };

  const categories = [
    { name: 'Sante & medical', icon: Hospital },
    { name: 'Beaute & Bien etre', icon: Sparkles },
    { name: 'Services profesionnels', icon: Briefcase },
    { name: 'Service techniques', icon: Wrench }
  ];

  const servicesData: { [k: string]: Array<{ title: string; img: string }> } = {
    'Sante & medical': [{ title: 'Médecin généraliste', img: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop' }, { title: 'Dentiste', img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&h=400&fit=crop' }, { title: 'Psychologue', img: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop' }, { title: 'Vétérinaire', img: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=400&fit=crop' }],
    'Beaute & Bien etre': [{ title: 'Coiffeur & Barbier', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop' }, { title: 'Maquilleur', img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=400&fit=crop' }, { title: 'Prothésiste ongulaire', img: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=400&fit=crop' }],
    'Services profesionnels': [{ title: 'Avocat', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop' }, { title: 'Consultant', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop' }, { title: 'Coach', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop' }],
    'Service techniques': [{ title: 'Mecanicien', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop' }, { title: 'Plombier', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop' }, { title: 'Électricien', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop' }, { title: 'Nettoyage', img: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop' }],
  };

  const [specialists, setSpecialists] = useState<any[]>([]);
  const [specialistsLoading, setSpecialistsLoading] = useState(true);

  const features = [
    { icon: Calendar, title: 'Réservation Instantanée', description: 'Prenez rendez-vous en quelques clics, 24h/24 et 7j/7' },
    { icon: Shield, title: 'Professionnels Vérifiés', description: 'Tous nos spécialistes sont certifiés et vérifiés' },
    { icon: Clock, title: 'Rappels Automatiques', description: 'Ne manquez plus jamais un rendez-vous médical' },
    { icon: Star, title: 'Avis Authentiques', description: 'Consultez les avis réels de milliers de patients' }
  ];

  const [stats, setStats] = useState([{ number: 0, label: 'Clients Actifs' }, { number: 0, label: 'Spécialistes' }, { number: 0, label: 'Rendez-vous' }, { number: 0, label: 'Note Moyenne' }]);
  
  useEffect(() => { 
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5148/api';
    fetch(`${baseUrl}/stats`)
      .then(r => r.json())
      .then(d => setStats([{ number: d.clients, label: 'Clients Actifs' }, { number: d.specialists, label: 'Spécialistes' }, { number: d.appointments, label: 'Rendez-vous' }, { number: d.averageRating, label: 'Note Moyenne' }]))
      .catch(() => {}); 
  }, []);

  useEffect(() => {
    setSpecialistsLoading(true);
    api.get('/prestataires/random')
      .then(res => {
        setSpecialists(res.data.map((p: any) => ({
          id: p.id,
          name: p.nom,
          specialty: p.specialite,
          rating: p.rating || 0,
          location: p.location || 'Maroc',
          avatar: p.avatar || null,
          available: true,
        })));
      })
      .catch(() => {})
      .finally(() => setSpecialistsLoading(false));
  }, []);

  
  useEffect(() => { 
    const s = localStorage.getItem('user'); 
    if (s) { 
      try { 
        const u = JSON.parse(s); 
        setUserName(u.nom || u.NomComplet || u.name || ''); 
      } catch (e) {} 
    } 
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F19] transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Fraunces:wght@600;700;800&display=swap');
        
        * { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; }
        .heading-font { font-family: 'Fraunces', serif; }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fade-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        /* HNA FIN BEDELT L'GRADIENT DYAL L'TITRE (Bookify Colors) */
        .sleek-gradient-text {
          background: linear-gradient(to right, #1A6FD1, #475569, #0c5a7c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .sleek-card {
          transition: all 0.3s ease;
        }
        .sleek-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -12px rgba(26, 111, 209, 0.2);
          border-color: rgba(26, 111, 209, 0.3);
        }
        
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; overflow-y: visible !important; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        
        /* Subtle Dot Grid pattern for background */
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(26, 111, 209, 0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}
      
      <div className={`fixed left-0 top-0 h-full w-64 border-r border-gray-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>        
        <Navbar activeSection={activeSection} onSectionChange={s => { setActiveSection(s); setIsSidebarOpen(false); }} />
      </div>

      <main className={`min-h-screen transition-all duration-300 lg:${isSidebarOpen ? 'ml-64' : 'ml-0'} bg-dot-pattern`}>
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        {/* Hero & Categories */}
        <section id="Categories" className="pt-16 pb-10 px-6 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[#1A6FD1] text-xs font-semibold tracking-wide uppercase mb-6">
              <Sparkles size={14} /> Découvrir
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold heading-font text-gray-900 dark:text-white tracking-tight mb-4">
              Pour ton Premier <br className="hidden sm:block" />
              <span className="sleek-gradient-text">Rendez‑Vous</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
              Sélectionnez une catégorie pour découvrir les services disponibles près de chez vous.
            </p>
          </div>
          
            {/* Categories */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto overflow-y-visible pb-4 pt-2 w-full scrollbar-hide">              
              {categories.map((cat, idx) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`group flex flex-col items-center justify-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300 min-w-[150px]
                      ${isSelected 
                        ? 'bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white border-transparent shadow-[0_4px_12px_rgba(26,111,209,0.3)] hover:shadow-[0_4px_10px_rgba(26,111,209,0.4)] hover:-translate-y-1 hover:scale-[1.02]' 
                        : 'bg-white/60 dark:bg-[#1a1d27]/50 border-slate-200 dark:border-[#2d3148] text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-[#1a1d27] hover:border-[#1A6FD1]/40 hover:text-[#1A6FD1] dark:hover:text-[#1A6FD1] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:scale-[1.02]'
                      }`}
                  >
                    <cat.icon size={26} className={`transition-transform duration-300 ${isSelected ? 'text-white' : 'text-[#1A6FD1] group-hover:scale-110 group-hover:-translate-y-0.5'}`} />
                    <span className="text-xs font-semibold whitespace-nowrap transition-colors duration-300">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
        </section>

        {/* Service cards */}
        <section className="pb-20 px-6 sm:px-8">
          <div
            className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6"
            style={{ perspective: '1200px' }}
          >
            <AnimatePresence mode="popLayout">
              {servicesData[selectedCategory]?.map((service, idx) => (
                <motion.div
                  layout
                  key={service.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.35,
                    delay: idx * 0.06,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  onClick={() => navigate(`/Service-Providers/${service.title}`)}
                  className="group cursor-pointer relative overflow-hidden rounded-2xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md sleek-card w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[240px] max-w-[300px]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img src={service.img} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-5">
                    <h3 className="text-white text-lg font-semibold tracking-tight">{service.title}</h3>
                    <div className="flex items-center gap-1 text-white/70 text-xs mt-1 font-medium transform translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      Explorer <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Specialists */}
        <section id="specialists" className="py-24 px-6 sm:px-8 border-t border-slate-200/50 dark:border-[#2d3148]/50 bg-white/30 dark:bg-[#1a1d27]/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold font-fraunces text-slate-900 dark:text-white tracking-tight">Nos Spécialistes à la Une</h2>
                <p className="text-slate-500 dark:text-[#8892a4] mt-2">Des professionnels qualifiés et vérifiés.</p>
              </div>
              <button className="group text-sm font-semibold text-[#1A6FD1] hover:text-[#0c5a7c] flex items-center gap-1 transition-colors">
                Voir tout <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialistsLoading
                ? [1,2,3].map(i => (
                  <div key={i} className="rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 p-6 animate-pulse">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="w-14 h-6 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/3" />
                    <div className="flex justify-between pt-5 border-t border-gray-200 dark:border-[#2d3148]">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-24" />
                    </div>
                  </div>
                ))
                : specialists.map((sp, idx) => (
                <div key={idx} onClick={() => navigate(`/provider/${sp.id}`)} className="group cursor-pointer rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(26,111,209,0.2)] hover:border-[#1A6FD1]/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Decorative Glow */}
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#1A6FD1]/10 blur-3xl pointer-events-none" />

                  <div className="flex justify-between items-start mb-5 relative">
                    <div className="relative">
                      {sp.avatar
                        ? <img src={sp.avatar} alt={sp.name} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-[#2d3148] shadow-sm" />
                        : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-xl">{sp.name?.charAt(0)}</div>
                      }
                      {sp.available && <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a1d27]" />}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1 rounded-lg">
                      <Star className="text-amber-500 fill-amber-500" size={14} />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{sp.rating ? sp.rating.toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{sp.name}</h3>
                  <p className="text-[#1A6FD1] text-sm font-semibold mb-4">{sp.specialty}</p>
                  
                  <div className="flex items-center gap-2 text-slate-500 dark:text-[#8892a4] text-sm mb-6">
                    <MapPin size={16} /> {sp.location}
                  </div>
                  
                  <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-[#2d3148]/60">
                    <span className="text-sm font-semibold text-slate-500 dark:text-gray-400">Voir profil</span>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/provider/${sp.id}`); }}
                      className="px-5 py-2.5 bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white rounded-xl text-sm font-semibold shadow-[0_3px_10px_-4px_#1A6FD1] hover:shadow-[0_5px_9px_-4px_#1A6FD1] hover:brightness-110 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="services" className="py-24 px-6 sm:px-8 border-t border-gray-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold heading-font text-gray-900 dark:text-white tracking-tight mb-4">Pourquoi Choisir Bookify ?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Une infrastructure conçue pour rendre vos réservations fluides, rapides et sécurisées.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-[#151B2B] border border-gray-200 dark:border-white/5 sleek-card">
                    <div className="w-12 h-12 mb-5 rounded-lg bg-[#1A6FD1]/10 flex items-center justify-center border border-[#1A6FD1]/20">
                      <Icon className="text-[#1A6FD1]" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 sm:px-8 border-t border-slate-200/50 dark:border-[#2d3148]/50">
          <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[2.5rem] border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/80 backdrop-blur-xl p-10 sm:p-20 text-center shadow-[0_20px_60px_-15px_rgba(26,111,209,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#004a96]/10 via-transparent to-[#1A6FD1]/10" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[#1A6FD1]/30 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold font-fraunces text-slate-900 dark:text-white tracking-tight mb-6">
                Prêt à simplifier votre vie ?
              </h2>
              <p className="text-lg text-slate-600 dark:text-[#8892a4] mb-10 max-w-xl mx-auto">
                Rejoignez des milliers d'utilisateurs qui font confiance à notre plateforme chaque jour.
              </p>

              {/* BUTTON CTA (Hover UI Upgraded) */}
              <button onClick={() => scrollToSection("Categories")} className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white rounded-xl font-semibold shadow-[0_3px_10px_-4px_#1A6FD1] hover:shadow-[0_5px_15px_-4px_#1A6FD1] hover:brightness-110 transition-all duration-300 hover:-translate-y-1">
                Commencer Maintenant <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    </div>
  );
};

export default Home;
