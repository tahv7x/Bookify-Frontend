import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Sparkles, TrendingUp } from "lucide-react";
import logoLight from '../../assets/LogoB.png';
import logoDark from '../../assets/LogoW.png';
import { useTheme } from '../../context/ThemeContext';
import AideModel from '../../components/AideModel';

const Footer: React.FC = () => {
  const { isDark } = useTheme();
  const [modalTopic, setModalTopic] = useState<'guide' | 'astuces' | 'blog' | 'support' | null>(null);

  return (
    <footer className={`mt-20 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t transition-colors duration-500 relative overflow-hidden ${
      isDark ? 'bg-[#0a0c10]/80 border-white/5 text-gray-400' : 'bg-[#F4F7FE]/80 border-[#0f2a5e]/10 text-gray-600'
    }`}>
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                  <img src={isDark ? logoDark : logoLight} alt="Bookify Logo" className="h-10 w-auto" />
              </div>
              <p className={`text-sm mb-6 max-w-sm ${isDark ? 'text-[#8892a4]' : 'text-slate-600'}`}>
                  L'outil tout-en-un pour gérer et développer votre activité de service au Maroc.
              </p>
              <div className="flex gap-4">
                 <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-blue-50 hover:bg-blue-100'} transition-colors cursor-pointer`}><TrendingUp size={18} className={isDark ? "text-blue-400" : "text-[#0059B2]"} /></div>
                 <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-emerald-50 hover:bg-emerald-100'} transition-colors cursor-pointer`}><Sparkles size={18} className={isDark ? "text-emerald-400" : "text-emerald-600"} /></div>
                 <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-purple-50 hover:bg-purple-100'} transition-colors cursor-pointer`}><Shield size={18} className={isDark ? "text-purple-400" : "text-purple-600"} /></div>
              </div>
            </div>

            <div>
              <p className={`font-semibold mb-4 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Mon Espace</p>
              <ul className={`space-y-2.5 text-sm ${isDark ? 'text-[#8892a4]' : 'text-slate-600'}`}>
                  <li><Link to="/Dashboard-Provider" className="hover:text-[#1A6FD1] transition-colors">Dashboard</Link></li>
                  <li><Link to="/Mes-Rendez-Vous-Provider" className="hover:text-[#1A6FD1] transition-colors">Mes Rendez-vous</Link></li>
                  <li><Link to="/Disponibilites-Provider" className="hover:text-[#1A6FD1] transition-colors">Disponibilités</Link></li>
                  <li><Link to="/Profils-Provider" className="hover:text-[#1A6FD1] transition-colors">Services & Profils</Link></li>
              </ul>
            </div>

            <div>
              <p className={`font-semibold mb-4 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Ressources Pro</p>
              <ul className={`space-y-2.5 text-sm flex flex-col items-start ${isDark ? 'text-[#8892a4]' : 'text-slate-600'}`}>
                  <li><button onClick={() => setModalTopic('guide')} className="hover:text-[#1A6FD1] transition-colors text-left">Guide de démarrage</button></li>
                  <li><button onClick={() => setModalTopic('astuces')} className="hover:text-[#1A6FD1] transition-colors text-left">Astuces croissance</button></li>
                  <li><button onClick={() => setModalTopic('blog')} className="hover:text-[#1A6FD1] transition-colors text-left">Blog Prestataires</button></li>
                  <li><button onClick={() => setModalTopic('support')} className="hover:text-[#1A6FD1] transition-colors text-left">Support & Contact</button></li>
              </ul>
            </div>
        </div>

        <div className={`border-t pt-8 text-sm flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? 'border-white/10 text-gray-500' : 'border-[#0f2a5e]/10 text-gray-500'}`}>
            <p>&copy; {new Date().getFullYear()} Bookify Business. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#0059B2] dark:hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-[#0059B2] dark:hover:text-white transition-colors">Confidentialité</a>
            </div>
        </div>
        </div>

        {/* Modal d'Aide */}
        {modalTopic && <AideModel isOpen={true} onClose={() => setModalTopic(null)} topic={modalTopic} />}
    </footer>
  );
};

export default Footer;