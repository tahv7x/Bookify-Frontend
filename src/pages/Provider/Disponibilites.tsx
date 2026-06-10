import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Provider/Navbar';
import TopBar from '../../components/Provider/TopBar';
import Footer from '../../components/Provider/Footer';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { getMyDisponibilites, addDisponibilite, deleteDisponibilite } from '../../services/provider/disponibiliteService';
import toast from 'react-hot-toast';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const buildDefaultGrid = () => {
  return DAYS.map(day => ({
    day,
    slots: TIME_SLOTS.map(time => ({ id: null, time, available: false }))
  }));
};

const Disponibilites: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] = useState(buildDefaultGrid());
  const [savingSlot, setSavingSlot] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      try {
        const u = JSON.parse(s);
        setUserName(u.nom || u.nomComplet || '');
      } catch (e) { }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMyDisponibilites();
      const grid = buildDefaultGrid();
      
      // Combine DB data with the default grid
      data.forEach((dayData: any) => {
        const dayIndex = grid.findIndex(d => d.day === dayData.day);
        if (dayIndex !== -1) {
          dayData.slots.forEach((dbSlot: any) => {
            const slotIndex = grid[dayIndex].slots.findIndex(s => s.time === dbSlot.time);
            if (slotIndex !== -1) {
              grid[dayIndex].slots[slotIndex].available = dbSlot.available;
              grid[dayIndex].slots[slotIndex].id = dbSlot.id; // Store ID for updates/deletes
            }
          });
        }
      });
      setAvailabilityData(grid);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("Votre session est expirée ou invalide. Veuillez vous reconnecter.");
      } else {
        toast.error('Erreur lors du chargement de vos disponibilités');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0);
    date.setHours(date.getHours() + 1); // +1 hour duration
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const toggleSlot = async (dayIndex: number, slotIndex: number) => {
    const day = availabilityData[dayIndex].day;
    const slot = availabilityData[dayIndex].slots[slotIndex];
    const key = `${day}-${slot.time}`;
    
    setSavingSlot(key);
    
    try {
      if (slot.available && slot.id) {
        // Remove slot
        await deleteDisponibilite(slot.id);
        toast.success("Créneau retiré");
      } else {
        // Add slot
        await addDisponibilite({
          Jour: day,
          HeureDebut: slot.time,
          HeureFin: calculateEndTime(slot.time),
          Disponible: true
        });
        toast.success("Créneau ajouté");
      }
      // Refresh to get the new IDs
      await fetchData();
    } catch (error: any) {
      if (error.response?.status === 403) {
         toast.error("Veuillez vous déconnecter et vous reconnecter.");
      } else {
         toast.error("Erreur lors de la modification du créneau.");
      }
    } finally {
      setSavingSlot(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { font-family:'Poppins',-apple-system,BlinkMacSystemFont,sans-serif; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 4px 24px -4px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
        }
        .dark .glass-card {
          background: rgba(26, 29, 39, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#1a1d27] transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection="disponibilites" onSectionChange={() => setIsSidebarOpen(false)} />
      </div>

      <main className={`min-h-screen flex flex-col transition-all duration-300 lg:${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
          
          <div className="mb-8">
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gérer mes disponibilités</h1>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sélectionnez simplement les créneaux où vous souhaitez être disponible pour vos clients.</p>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="text-[#1A6FD1]" size={18}/> Grille des horaires
              </h2>
              {loading && <RefreshCw size={18} className="text-gray-400 animate-spin" />}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mb-8 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block"/> Disponible</span>
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700 inline-block"/> Non Disponible</span>
            </div>

            {/* Schedule Grid */}
            <div className="overflow-x-auto -mx-1">
              <div className="min-w-[500px] px-1">
                {/* Day headers */}
                <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
                  <div/>
                  {availabilityData.map((d: any) => (
                    <div key={d.day} className="text-center text-[12px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-1">{d.day}</div>
                  ))}
                </div>

                {/* Time rows */}
                {TIME_SLOTS.map((timeLabel: string, slotIdx: number) => (
                  <div key={slotIdx} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
                    {/* Time label */}
                    <div className="flex items-center justify-end pr-3 border-r border-gray-100 dark:border-white/5">
                      <span className="text-[12px] font-bold text-gray-400">{timeLabel}</span>
                    </div>
                    {/* Slot cells */}
                    {availabilityData.map((dayData: any, dayIdx: number) => {
                      const slot = dayData.slots[slotIdx];
                      const isSaving = savingSlot === `${dayData.day}-${slot.time}`;

                      return (
                        <button
                          key={dayData.day}
                          onClick={() => toggleSlot(dayIdx, slotIdx)}
                          disabled={isSaving}
                          className={`
                            relative h-11 rounded-xl text-[12px] font-bold transition-all duration-200 border flex items-center justify-center
                            ${slot.available 
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-500 hover:text-white hover:border-transparent hover:scale-105 hover:shadow-md' 
                              : 'bg-gray-50 dark:bg-[#111827] text-gray-400 border-gray-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }
                            ${isSaving ? 'opacity-50 cursor-not-allowed scale-95' : ''}
                          `}
                        >
                          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : slot.time}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-start gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                 <CalendarIcon size={14} className="text-[#0059B2] dark:text-blue-400" />
               </div>
               <div>
                  <p className="text-sm font-bold text-[#0059B2] dark:text-blue-400 mb-1">Comment ça marche ?</p>
                  <p className="text-xs text-blue-800/70 dark:text-blue-300/70 leading-relaxed">Cliquez simplement sur les cases grises pour les rendre vertes (Disponibles). Cliquez sur une case verte pour la retirer. Vos choix sont sauvegardés automatiquement et immédiatement visibles pour vos clients sur votre profil.</p>
               </div>
            </div>

          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Disponibilites;
