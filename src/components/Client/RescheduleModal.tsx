import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rescheduleAppointment } from '../../services/Client/getRdvsClient';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSuccess: (idRdv: number, newDate: string, newTime: string) => void;
}

const DAYS_MAP = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const toLocalISOString = (date: Date) => {
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const toLocalDateString = (date: Date) => {
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function RescheduleModal({ isOpen, onClose, appointment, onSuccess }: RescheduleModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispoData, setDispoData] = useState<any[]>([]);
  const [fetchingDispo, setFetchingDispo] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && appointment) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(toLocalDateString(tomorrow));
      setTime('');
      
      const fetchDispo = async () => {
        setFetchingDispo(true);
        try {
          const providerId = appointment.prestataireId || appointment.idPres;
          const res = await api.get(`/Disponibilites/${providerId}`);
          setDispoData(res.data);
        } catch(e) {
          console.error("Error fetching disponibilites", e);
        } finally {
          setFetchingDispo(false);
        }
      };
      
      fetchDispo();
    }
  }, [isOpen, appointment]);

  // Compute available times based on selected date
  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return DAYS_MAP[d.getDay()];
  };

  const selectedDayStr = getDayOfWeek(date);
  const dayData = dispoData.find(d => d?.day?.toLowerCase() === selectedDayStr.toLowerCase());
  const daySlots = dayData?.slots || [];

  const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const durationMs = appointment.dateFin 
    ? new Date(appointment.dateFin).getTime() - new Date(appointment.rawDate).getTime() 
    : 60 * 60 * 1000;
  const dureeInHours = Math.ceil(durationMs / (60 * 60 * 1000));

  const hasFullDay = daySlots.some((s: any) => s.time === null || s.time === '00:00' || s.time === '');
  const fullDaySlot = daySlots.find((s: any) => s.time === null || s.time === '00:00' || s.time === '');
  const isFullDayAvailable = fullDaySlot ? fullDaySlot.available : true;

  const baseSlotsAvailability = TIME_SLOTS.map(t => {
    if (hasFullDay) {
      return isFullDayAvailable;
    }
    const dbSlot = daySlots.find((s: any) => s.time === t);
    return dbSlot ? dbSlot.available : false;
  });

  const isSlotFullyAvailable = (idx: number) => {
    for (let k = 0; k < dureeInHours; k++) {
      if (idx + k >= TIME_SLOTS.length || !baseSlotsAvailability[idx + k]) {
        return false;
      }
    }
    return true;
  };

  const availableTimes = TIME_SLOTS.filter((t, idx) => isSlotFullyAvailable(idx));

  // Auto-select first available time when date changes
  useEffect(() => {
    if (availableTimes.length > 0 && !availableTimes.includes(time)) {
      setTime(availableTimes[0]);
    } else if (availableTimes.length === 0) {
      setTime('');
    }
  }, [date, dispoData]); // Only re-run when date or dispo changes

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Veuillez sélectionner une date et une heure valides.");
      return;
    }

    try {
      setLoading(true);
      const targetDate = new Date(`${date}T${time}:00`);
      
      if (targetDate < new Date()) {
        toast.error("La date doit être dans le futur.");
        setLoading(false);
        return;
      }

      const durationMs = appointment.dateFin 
        ? new Date(appointment.dateFin).getTime() - new Date(appointment.rawDate).getTime() 
        : 60 * 60 * 1000;
      const endDate = new Date(targetDate.getTime() + durationMs);

      await rescheduleAppointment(
        appointment.id,
        toLocalISOString(targetDate),
        toLocalISOString(endDate)
      );

      const formattedDate = targetDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
      
      toast.success('Rendez-vous reprogrammé avec succès !');
      onSuccess(appointment.id, formattedDate, time);
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la reprogrammation.');
    } finally {
      setLoading(false);
    }
  };

  const minDate = toLocalDateString(new Date());

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-[#1a1d27] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
              <RefreshCw size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-fraunces">Reprogrammer</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pour {appointment.prestataire}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-[#1A6FD1]" /> Nouvelle date
              </label>
              <input
                type="date"
                required
                min={minDate}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-[#1A6FD1]" /> Nouvelle heure
              </label>
              {fetchingDispo ? (
                <div className="w-full bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-400 animate-pulse">
                  Chargement des disponibilités...
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {TIME_SLOTS.map((t: string, idx: number) => {
                    const [hours, minutes] = t.split(':').map(Number);
                    const slotDateTime = new Date(date);
                    slotDateTime.setHours(hours, minutes, 0, 0);
                    const isPast = slotDateTime < new Date();
                    const isDisabled = !isSlotFullyAvailable(idx) || isPast;

                    // Determine if this slot is part of the currently selected start slot range
                    let isHighlighted = false;
                    if (time) {
                      const selectedIdx = TIME_SLOTS.indexOf(time);
                      if (selectedIdx !== -1 && idx >= selectedIdx && idx < selectedIdx + dureeInHours) {
                        isHighlighted = true;
                      }
                    }

                    // Determine if this slot is part of the currently hovered slot range
                    let isHovered = false;
                    if (hoveredIndex !== null && idx >= hoveredIndex && idx < hoveredIndex + dureeInHours) {
                      isHovered = true;
                    }

                    let btnClasses = "py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ";
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
                        key={t}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setTime(t)}
                        onMouseEnter={() => !isDisabled && setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={btnClasses}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={16} /> Aucun créneau disponible ce jour-là.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || availableTimes.length === 0 || !time}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              {loading ? 'Enregistrement...' : 'Confirmer la modification'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
