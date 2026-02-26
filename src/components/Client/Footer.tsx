import React from "react";
import { Calendar } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 gradient-animate rounded-xl flex items-center justify-center">
                <Calendar className="text-white" size={22} />
                </div>
                <span className="text-2xl font-bold heading-font">Bookify</span>
            </div>
            <p className="text-gray-400 text-sm">
                La plateforme #1 de réservation de services au Maroc
            </p>
            </div>

            <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Santé</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Beauté</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Artisanat</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nettoyage</a></li>
            </ul>
            </div>

            <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
            </div>

            <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
            </div>
        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Bookify. Tous droits réservés.</p>
        </div>
        </div>
    </footer>
  );
};

export default Footer;