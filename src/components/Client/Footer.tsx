import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";

const Footer: React.FC = () => {
  const { theme } = useTheme();

  return (
    <footer className="border-t border-slate-200 dark:border-[#2d3148]/60 bg-white/60 dark:bg-[#0f1117]/80 backdrop-blur relative z-10 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <img
              src={theme === "dark" ? logoDark : logoLight}
              alt="Bookify"
              className="h-12 w-auto object-contain mb-4"
            />
            <p className="text-sm text-slate-600 dark:text-[#8892a4] max-w-sm">
              La marketplace qui connecte clients et professionnels vérifiés. Réservations instantanées, en toute confiance.
            </p>
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-semibold mb-4 text-sm">Produit</p>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-[#8892a4]">
              <li><a href="/Home-Client#stats" className="hover:text-[#1A6FD1] transition-colors cursor-pointer">Résultats</a></li>
              <li><a href="/Home-Client#services" className="hover:text-[#1A6FD1] transition-colors cursor-pointer">Services</a></li>
              <li><a href="/Home-Client#pro" className="hover:text-[#1A6FD1] transition-colors cursor-pointer">Pour les pros</a></li>
              <li><a href="/Home-Client#faq" className="hover:text-[#1A6FD1] transition-colors cursor-pointer">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-semibold mb-4 text-sm">Légal</p>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-[#8892a4]">
              <li><a href="#" className="hover:text-[#1A6FD1] transition-colors">Conditions</a></li>
              <li><a href="#" className="hover:text-[#1A6FD1] transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-[#1A6FD1] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-[#2d3148]/60 flex flex-col md:flex-row justify-between gap-4 text-xs font-medium text-slate-500 dark:text-[#8892a4]">
          <p>© {new Date().getFullYear()} Bookify. Tous droits réservés.</p>
          <p>Fait avec passion à Casablanca.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;