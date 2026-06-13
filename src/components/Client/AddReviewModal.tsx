import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { createAvis } from '../../services/Client/avisService';
import toast from 'react-hot-toast';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prestataireId: number;
  rendezVousId: number;
  prestataireName: string;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ isOpen, onClose, onSuccess, prestataireId, rendezVousId, prestataireName }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Veuillez écrire un commentaire.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const s = localStorage.getItem('user');
      if (s) {
        const u = JSON.parse(s);
        const clientId = u.idUtilisateur || u.id;
        if (clientId) {
          await createAvis({
            idPrestataire: prestataireId,
            idRendezVous: rendezVousId,
            note: rating,
            commentaire: comment,
          });
          toast.success('Votre avis a été publié avec succès!');
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      toast.error('Erreur lors de la publication de votre avis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-lg p-6 overflow-hidden rounded-3xl shadow-2xl ${
            isDark ? 'bg-[#1a1d27] border border-white/10' : 'bg-white border border-gray-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold font-fraunces ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Laisser un avis
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className={`text-sm mb-3 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Comment s'est passé votre rendez-vous avec <span className="font-bold">{prestataireName}</span> ?
              </p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                          : isDark ? 'text-gray-600 fill-gray-800' : 'text-gray-300 fill-gray-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Votre commentaire
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Racontez votre expérience..."
                className={`w-full rounded-xl p-4 text-sm transition-all min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#1A6FD1] ${
                  isDark
                    ? 'bg-[#0B0F19] border-gray-700 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                } border`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed opacity-70'
                    : 'bg-[#1A6FD1] hover:bg-blue-600 hover:shadow-blue-500/25'
                }`}
              >
                {isSubmitting ? 'Publication...' : 'Publier l\'avis'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddReviewModal;
