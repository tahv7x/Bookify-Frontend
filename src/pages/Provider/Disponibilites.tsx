import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Save, Info, AlertCircle } from 'lucide-react';
import { getMyDisponibilites, updateMyDisponibilitesBatch } from '../../services/provider/disponibiliteService';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

interface DayData {
  day: string;
  isFullDay: boolean;
  fullStartTime: string;
  fullEndTime: string;
  slots: { [time: string]: boolean };
  dbIds: number[];
}

const buildDefaultData = (): DayData[] => {
  return DAYS.map(day => {
    const slots: Record<string, boolean> = {};
    TIME_SLOTS.forEach(t => slots[t] = false);
    return {
      day,
      isFullDay: false,
      fullStartTime: '09:00',
      fullEndTime: '18:00',
      slots,
      dbIds: []
    };
  });
};

const Disponibilites: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<DayData[]>(buildDefaultData());
  const { isDark } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMyDisponibilites();
      const newSchedule = buildDefaultData();
      
      data.forEach((d: any) => {
        const fullDayMap: Record<string, string> = {
          'Lun': 'Lundi', 'Mar': 'Mardi', 'Mer': 'Mercredi', 'Jeu': 'Jeudi', 'Ven': 'Vendredi', 'Sam': 'Samedi', 'Dim': 'Dimanche',
          'Lundi': 'Lundi', 'Mardi': 'Mardi', 'Mercredi': 'Mercredi', 'Jeudi': 'Jeudi', 'Vendredi': 'Vendredi', 'Samedi': 'Samedi', 'Dimanche': 'Dimanche'
        };
        const mappedDay = fullDayMap[d.day] || d.day;
        const scheduleDay = newSchedule.find(s => s.day === mappedDay);

        if (scheduleDay && d.slots && d.slots.length > 0) {
          scheduleDay.dbIds = d.slots.map((s: any) => s.id);
          
          if (d.slots.length === 1 && (d.slots[0].time === null || d.slots[0].time === '00:00')) {
            scheduleDay.isFullDay = true;
          } else {
            // Multiple slots (Grid Mode)
            d.slots.forEach((s: any) => {
              if (s.time) {
                const t = s.time.substring(0, 5);
                if (scheduleDay.slots[t] !== undefined) {
                  scheduleDay.slots[t] = true;
                }
              }
            });
          }
        }
      });
      setSchedule(newSchedule);
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

  const handleToggleFullDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isFullDay = !newSchedule[index].isFullDay;
    setSchedule(newSchedule);
  };

  const handleChangeTime = (index: number, field: 'fullStartTime' | 'fullEndTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const toggleGridSlot = (dayIndex: number, time: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex] = {
      ...newSchedule[dayIndex],
      slots: {
        ...newSchedule[dayIndex].slots,
        [time]: !newSchedule[dayIndex].slots[time]
      }
    };
    setSchedule(newSchedule);
  };

  const toggleAllSlotsForDay = (dayIndex: number) => {
    const newSchedule = [...schedule];
    const day = newSchedule[dayIndex];
    if (day.isFullDay) return;

    const allSelected = TIME_SLOTS.every(t => day.slots[t]);
    TIME_SLOTS.forEach(t => {
      day.slots[t] = !allSelected;
    });
    
    setSchedule(newSchedule);
  };

  const toggleAllSlotsForWeek = () => {
    const newSchedule = [...schedule];
    const allSelected = newSchedule.every(day => 
      day.isFullDay || TIME_SLOTS.every(t => day.slots[t])
    );
    
    newSchedule.forEach(day => {
      if (!day.isFullDay) {
        TIME_SLOTS.forEach(t => {
          day.slots[t] = !allSelected;
        });
      }
    });
    
    setSchedule(newSchedule);
  };

  const calculateEndTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0);
    date.setHours(date.getHours() + 1); // +1 hour duration
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dtos: { JourSemaine: string, HeureDebut: string | null, HeureFin: string | null, Disponible: boolean }[] = [];
      
      for (const day of schedule) {
        const dbDay = day.day.substring(0, 3); // "Lundi" -> "Lun"
        if (day.isFullDay) {
          dtos.push({ JourSemaine: dbDay, HeureDebut: '00:00', HeureFin: '23:59', Disponible: true });
        } else {
          for (const time of TIME_SLOTS) {
            if (day.slots[time]) {
              const endT = calculateEndTime(time);
              dtos.push({ JourSemaine: dbDay, HeureDebut: time, HeureFin: endT, Disponible: true });
            }
          }
        }
      }
      
      await updateMyDisponibilitesBatch(dtos);

      toast.success("Vos horaires ont été enregistrés avec succès !");
      await fetchData(); // Refresh IDs
    } catch (error: any) {
       toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto pb-4 relative z-0"
      >
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Clock className="text-[#0059B2]" size={32} />
            Mes Horaires de Travail
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Gérez vos journées complètes ou personnalisez vos créneaux avec précision.
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving || loading}
          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 justify-center disabled:opacity-70 disabled:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          {!saving && !loading && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
            </>
          )}
          <span className="relative flex items-center gap-2 z-10">
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} className="transition-transform group-hover:scale-110 duration-300" />
            )}
            Enregistrer tout
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Configuration Area */}
        <div className="xl:col-span-3 space-y-6">
          
          <div className={`rounded-3xl p-6 sm:p-8 border backdrop-blur-lg transition-all duration-300 will-change-transform ${isDark ? 'bg-[#1A1D24]/40 border-white/10 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:bg-[#1A1D24]/60 hover:-translate-y-2' : 'bg-white/40 border-white shadow-sm hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2'}`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Journées Complètes</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Cochez les jours où vous travaillez en continu. Si vous avez besoin de "trous" ou de pauses, décochez le jour et utilisez la grille en dessous.
            </p>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schedule.map((day, index) => (
                  <div 
                    key={day.day}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                      day.isFullDay 
                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30 shadow-sm' 
                        : 'bg-white/50 dark:bg-[#111318]/50 border-gray-100 dark:border-white/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* iOS Style Toggle */}
                      <button 
                        onClick={() => handleToggleFullDay(index)}
                        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${day.isFullDay ? 'bg-[#0059B2]' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${day.isFullDay ? 'left-7' : 'left-1 shadow-sm'}`} />
                      </button>
                      <span className={`font-semibold w-20 ${day.isFullDay ? 'text-[#0059B2] dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {day.day}
                      </span>
                    </div>

                    {day.isFullDay && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0059B2] bg-blue-100 px-3 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                          Prestations sur plusieurs jours
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-3xl p-6 sm:p-8 border backdrop-blur-lg transition-all duration-300 will-change-transform ${isDark ? 'bg-[#1A1D24]/40 border-white/10 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:bg-[#1A1D24]/60 hover:-translate-y-1' : 'bg-white/40 border-white shadow-sm hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1'}`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <CalendarIcon className="text-[#0059B2]" size={20}/> 2. Grille personnalisée (Pauses & Trous)
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Les jours cochés "Journée complète" en haut sont verrouillés ici. Pour les autres, cliquez sur les heures pour les rendre disponibles.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6 text-xs font-bold justify-between">
              <div className="flex flex-wrap items-center gap-5">
                <span className="flex items-center gap-1.5 text-[#0059B2] dark:text-blue-400"><span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 dark:border-transparent dark:bg-blue-500/30 inline-block"/> Journée Verrouillée</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block"/> Dispo</span>
                <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block"/> Indispo / Pause</span>
              </div>
              <button
                onClick={toggleAllSlotsForWeek}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-emerald-500 rounded-sm"></div>
                  <div className="bg-emerald-500 rounded-sm"></div>
                  <div className="bg-emerald-500 rounded-sm"></div>
                  <div className="bg-emerald-500 rounded-sm"></div>
                </div>
                Tout cocher/décocher
              </button>
            </div>

            <div className="overflow-x-auto -mx-2 pb-4">
              <div className="min-w-[600px] px-2">
                {/* Headers */}
                <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
                  <div/>
                  {schedule.map((d: any, dayIdx: number) => (
                    <button 
                      key={`header-${d.day}`}
                      onClick={() => toggleAllSlotsForDay(dayIdx)}
                      disabled={d.isFullDay}
                      title={`Cocher / Décocher tout pour ${d.day}`}
                      className={`text-center text-[11px] font-extrabold uppercase tracking-wider py-1 rounded transition-colors
                        ${d.isFullDay ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 cursor-pointer'}
                      `}
                    >
                      {d.day.substring(0, 3)}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                {!loading && TIME_SLOTS.map((timeLabel: string) => (
                  <div key={timeLabel} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '50px repeat(7, 1fr)' }}>
                    {/* Time */}
                    <div className="flex items-center justify-end pr-2 border-r border-gray-100 dark:border-white/5">
                      <span className="text-[11px] font-bold text-gray-400">{timeLabel}</span>
                    </div>
                    {/* Cells */}
                    {schedule.map((dayData, dayIdx) => {
                      const isFullMode = dayData.isFullDay;
                      const isSelected = dayData.slots[timeLabel];
                      
                      // Check if timeLabel is within the chosen bounds
                      // For a "Full Day" day, the entire column is controlled and disabled.
                      const isControlledByTop = isFullMode;

                      return (
                        <button
                          key={`${dayData.day}-${timeLabel}`}
                          onClick={() => toggleGridSlot(dayIdx, timeLabel)}
                          disabled={isControlledByTop}
                          className={`
                            relative h-10 rounded-xl text-[11px] font-bold transition-all duration-300 flex items-center justify-center backdrop-blur-md
                            ${isControlledByTop
                              ? (isDark ? 'bg-blue-900/20 text-blue-500/50 border-blue-900/30' : 'bg-blue-50/50 text-blue-400 border-blue-100/50') + ' border cursor-not-allowed opacity-90'
                              : isSelected
                                ? 'bg-emerald-500 text-white border border-transparent shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[1.02] cursor-pointer'
                                : (isDark ? 'bg-black/20 text-gray-400 border-white/5 hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-400' : 'bg-white/50 text-gray-500 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600') + ' border cursor-pointer'
                            }
                          `}
                        >
                          {isControlledByTop ? 'Inclus' : timeLabel}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className={`rounded-3xl p-6 border backdrop-blur-xl transition-colors duration-500 shadow-xl sticky top-28 ${isDark ? 'bg-[#0059B2]/10 border-blue-500/20' : 'bg-blue-50/60 border-blue-200/50'}`}>
            <h3 className="font-bold text-[#0059B2] dark:text-blue-400 flex items-center gap-2 mb-4">
              <Info size={20} />
              Cas d'utilisation
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-white/50 dark:border-white/5">
                <p className="font-bold text-gray-900 dark:text-gray-200 mb-1 flex items-center gap-1.5"><AlertCircle size={14} className="text-amber-500"/> La Pause Déjeuner</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Les pauses est deja inclus dans les creneaux de la journee entre 13:00 et 14:00.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-white/50 dark:border-white/5">
                <p className="font-bold text-gray-900 dark:text-gray-200 mb-1 flex items-center gap-1.5"><CalendarIcon size={14} className="text-emerald-500"/> Réservation au Jour</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Si le client réserve un service "à la journée" (ex: Plombier), il ne verra pas la grille. Le système s'assurera juste que le jour choisi a au moins un créneau actif !
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
      </motion.div>
    </div>
  );
};

export default Disponibilites;
