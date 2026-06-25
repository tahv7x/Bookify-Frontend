import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronLeft, Star, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import MobileBottomNav from '../../components/Client/MobileBottomNav';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { getDisponibilites } from '../../services/provider/disponibiliteService';
import toast from 'react-hot-toast';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const toLocalISOString = (date: Date) => {
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const toLocalDateString = (date: Date) => {
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const buildDefaultGrid = () => {
  const grid = [];
  const today = new Date();
  const daysMap = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const shortDaysMap = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    grid.push({
      day: `${shortDaysMap[d.getDay()]} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      dbDay: daysMap[d.getDay()],
      date: toLocalDateString(d),
      slots: TIME_SLOTS.map(time => ({ time, available: false }))
    });
  }
  return grid;
};

const ServiceBooking: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Client");

  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      try { setUserName(JSON.parse(s).nomComplet); } catch { /* intentionally ignored */ }
    }

    api.get(`/services/${id}`)
      .then(res => setService(res.data))
      .catch(err => setError("Service introuvable"))
      .finally(() => setIsLoading(false));
  }, [id]);

  const images = service?.imageUrls ? service.imageUrls.split(',').filter(Boolean) : [];

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000); // Change image every 4 seconds
      return () => clearInterval(interval);
    }
  }, [images.length]);

  useEffect(() => {
    if (service?.prestataire?.id) {
      Promise.all([
        getDisponibilites(service.prestataire.id),
        api.get(`/RendezVous/prestataire/${service.prestataire.id}/occupied`).then(res => res.data).catch(() => [])
      ]).then(([data, occupied]) => {
        const isDaily = Boolean(service?.isFullDay) || /jour/i.test(service?.uniteDuree || "");
        const grid = buildDefaultGrid();

        data.forEach((dayData: any) => {
          const fullDayMap: Record<string, string> = {
            'lun': 'lundi', 'mar': 'mardi', 'mer': 'mercredi', 'jeu': 'jeudi', 'ven': 'vendredi', 'sam': 'samedi', 'dim': 'dimanche'
          };
          const dbDayMapped = fullDayMap[dayData.day.toLowerCase()] || dayData.day.toLowerCase();
          const matchingGridDays = grid.filter(d => d.dbDay.toLowerCase() === dbDayMapped);
          matchingGridDays.forEach(gridDay => {
            const hasFullDay = dayData.slots.some((s: any) => s.time === null || s.time === '00:00');
            (gridDay as any).isFullDayConfigured = hasFullDay;

            if (hasFullDay) {
              gridDay.slots.forEach(s => s.available = dayData.slots.find((s: any) => s.time === null || s.time === '00:00')?.available || true);
            } else {
              dayData.slots.forEach((dbSlot: any) => {
                const slotIndex = gridDay.slots.findIndex((s: any) => s.time === dbSlot.time);
                if (slotIndex !== -1) {
                  gridDay.slots[slotIndex].available = dbSlot.available;
                }
              });
            }
          });
        });

        // Filter out slots that overlap with accepted appointments
        const duree = service.duree || 1;
        const unite = (service.uniteDuree || 'HEURES').toUpperCase();

        if (!isDaily) {
          let durationInHours = 1;
          if (unite.includes('MINUTE')) {
            durationInHours = Math.ceil(duree / 60);
          } else if (unite.includes('HEURE') || unite.includes('HOUR')) {
            durationInHours = duree;
          }

          grid.forEach(gridDay => {
            const baseAvailable = gridDay.slots.map(s => s.available);
            gridDay.slots.forEach((slot, idx) => {
              if (!slot.available) return;
              let isFullyAvailable = true;
              for (let k = 0; k < durationInHours; k++) {
                if (idx + k >= gridDay.slots.length || !baseAvailable[idx + k]) {
                  isFullyAvailable = false;
                  break;
                }
              }
              if (!isFullyAvailable) {
                slot.available = false;
              }
            });
          });
        }

        grid.forEach(gridDay => {
          gridDay.slots.forEach(slot => {
            if (!slot.available) return;

            // Compute local start/end for this slot
            const slotStart = isDaily
              ? new Date(`${gridDay.date}T00:00:00`)
              : new Date(`${gridDay.date}T${slot.time}:00`);
            const slotEnd = new Date(slotStart);
            if (unite.includes('JOUR')) {
              slotEnd.setDate(slotEnd.getDate() + duree);
            } else if (unite.includes('MINUTE')) {
              slotEnd.setMinutes(slotEnd.getMinutes() + duree);
            } else {
              slotEnd.setHours(slotEnd.getHours() + duree);
            }

            // Check if any occupied slot overlaps
            const hasOverlap = occupied.some((occ: any) => {
              const occStart = new Date(occ.dateDebut);
              const occEnd = new Date(occ.dateFin || occStart.getTime() + 60 * 60 * 1000);

              return occStart < slotEnd && occEnd > slotStart;
            });

            if (hasOverlap) {
              slot.available = false;
            }
          });
        });

        setAvailabilityData(grid);
        const firstAvailableDay = grid.find((d) => {
          if (isDaily) return (d as any).isFullDayConfigured || d.slots.some((s: any) => s.available);
          return d.slots.some((s: any) => s.available);
        });
        if (firstAvailableDay) setActiveDate(firstAvailableDay.date);
        else setActiveDate(grid[0].date);
      }).catch(err => console.error("Could not fetch availability", err));
    }
  }, [service]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      const isDaily = Boolean(service?.isFullDay) || /jour/i.test(service?.uniteDuree || "");
      const [dateStr, time] = selectedSlot.split(" ");
      const start = isDaily ? new Date(`${dateStr}T00:00:00`) : new Date(`${dateStr}T${time}:00`);
      const end = new Date(start);

      const duree = service.duree || 1;
      const unite = (service.uniteDuree || 'HEURES').toUpperCase();

      if (unite.includes('JOUR')) {
        end.setDate(end.getDate() + duree);
      } else if (unite.includes('MINUTE')) {
        end.setMinutes(end.getMinutes() + duree);
      } else {
        end.setHours(end.getHours() + duree);
      }

      await api.post('/rendezvous', {
        idPres: service.prestataire.id,
        idServ: service.idService,
        dateDebut: toLocalISOString(start),
        dateFin: toLocalISOString(end)
      });

      // Show success, wait a sec, then redirect
      toast.success("Demande de réservation envoyée avec succès !");
      navigate('/Mes-Rendez-Vous');
    } catch (error: any) {
      console.error(error);
      const data = error.response?.data;
      if (data?.errors) {
        toast.error("Erreur de validation: " + JSON.stringify(data.errors));
      } else {
        toast.error(data?.message || "Erreur lors de la réservation");
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0d1117]' : 'bg-[#eef2fc]'}`}>
        <div className="w-16 h-16 border-4 border-[#1A6FD1]/30 border-t-[#1A6FD1] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#0d1117] text-white' : 'bg-[#eef2fc] text-gray-900'}`}>
        <h2 className="text-2xl font-bold mb-4">{error || "Erreur"}</h2>
        <button onClick={() => navigate('/Explore')} className="text-[#1A6FD1] hover:underline">Retourner à l'exploration</button>
      </div>
    );
  }

  // The 'images' array is already calculated above

  return (
    <div className={`relative min-h-screen ${isDark ? 'text-[#e2e8f0] bg-[#0d1117]' : 'text-slate-900 bg-[#eef2fc]'} font-sans transition-colors duration-300`}>
      <style>{`
        .glass-panel {
          background: ${isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))'};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,215,255,0.5)'};
          box-shadow: ${isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(26,111,209,0.08)'};
        }
      `}</style>

      {/* Navigation */}
      {isSidebarOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-40" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed left-0 top-0 h-full w-64 bg-transparent transform transition-transform duration-300 ease-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection="explore" onSectionChange={() => setIsSidebarOpen(false)} />
      </div>

      <main className="min-h-screen pb-20 md:pb-0">
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 font-semibold mb-6 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors w-max`}>
            <ChevronLeft size={20} /> Retour
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Content: Service Details */}
            <div className="flex-1 space-y-6">

              {/* Hero Image Carousel */}
              <div className="w-full h-[300px] sm:h-[400px] rounded-3xl overflow-hidden glass-panel relative group">
                {images.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={images[currentImageIndex]}
                      alt={service.nom}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#1A6FD1] opacity-50 relative z-0">
                    <ImageIcon size={64} className="mb-4" />
                    <span className="font-bold">Aucune image fournie</span>
                  </div>
                )}

                {/* Dots indicator */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 right-8 z-20 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 sm:p-8 z-10 pointer-events-none">
                  <div className="pointer-events-auto">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{service.nom}</h1>
                    <div className="flex items-center gap-4 text-white/90 text-sm font-semibold">
                      <span className="flex items-center gap-1.5"><Clock size={16} /> {service.duree} {service.uniteDuree}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      <span className="text-amber-400 font-bold text-lg">{service.prix} MAD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-4">À propos de ce service</h2>
                <p className={`whitespace-pre-line leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {service.description || "Aucune description fournie par le prestataire."}
                </p>
              </div>

              {/* Galerie de miniatures */}
              {images.length > 1 && (
                <div className="glass-panel rounded-3xl p-6 sm:p-8 mt-6">
                  <h3 className="text-xl font-bold mb-4">Galerie photos</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {images.map((img: string, i: number) => (
                      <div
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ${i === currentImageIndex ? 'ring-4 ring-[#1A6FD1] scale-[1.02] shadow-xl z-10' : 'hover:scale-[1.02] opacity-70 hover:opacity-100'}`}
                      >
                        <img src={img} alt={`Aperçu ${i}`} className="w-full h-full object-cover" />
                        {i !== currentImageIndex && (
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Content: Booking & Provider */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6">

              {/* Provider Info Card */}
              <div className="glass-panel rounded-3xl p-6 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate(`/Service-Provider-Profile/${service.prestataire.id}`)}>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Prestataire</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/20">
                    {service.prestataire.avatar ? (
                      <img src={service.prestataire.avatar} alt={service.prestataire.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-xl">
                        {service.prestataire.nom?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg hover:text-[#1A6FD1] transition-colors">{service.prestataire.nom}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500"><Star size={12} className="fill-current" /> {service.prestataire.note}</div>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} /> {service.prestataire.adresse || "Maroc"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form Card */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Réserver ce service</h3>

                <form onSubmit={handleBooking} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-4">Quand voulez-vous commencer ?</label>

                    {(() => {
                      const isDaily = Boolean(service?.isFullDay) || /jour/i.test(service?.uniteDuree || "");
                      const availableDays = availabilityData.filter((d) => {
                        if (isDaily) return d.isFullDayConfigured || d.slots.some((s: any) => s.available);
                        return d.slots.some((s: any) => s.available);
                      });

                      if (isDaily) {
                        return (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 8 }}>
                            {availableDays.map((d) => {
                              const key = `${d.date} 00:00`;
                              const isSelected = selectedSlot === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setSelectedSlot(isSelected ? null : key)}
                                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${isSelected ? 'bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white shadow-md border border-transparent scale-[1.02]' : 'bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-sky-700 dark:text-sky-400 hover:bg-white/80 dark:hover:bg-white/10 hover:border-[#1A6FD1] dark:hover:border-white/20'}`}
                                >
                                  <span className="text-[10px] font-bold uppercase opacity-80">{d.day.split(' ')[0]}</span>
                                  <span className="text-sm font-black">{d.day.split(' ')[1]}</span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                            {availableDays.map((d) => {
                              const isActive = activeDate === d.date;
                              return (
                                <button
                                  key={d.date}
                                  type="button"
                                  onClick={() => setActiveDate(d.date)}
                                  className={`min-w-[64px] p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${isActive ? 'bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white shadow-md border border-transparent scale-[1.02]' : 'bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
                                >
                                  <span className="text-[9px] font-bold uppercase opacity-80">{d.day.split(' ')[0]}</span>
                                  <span className="text-sm font-black">{d.day.split(' ')[1]}</span>
                                </button>
                              );
                            })}
                            {availableDays.length === 0 && (
                              <div className="text-sm text-gray-500 w-full text-center py-2">Aucun jour disponible</div>
                            )}
                          </div>

                          {activeDate && (() => {
                            const activeDayData = availabilityData.find((d) => d.date === activeDate);
                            if (!activeDayData) return null;

                            return (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {activeDayData.slots.map((slot: any, idx: number) => {
                                    // Hide past slots for hourly services
                                    const isDailyService = Boolean(service?.isFullDay) || /jour/i.test(service?.uniteDuree || "");
                                    let isPast = false;
                                    if (!isDailyService && slot.time) {
                                      const [hours, minutes] = slot.time.split(':').map(Number);
                                      const slotDateTime = new Date(activeDayData.date);
                                      slotDateTime.setHours(hours, minutes, 0, 0);
                                      
                                      if (slotDateTime < new Date()) {
                                        isPast = true;
                                      }
                                    }

                                    const dur = service.duree || 1;
                                    const unit = (service.uniteDuree || 'HEURES').toUpperCase();
                                    
                                    let dureeInHours = 1;
                                    if (unit.includes('MINUTE')) {
                                      dureeInHours = Math.ceil(dur / 60);
                                    } else if (unit.includes('HEURE') || unit.includes('HOUR')) {
                                      dureeInHours = dur;
                                    }

                                    const isDisabled = !slot.available || isPast;

                                    // Determine if this slot is part of the currently selected start slot range
                                    let isHighlighted = false;
                                    if (selectedSlot && selectedSlot.startsWith(activeDayData.date)) {
                                      const selectedTime = selectedSlot.split(" ")[1];
                                      const selectedIdx = activeDayData.slots.findIndex((s: any) => s.time === selectedTime);
                                      if (selectedIdx !== -1 && idx >= selectedIdx && idx < selectedIdx + dureeInHours) {
                                        isHighlighted = true;
                                      }
                                    }

                                    // Determine if this slot is part of the currently hovered slot range
                                    let isHovered = false;
                                    if (hoveredIndex !== null && idx >= hoveredIndex && idx < hoveredIndex + dureeInHours) {
                                      isHovered = true;
                                    }

                                    const key = `${activeDayData.date} ${slot.time}`;

                                    let btnClasses = "p-3 rounded-xl text-sm font-bold transition-all border text-center ";
                                    if (isDisabled) {
                                      btnClasses += "bg-slate-100/10 dark:bg-white/[0.02] border-slate-200/10 dark:border-white/5 text-slate-400 dark:text-slate-600 opacity-30 cursor-not-allowed pointer-events-none";
                                    } else if (isHighlighted) {
                                      btnClasses += "bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white border-transparent shadow-md scale-[1.02] shadow-blue-500/20";
                                    } else if (isHovered) {
                                      btnClasses += "bg-blue-500/15 dark:bg-blue-500/25 border-[#1A6FD1] dark:border-blue-500 text-[#1A6FD1] dark:text-blue-300 scale-[1.02]";
                                    } else {
                                      btnClasses += "bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-sky-700 dark:text-sky-400 hover:bg-white/80 dark:hover:bg-white/10 hover:border-[#1A6FD1] dark:hover:border-white/20";
                                    }

                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => setSelectedSlot(key)}
                                        onMouseEnter={() => !isDisabled && setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={btnClasses}
                                      >
                                        {slot.time}
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                          })()}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Prix total estimé</span>
                      <span className="text-lg font-extrabold text-[#1A6FD1]">{service.prix} MAD</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      La réservation n'est pas immédiate. Le prestataire devra confirmer sa disponibilité pour la date choisie.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isBooking || !selectedSlot}
                    className="w-full bg-gradient-to-r from-[#004a96] to-[#1A6FD1] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
                  >
                    {isBooking ? 'Envoi...' : 'Confirmer la demande'}
                  </button>
                </form>

              </div>

            </div>
          </div>

        </div>

        <Footer />
        <MobileBottomNav />
      </main>
    </div>
  );
};

export default ServiceBooking;
