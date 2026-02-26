import React, { useState } from 'react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';

import Footer from '../../components/Client/Footer';
import {
  User, Settings, Star, Calendar, ChevronRight,
  Camera, Edit3, Mail, Phone, MapPin, Lock,
  Bell, Shield, LogOut, Check, X, Eye, EyeOff, HelpCircle
} from 'lucide-react';

type ProfilePage = 'profile' | 'settings';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
}

const Profils: React.FC = () => {
  // ── Dashboard layout state ──
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profils');

  // ── Profile/Settings state ──
  const [currentPage, setCurrentPage]           = useState<ProfilePage>('profile');
  const [isEditing, setIsEditing]               = useState(false);
  const [showPassword, setShowPassword]         = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('info');
  const [saved, setSaved]                       = useState(false);

  const [notifState, setNotifState] = useState([true, true, false, true, false]);
  const [privacyState, setPrivacyState] = useState([true, true, false]);

  const [userData, setUserData] = useState<UserData>({
    firstName: 'Aya',
    lastName:  'Eddahmani',
    email:     'aya.eddahmani@gmail.com',
    phone:     '+212 6 12 34 56 78',
    city:      'Casablanca, Maroc',
    bio:       'Cliente fidèle de Bookify depuis 2023. J\'apprécie la facilité de réservation.',
  });
  const [formData, setFormData] = useState<UserData>({ ...userData });

  const handleSave = () => {
    setUserData({ ...formData });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
  };

  const recentAppointments = [
    { doctor: 'Dr. Youssef Alami', specialty: 'Dentiste',     date: '15 Jan 2025', status: 'Terminé',  rating: 5 },
    { doctor: 'Dr. Sara Bennis',   specialty: 'Cardiologue',   date: '3 Fév 2025',  status: 'Confirmé', rating: null },
    { doctor: 'Dr. Ahmed Tazi',    specialty: 'Psychologue',   date: '28 Déc 2024', status: 'Terminé',  rating: 4 },
  ];

  const settingsTabs = [
    { id: 'info',          label: 'Informations',    icon: User     },
    { id: 'password',      label: 'Mot de passe',    icon: Lock     },
    { id: 'notifications', label: 'Notifications',   icon: Bell     },
    { id: 'privacy',       label: 'Confidentialité', icon: Shield   },
  ];

  const profileSidebarLinks = [
    { id: 'profile'  as ProfilePage, label: 'Mon Profil',            icon: User     },
    { id: 'settings' as ProfilePage, label: 'Paramètres du compte',  icon: Settings },
  ];

  const notifItems = [
    { label: 'Rappels de rendez-vous', desc: 'Rappels 24h avant votre rendez-vous'  },
    { label: 'Confirmations',          desc: 'Confirmer ou refuser les demandes'     },
    { label: 'Offres et promotions',   desc: 'Recevez les meilleures offres'         },
    { label: 'Nouveaux spécialistes',  desc: 'Dans votre secteur d\'activité'        },
    { label: 'Résumé hebdomadaire',    desc: 'Un récapitulatif de vos activités'     },
  ];

  const privacyItems = [
    { label: 'Profil public',         desc: 'Permettre aux autres de voir votre profil' },
    { label: 'Afficher l\'historique', desc: 'Montrer vos rendez-vous précédents'        },
    { label: 'Partage de données',    desc: 'Améliorer l\'expérience Bookify'            },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0%  { transform: scale(0.92); opacity: 0; }
          60% { transform: scale(1.04); }
          100%{ transform: scale(1);    opacity: 1; }
        }

        .sidebar-overlay { animation: fadeIn 0.3s ease-out forwards; }
        .anim-fade-up    { animation: fadeUp 0.5s cubic-bezier(.16,1,.3,1) both; }
        .anim-fade-in    { animation: fadeIn 0.4s ease both; }
        .anim-slide-in   { animation: slideInRight 0.4s cubic-bezier(.16,1,.3,1) both; }
        .anim-pop        { animation: pop 0.4s cubic-bezier(.16,1,.3,1) both; }

        .card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
        }

        .input-field {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 14px; outline: none; background: #fafafa;
          transition: border-color .2s, box-shadow .2s;
        }
        .input-field:focus  { border-color: #0059B2; box-shadow: 0 0 0 3px rgba(37,99,235,.12); background: #fff; }
        .input-field:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }

        .btn-primary {
          padding: 9px 20px; background: #0059B2; color: #fff;
          border-radius: 10px; font-weight: 600; font-size: 14px;
          border: none; cursor: pointer; transition: all .2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-primary:hover { background: #0059B2; box-shadow: 0 4px 12px rgba(37,99,235,.3); }

        .btn-ghost {
          padding: 9px 20px; background: transparent; color: #6b7280;
          border-radius: 10px; font-weight: 600; font-size: 14px;
          border: 1.5px solid #e5e7eb; cursor: pointer; transition: all .2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-ghost:hover { background: #f3f4f6; color: #374151; }

        .prof-nav {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all .2s; color: #6b7280; border: none; background: none;
          width: 100%; text-align: left;
        }
        .prof-nav:hover          { background: #f3f4f6; color: #111827; }
        .prof-nav.active         { background: #eff6ff; color: #0059B2; font-weight: 600; }

        .settings-tab {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer;
          transition: all .2s; color: #6b7280; border: none; background: none;
          width: 100%; text-align: left;
        }
        .settings-tab:hover  { background: #f3f4f6; color: #111827; }
        .settings-tab.active { background: #eff6ff; color: #0059B2; font-weight: 600; }

        .toggle-track {
          width: 44px; height: 24px; border-radius: 12px; position: relative;
          cursor: pointer; border: none; transition: background .2s; flex-shrink: 0;
        }
        .toggle-thumb {
          position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
          background: #fff; border-radius: 50%; transition: transform .2s;
          box-shadow: 0 1px 4px rgba(0,0,0,.2);
        }
        .toggle-on  { background: #0059B2; }
        .toggle-off { background: #d1d5db; }
        .toggle-on  .toggle-thumb { transform: translateX(20px); }

        .avatar-ring {
          width: 88px; height: 88px; border-radius: 50%;
          background: linear-gradient(135deg, #0059B2, #1A6FD1);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; font-weight: 700; color: #fff;
          box-shadow: 0 0 0 4px #fff, 0 0 0 6px #e5e7eb;
        }

        .status-done    { background: #d1fae5; color: #065f46; }
        .status-confirm { background: #dbeafe; color: #0059B2; }
        .status-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
        }

        .star-filled { color: #f59e0b; fill: #f59e0b; }
        .star-empty  { color: #d1d5db; }
      `}</style>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40 "
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white transform transition-transform duration-300 z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        <Navbar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setIsSidebarOpen(false);
          }}
        />
      </div>

       {/* Main Content */}
      <main
          className={`
            min-h-screen transition-all duration-300
            lg:${isSidebarOpen ? 'ml-64' : 'ml-0'}
          `}
        >

        {/* Top Bar */}
        <TopBar 
          userName="Aya"
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />

        {/* ── Page Content ── */}
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

          {/* ════ INNER LEFT SIDEBAR (profile nav) ════ */}
          <aside className="w-full lg:w-60 shrink-0 anim-slide-in">
            {/* Avatar */}
            <div className="card p-5 mb-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="avatar-ring">{userData.firstName.charAt(0)}</div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                    <Camera size={12} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <p className="font-bold text-gray-900 text-sm">{userData.firstName} {userData.lastName}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{userData.email}</p>
            </div>

            {/* Nav links */}
            <div className="card p-3 mb-4">
              {profileSidebarLinks.map(link => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentPage(link.id)}
                    className={`prof-nav ${currentPage === link.id ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span className="flex-1 text-left">{link.label}</span>
                    {currentPage === link.id && <ChevronRight size={14} />}
                  </button>
                );
              })}
              <div className="my-1.5 border-t border-gray-100" />
              <button className="prof-nav">
                <HelpCircle size={16} /> Aide
              </button>
              <button className="prof-nav" style={{ color: '#ef4444' }}>
                <LogOut size={16} style={{ color: '#ef4444' }} /> Déconnexion
              </button>
            </div>

            {/* Stats */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activité</p>
              {[
                { label: 'Rendez-vous', value: '12' },
                { label: 'Avis laissés',  value: '7'  },
                { label: 'Favoris',       value: '4'  },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{s.label}</span>
                  <span className="text-sm font-bold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* ════ MAIN CONTENT AREA ════ */}
          <section className="flex-1 min-w-0">

            {/* ─────────── PROFILE PAGE ─────────── */}
            {currentPage === 'profile' && (
              <div className="anim-fade-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Mon Profil</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gérez vos informations personnelles</p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => { setCurrentPage('settings'); setActiveSettingsTab('info'); }}
                  >
                    <Edit3 size={14} /> Modifier
                  </button>
                </div>

                {/* Personal info card */}
                <div className="card p-6 mb-5">
                  <h2 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <User size={16} className="text-[#0059B2]" /> Informations personnelles
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[
                      { icon: User,   label: 'Nom complet', value: `${userData.firstName} ${userData.lastName}` },
                      { icon: Mail,   label: 'Email',        value: userData.email },
                      { icon: Phone,  label: 'Téléphone',    value: userData.phone },
                      { icon: MapPin, label: 'Ville',         value: userData.city  },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon size={15} className="text-[#0059B2]" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</p>
                            <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {userData.bio && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-medium mb-1">Bio</p>
                      <p className="text-sm text-gray-700">{userData.bio}</p>
                    </div>
                  )}
                </div>

                {/* Recent appointments */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Calendar size={16} className="text-[#0059B2]" /> Rendez-vous récents
                    </h2>
                    <button className="text-xs text-[#0059B2] font-semibold hover:underline">Voir tout</button>
                  </div>
                  <div className="space-y-2">
                    {recentAppointments.map((appt, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0059B2] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {appt.doctor.charAt(4)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{appt.doctor}</p>
                          <p className="text-xs text-gray-500">{appt.specialty} · {appt.date}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`status-badge ${appt.status === 'Terminé' ? 'status-done' : 'status-confirm'}`}>
                            {appt.status}
                          </span>
                          {appt.rating && (
                            <div className="flex gap-0.5 justify-end mt-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={10} className={s <= appt.rating! ? 'star-filled' : 'star-empty'} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────── SETTINGS PAGE ─────────── */}
            {currentPage === 'settings' && (
              <div className="anim-fade-up">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900">Paramètres du compte</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Gérez vos préférences et sécurité</p>
                </div>

                {/* Toast success */}
                {saved && (
                  <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl anim-pop">
                    <Check size={15} /> Modifications enregistrées avec succès !
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Settings tabs */}
                  <div className="card p-3 sm:w-48 shrink-0 h-fit">
                    {settingsTabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSettingsTab(tab.id)}
                          className={`settings-tab ${activeSettingsTab === tab.id ? 'active' : ''}`}
                        >
                          <Icon size={15} /> {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 min-w-0">

                    {/* Info tab */}
                    {activeSettingsTab === 'info' && (
                      <div className="card p-6 anim-fade-in">
                        <div className="flex items-center justify-between mb-5">
                          <h2 className="text-sm font-bold text-gray-900">Informations personnelles</h2>
                          {!isEditing ? (
                            <button className="btn-primary" onClick={() => setIsEditing(true)}>
                              <Edit3 size={13} /> Modifier
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button className="btn-ghost" onClick={handleCancel}>
                                <X size={13} /> Annuler
                              </button>
                              <button className="btn-primary" onClick={handleSave}>
                                <Check size={13} /> Enregistrer
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Avatar row */}
                        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                          <div className="avatar-ring" style={{ width: 72, height: 72, fontSize: 26 }}>
                            {userData.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{userData.firstName} {userData.lastName}</p>
                            <button className="text-xs text-[#0059B2] font-semibold mt-1 flex items-center gap-1 hover:underline">
                              <Camera size={11} /> Changer la photo
                            </button>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prénom</label>
                            <input className="input-field" value={formData.firstName} disabled={!isEditing}
                              onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom</label>
                            <input className="input-field" value={formData.lastName} disabled={!isEditing}
                              onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                            <input className="input-field" type="email" value={formData.email} disabled={!isEditing}
                              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label>
                            <input className="input-field" value={formData.phone} disabled={!isEditing}
                              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ville</label>
                            <input className="input-field" value={formData.city} disabled={!isEditing}
                              onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bio</label>
                            <textarea className="input-field resize-none" rows={3} value={formData.bio} disabled={!isEditing}
                              onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Password tab */}
                    {activeSettingsTab === 'password' && (
                      <div className="card p-6 anim-fade-in">
                        <h2 className="text-sm font-bold text-gray-900 mb-5">Changer le mot de passe</h2>
                        <div className="space-y-4 max-w-sm">
                          {['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer mot de passe'].map((label, i) => (
                            <div key={i}>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                              <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-10" />
                                <button type="button" onClick={() => setShowPassword(p => !p)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              </div>
                            </div>
                          ))}
                          <button className="btn-primary w-full justify-center mt-1">
                            Mettre à jour le mot de passe
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notifications tab */}
                    {activeSettingsTab === 'notifications' && (
                      <div className="card p-6 anim-fade-in">
                        <h2 className="text-sm font-bold text-gray-900 mb-5">Préférences de notifications</h2>
                        <div className="space-y-1">
                          {notifItems.map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                              </div>
                              <button
                                onClick={() => setNotifState(prev => prev.map((v, j) => j === i ? !v : v))}
                                className={`toggle-track ${notifState[i] ? 'toggle-on' : 'toggle-off'}`}
                              >
                                <div className="toggle-thumb" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Privacy tab */}
                    {activeSettingsTab === 'privacy' && (
                      <div className="card p-6 anim-fade-in">
                        <h2 className="text-sm font-bold text-gray-900 mb-5">Confidentialité & Sécurité</h2>
                        <div className="space-y-1">
                          {privacyItems.map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                              </div>
                              <button
                                onClick={() => setPrivacyState(prev => prev.map((v, j) => j === i ? !v : v))}
                                className={`toggle-track ${privacyState[i] ? 'toggle-on' : 'toggle-off'}`}
                              >
                                <div className="toggle-thumb" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="pt-5 mt-2 border-t border-gray-100">
                          <p className="text-sm font-bold text-gray-900 mb-3">Zone de danger</p>
                          <button className="btn-ghost" style={{ color: '#ef4444', borderColor: '#fecaca' }}>
                            <LogOut size={14} style={{ color: '#ef4444' }} /> Supprimer mon compte
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
        <Footer/>
      </main>
    </div>
  );
};

export default Profils;