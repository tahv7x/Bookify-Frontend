import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Mail, MessageSquare, ChevronDown, Send, CheckCircle2 } from 'lucide-react';

import { faqService } from '../../services/faqService';
import type { FaqItem } from '../../services/faqService';
import { supportService } from '../../services/supportService';

const SupportP: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await faqService.getFaqs();
        setFaqs(data);
      } catch (error) {
        console.error("Erreur chargement FAQs", error);
      }
    };
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    
    setIsSubmitting(true);
    try {
      await supportService.createTicket(subject, message);
      setIsSent(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setIsSent(false), 5000);
    } catch (error) {
      console.error("Erreur envoi ticket", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A6FD1] to-[#0c5a7c] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold font-fraunces text-gray-900 dark:text-white mb-2">Centre d'Aide & Support</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Retrouvez les réponses à vos questions ou contactez l'administrateur pour toute assistance concernant votre compte prestataire.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FAQ SECTION */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageSquare className="text-[#1A6FD1]" size={20} /> Questions Fréquentes
          </h2>
          
          {faqs.map((faq, idx) => (
            <div key={faq.idFaq} className="glass-card rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full text-left px-6 py-5 flex items-center justify-between"
              >
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm pr-4">{faq.question}</span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 shrink-0 ${openFaqIndex === idx ? 'rotate-180 text-[#1A6FD1]' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaqIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 mt-2 pt-4">
                      {faq.reponse}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* CONTACT FORM */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Mail className="text-[#1A6FD1]" size={20} /> Contactez l'Administrateur
          </h2>
          
          <div className="glass-card rounded-3xl p-6 md:p-8">
            {isSent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-10"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Envoyé !</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">L'administrateur vous répondra dans les plus brefs délais.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Sujet</label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Ex: Problème technique, Assistance compte..."
                    className="w-full bg-white/50 dark:bg-[#1a1d27]/60 border border-gray-200 dark:border-[#2d3148] text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-[#1A6FD1] focus:ring-2 focus:ring-[#1A6FD1]/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Votre Message</label>
                  <textarea 
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Décrivez votre problème en détail..."
                    className="w-full bg-white/50 dark:bg-[#1a1d27]/60 border border-gray-200 dark:border-[#2d3148] text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-[#1A6FD1] focus:ring-2 focus:ring-[#1A6FD1]/20 transition-all text-sm resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting || !subject || !message}
                  className="w-full bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={18} /> Envoyer au support</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportP;
