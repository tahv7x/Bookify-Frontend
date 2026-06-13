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

export default function RescheduleModal({ isOpen, onClose, appointment, onSuccess }: RescheduleModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispoData, setDispoData] = useState<any[]>([]);
  const [fetchingDispo, setFetchingDispo] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
      setTime('');
      
      const fetchDispo = async () => {
        setFetchingDispo(true);
        try {
          const res = await api.get(`/Disponibilites/${appointment.idPres}`);
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
  const selectedDayStr = date ? DAYS_MAP[new Date(date).getDay()] : '';
  const daySlots = dispoData.find(d => d.day === selectedDayStr)?.slots || [];
  const availableTimes = daySlots.filter((s:any) => s.available).map((s:any) => s.time);

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

      const endDate = new Date(targetDate);
      endDate.setHours(targetDate.getHours() + 1);

      await rescheduleAppointment(
        appointment.id,
        targetDate.toISOString(),
        endDate.toISOString()
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

  const minDate = new Date().toISOString().split('T')[0];

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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-[#1A6FD1]" /> Nouvelle heure
              </label>
              {fetchingDispo ? (
                <div className="w-full bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-400 animate-pulse">
                  Chargement des disponibilités...
                </div>
              ) : availableTimes.length > 0 ? (
                <select
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1] outline-none transition-all"
                >
                  {availableTimes.map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
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
