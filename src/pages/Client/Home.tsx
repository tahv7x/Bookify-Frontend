import React, { useState, useEffect } from 'react';
import { Hospital , Sparkles,  Briefcase, Wrench, Calendar, Shield, Star, ChevronRight, Clock, MapPin } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';

const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToSection = (id: string) => {
  const section = document.getElementById(id);
    if (section) {
     const yOffset = -100; 
    const y =
      section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };


  const categories = [
  { name: 'Sante & medical', icon: Hospital },
  { name: 'Beaute & Bien etre', icon: Sparkles },
  { name: 'Services profesionnels', icon: Briefcase },
  { name: 'Service techniques', icon: Wrench },

];



const servicesData: { [key: string]: Array<{ title: string; img: string }> } = {
  'Sante & medical': [
    { title: 'Médecin généraliste', img: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop' },
    { title: ' Dentiste', img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&h=400&fit=crop' },
    { title: 'Psychologue', img: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop' },
    { title: 'Vétérinaire', img: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=400&fit=crop'  }
  ],

  'Beaute & Bien etre': [
    { title: 'Coiffeur / Barbier', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop' },
    { title: 'Maquilleur', img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=400&fit=crop' },
    { title: 'Prothésiste ongulaire', img: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=400&fit=crop' }
  ],

  'Services profesionnels': [
    { title: 'Avocat', img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop' },
    { title: 'Consultant', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop' },
    { title: 'Coach (sportif, pro, vie)', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop' },
  ],

  'Service techniques': [
    { title: 'Mecanicien', img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop' },
    { title: 'Plombier', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop' },
    { title: 'Électricien', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop' },
    { title: 'Nettoyage', img: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop' }
  ],

};
  const specialists = [
    {
      name: 'Dr. Youssef Alami',
      specialty: 'Dentiste',
      rating: 4.9,
      reviews: 127,
      image: 'https://i.pravatar.cc/150?img=12',
      location: 'Casablanca',
      price: '300 MAD',
      available: true
    },
    {
      name: 'Dr. Sara Bennis',
      specialty: 'Cardiologue',
      rating: 5.0,
      reviews: 89,
      image: 'https://i.pravatar.cc/150?img=45',
      location: 'Rabat',
      price: '500 MAD',
      available: true
    },
    {
      name: 'Dr. Ahmed Tazi',
      specialty: 'Psychologue',
      rating: 4.8,
      reviews: 156,
      image: 'https://i.pravatar.cc/150?img=33',
      location: 'Marrakech',
      price: '400 MAD',
      available: false
    },
    {
      name: 'Dr. Malika Fassi',
      specialty: 'Pédiatre',
      rating: 4.9,
      reviews: 203,
      image: 'https://i.pravatar.cc/150?img=47',
      location: 'Casablanca',
      price: '350 MAD',
      available: true
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Réservation Instantanée',
      description: 'Prenez rendez-vous en quelques clics, 24h/24 et 7j/7'
    },
    {
      icon: Shield,
      title: 'Professionnels Vérifiés',
      description: 'Tous nos spécialistes sont certifiés et vérifiés'
    },
    {
      icon: Clock,
      title: 'Rappels Automatiques',
      description: 'Ne manquez plus jamais un rendez-vous médical'
    },
    {
      icon: Star,
      title: 'Avis Authentiques',
      description: 'Consultez les avis réels de milliers de patients'
    }
  ];

  const [stats, setStats] = useState([
    { number: 0, label: 'Clients Actifs' },
    { number: 0, label: 'Spécialistes' },
    { number: 0, label: 'Rendez-vous' },
    { number: 0, label: 'Note Moyenne' }
  ]);
  useEffect(() => {
    fetch("http://localhost:5000/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats([
          { number: data.clients, label: 'Clients Actifs' },
          { number: data.specialists, label: 'Spécialistes' },
          { number: data.appointments, label: 'Rendez-vous' },
          { number: data.averageRating, label: 'Note Moyenne' }
        ]);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Fraunces:wght@600;700&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .heading-font {
          font-family: 'Fraunces', serif;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-fade-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-left {
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .brand-gradient {
          background: linear-gradient(135deg, #004a96 0%, #1A6FD1 100%);
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card-hover:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
        }

        .mesh-gradient {
          background: radial-gradient(at 40% 20%, hsla(230, 70%, 65%, 0.15) 0px, transparent 50%),
                      radial-gradient(at 80% 0%, hsla(280, 60%, 70%, 0.15) 0px, transparent 50%),
                      radial-gradient(at 0% 50%, hsla(195, 70%, 65%, 0.15) 0px, transparent 50%);
        }

        .text-gradient {
          background: linear-gradient(135deg, #004a96 0%, #1A6FD1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .sidebar-overlay {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40 "
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white transform transition-transform duration-300 z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        <Navbar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setIsSidebarOpen(false);
          }}
        />
      </div>

      {/* Main Content */}
      <main
          className={`
            min-h-screen transition-all duration-300
            lg:${isSidebarOpen ? 'ml-64' : 'ml-0'}
          `}
        >

        {/* Top Bar */}
        <TopBar 
          userName="Aya"
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />

        {/* Hero Section */}
        <section className="pt-8 pb-20 px-4 sm:px-6 lg:px- overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center text-center">
              {/* Left Content */}
              <div className="space-y-8 max-w-3xl mx-auto flex flex-col items-center">
                <div className="inline-block px-4 py-2 bg-blue-100 rounded-full animate-fade-up" style={{ opacity: 0, animationDelay: '0.1s' }}>
                  <span className="text-[#0059B2] font-semibold text-sm">🎯 Réservation simplifiée</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold heading-font text-gray-900 leading-tight animate-fade-up" style={{ opacity: 0, animationDelay: '0.2s' }}>
                  Trouvez le bon{' '}
                  <span className="text-gradient">professionnel</span>
                  {' '}en un clic
                </h1>
                <div className="relative z-10 container mx-auto px-4 py-1 md:py-2 lg:py-2">
                    {/* Image container */}
                    <div 
                      className="relative w-full overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02]" 
                      style={{
                        borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
                        aspectRatio: '16/9'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 z-10" />
                      <img 
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
                        alt="Professional services team"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                </div>
                
                <p className="text-lg text-gray-600 leading-relaxed animate-fade-up" style={{ opacity: 0, animationDelay: '0.3s' }}>
                  Réservez vos rendez-vous instantanément avec les meilleurs professionnels de votre région.
                </p>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 animate-fade-up" style={{ opacity: 0, animationDelay: '0.5s' }}>
                  {stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-gradient">{stat.number}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="Categories" className="py-8 px-7 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold heading-font text-gray-900 leading-tight text-center mb-3">
            Pour ton Premier{' '}
            <span className="text-gradient">Rendez‑Vous</span>
          </p>
          <p className=" text-center mb-8 text-lg sm:text-xl text-gray-600">
            Sélectionnez une catégorie pour découvrir les services disponibles
          </p>

            <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat, idx) => (
                <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex flex-col items-center justify-center gap-2
                      px-3 sm:px-4 py-3 rounded-lg transition-all duration-300 ease-in-out
                      whitespace-normal text-center
                      min-w-[80px] sm:min-w-[100px]
                      hover:scale-105 hover:shadow-md
                      ${
                        selectedCategory === cat.name
                          ? 'text-[#0059B2]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                      }`}
                  >
                    {/* Icon */}
                    <span className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <cat.icon size={28} className="sm:w-7 sm:h-7" />
                    </span>
                    {/* Text */}
                    <span className="text-xs sm:text-sm font-medium leading-tight break-words">
                      {cat.name}
                    </span>

                    {selectedCategory === cat.name && (
                      <div className="w-full h-1 bg-[#0059B2] rounded-full mt-1 transition-all duration-300 animate-scale-in"></div>
                    )}
                  </button>

              ))}
            </div>
          </div>
        </section>

        {/* Service Cards Section - Dynamic based on selected category */}
        <section className="py-1 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div
                key={selectedCategory}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              >
              {servicesData[selectedCategory]?.map((service, idx) => (
                <div 
                  key={idx}
                 className="group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer 
                  transform transition-all duration-500 ease-out 
                  hover:-translate-y-3 hover:scale-[1.03] active:scale-95"
                  style={{
                    opacity: 0,
                    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    animationDelay: `${idx * 0.15}s`
                  }}
                >
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t 
                      from-black/70 via-black/30 to-transparent 
                      opacity-80 group-hover:opacity-100 transition-all duration-500"></div>
                    <h3 className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white text-lg sm:text-2xl font-bold">
                      {service.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialists Grid */}
        <section id="specialists" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-5xl font-bold heading-font text-gray-900 mb-4">
                Nos Spécialistes
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Choisissez parmi des centaines de professionnels qualifiés
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {specialists.map((specialist, idx) => (
                <div
                  key={idx}
                  className="card-hover bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"
                  style={{ opacity: 0, animation: 'fadeInUp 0.6s forwards', animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="relative mb-4">
                    <img
                      src={specialist.image}
                      alt={specialist.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto"
                    />
                    {specialist.available && (
                      <div className="absolute top-12 right-24 sm:top-16 sm:right-20  w-4 h-4 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-center mb-1 text-sm sm:text-base">{specialist.name}</h3>
                  <p className="text-[#0059B2] text-xs sm:text-sm text-center mb-3">{specialist.specialty}</p>

                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="text-yellow-400 fill-yellow-400" size={14} />
                    <span className="font-semibold text-sm">{specialist.rating}</span>
                    <span className="text-gray-500 text-xs">({specialist.reviews})</span>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-gray-600 text-xs sm:text-sm mb-4">
                    <MapPin size={12} />
                    {specialist.location}
                  </div>

                  <div className="text-center mb-4">
                    <span className="text-xm sm:text-xl font-bold text-gray-900">{specialist.price}</span>
                    <span className="text-gray-500 text-xs">/consultation</span>
                  </div>

                  <button className="w-full py-2 sm:py-3 bg-gradient-to-r  from-[#004a96] to-[#1A6FD1] text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 text-sm">
                    Réserver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold heading-font text-gray-900 mb-4">
                Pourquoi Choisir 
                <span className="text-gradient"> Bookify ?</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Une expérience de réservation simple et efficace
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="text-center"
                    style={{ opacity: 0, animation: 'fadeInUp 0.6s forwards', animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-[#0059B2] to-[#1A6FD1] rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 brand-gradient">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-bold heading-font text-white mb-4 sm:mb-6">
              Prêt à Réserver Votre Rendez-vous?
            </h2>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8">
              Rejoignez des milliers de patients satisfaits et trouvez votre spécialiste dès aujourd'hui
            </p>
            <button
              onClick={() => scrollToSection("Categories")}
              className="px-8 sm:px-12 py-3 sm:py-4 bg-white text-[#0059B2] rounded-full font-bold text-base sm:text-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              Commencer Maintenant
              <ChevronRight className="inline ml-2" size={20} />
            </button>

          </div>
        </section>
        <Footer/>
      </main>
    </div>
  );
};

export default Home;



