import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { getMyProviderProfile, updateMyProviderProfile } from '../../services/provider/providerService';
import {
  User, Settings, Lock, Bell, Shield, LogOut, Check, X, Eye, EyeOff, HelpCircle, Loader2, AlertCircle, Camera, Edit3, Mail, Phone, MapPin, Save
} from 'lucide-react';
import AideModel from '../../components/AideModel';
import { uploadAvatar, deleteAvatar } from '../../services/provider/avatarService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import LocationPicker from '../../components/Provider/LocationPicker';

type ProfilePage = 'profile' | 'settings';
interface UserData { 
  firstName: string; 
  lastName: string; 
  email: string; 
  phone: string; 
  city: string; 
  bio: string; 
  specialite: string; 
  categorie: string; 
  lat: number | null;
  lng: number | null;
  enLocal: boolean;
  aDomicile: boolean;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MB = 5;

const Avatar: React.FC<{ src: string | null; initials: string; size?: number; fontSize?: number; onClick?: () => void; showEditBadge?: boolean; loading?: boolean; }> =
  ({ src, initials, size = 88, fontSize = 32, onClick, showEditBadge = false, loading = false }) => (
  <div className="relative inline-block" onClick={onClick}>
      <div
        className="ring-4 ring-white dark:ring-[#0a0c10] ring-offset-2 ring-offset-gray-50 dark:ring-offset-[#111318] flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, cursor: onClick ? 'pointer' : 'default' }}
      >      
      {loading ? <Loader2 size={size * 0.28} className="animate-spin text-[#0059B2]" />
        : src ? <img src={src} alt="avatar" className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-gradient-to-br from-[#0059B2] to-blue-400 flex items-center justify-center text-white font-bold" style={{ fontSize }}>{initials}</div>
      }
      {onClick && !loading && <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera size={size * 0.2} color="#fff" /></div>}
    </div>
    {showEditBadge && !loading && (
      <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-[#1A1D24] border-2 border-gray-100 dark:border-white/10 flex items-center justify-center cursor-pointer shadow-sm text-gray-500 hover:text-[#0059B2] dark:text-gray-400 transition-colors">
        <Camera size={14} />
      </div>
    )}
  </div>
);

const Profils: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<ProfilePage>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('info');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showAide, setShowAide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [showPwFields, setShowPwFields] = useState({ current: false, next: false, confirm: false });
  
  const [notifState, setNotifState] = useState<boolean[]>(() => { const s = localStorage.getItem('notifState'); return s ? JSON.parse(s) : [true,true,false,true,false]; });
  const [privacyState, setPrivacyState] = useState<boolean[]>(() => { const s = localStorage.getItem('privacyState'); return s ? JSON.parse(s) : [true,true,false]; });
  
  const [userData, setUserData] = useState<UserData>({ firstName:'', lastName:'', email:'', phone:'', city:'', bio:'', specialite:'', categorie:'', lat: null, lng: null, enLocal: true, aDomicile: false });
  const [formData, setFormData] = useState<UserData>({ ...userData });
  const [statsSummary, setStatsSummary] = useState({ totalRdv: 0, myClients: 0, rating: 5.0 });

  const loadProfile = async () => {
    try {
      const u = await getMyProviderProfile();
      if(u.avatar) setAvatarSrc(u.avatar);
      const names = (u.nom || '').split(' ');
      const data: UserData = { 
        firstName: names[0] || '', 
        lastName: names.slice(1).join(' ') || '', 
        email: u.email || '', 
        phone: u.telephone || '', 
        city: u.adresse || '', 
        bio: u.bio || '',
        specialite: u.specialite || '',
        categorie: u.categorie || '',
        lat: u.latitude || null,
        lng: u.longitude || null,
        enLocal: u.enLocal ?? true,
        aDomicile: u.aDomicile ?? false
      };
      setUserId(u.idUtilisateur ?? u.id ?? null); 
      setUserName(u.nom || ''); 
      setUserData(data); 
      setFormData(data);

      const res = await api.get(`/RendezVous/prestataire/${u.id}`);
      const appts = res.data;
      setStatsSummary({
        totalRdv: appts.length,
        myClients: new Set(appts.map((a: any) => a.client?.idUtilisateur)).size,
        rating: u.note || 5.0
      });
    } catch (err) {
      console.error("Error loading provider profile:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const initials = userData.firstName.charAt(0).toUpperCase() + (userData.lastName.charAt(0) || '').toUpperCase();

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    e.target.value = '';
    if(!file || userId === null) return;
    setAvatarError(null);

    if(!ACCEPTED.includes(file.type)){
      setAvatarError('Format non supporté.');
      return;
    }
    if(file.size > MAX_MB * 1024 * 1024){
      setAvatarError(`Max ${MAX_MB} MB.`);
      return;
    }

    setAvatarLoading(true);

    try { 
      const url = await uploadAvatar(userId, file);
      setAvatarSrc(url);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.avatar = url;
      localStorage.setItem('user', JSON.stringify(user));
      toast.success("Photo de profil mise à jour !");
    }
    catch(err: any) { setAvatarError("Erreur lors du chargement."); } 
    finally { setAvatarLoading(false); }
  };

  const handleAvatarRemove = async () => {
    if(userId === null) return;
    setAvatarLoading(true);
    try{
      await deleteAvatar(userId);
      setAvatarSrc(null);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.avatar = null;
      localStorage.setItem('user', JSON.stringify(user));
      toast.success("Photo de profil supprimée.");
    } catch {
      setAvatarError("Erreur de suppression");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (userId === null) { setSaveError("Impossible d'identifier l'utilisateur."); return; }
    setIsSaving(true); setSaveError(null);
    try {
      const payload = { 
        nomComplet: `${formData.firstName} ${formData.lastName}`.trim(), 
        telephone: formData.phone, 
        adresse: formData.city,
        specialite: formData.specialite,
        bio: formData.bio,
        categorie: formData.categorie,
        latitude: formData.lat,
        longitude: formData.lng,
        enLocal: formData.enLocal,
        aDomicile: formData.aDomicile
      };
      const res = await updateMyProviderProfile(payload);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUserName(res.user.nomComplet || `${formData.firstName} ${formData.lastName}`);
      setUserData({ ...formData });
      setIsEditing(false); 
      setSaved(true); 
      setTimeout(() => setSaved(false), 3000);
      toast.success("Profil mis à jour avec succès !");
    } catch(err: any) { 
      setSaveError(err?.response?.data?.message || 'Une erreur est survenue.'); 
      setIsSaving(false); 
    }
  };

  const handleCancel = () => { setFormData({ ...userData }); setIsEditing(false); setSaveError(null); };

  const handleChangePassword = async () => {
    setPwError(null);
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwError('Veuillez remplir tous les champs.'); return; }
    if (pwForm.next.length < 8) { setPwError('Minimum 8 caractères.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    setIsSavingPw(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.put(`/auth/change-password/${user.idUtilisateur || user.id}`, { AncienMotDePasse: pwForm.current, NouveauMotDePasse: pwForm.next });
      setPwSuccess(true); 
      setPwForm({ current: '', next: '', confirm: '' }); 
      setTimeout(() => setPwSuccess(false), 3000);
      toast.success("Mot de passe mis à jour !");
    } catch(err: any) { 
      setPwError(err?.response?.data?.message || 'Mot de passe actuel incorrect.'); 
    } finally { 
      setIsSavingPw(false); 
    }
  };

  const handleNotifToggle = (i: number) => setNotifState(p => { const n = p.map((v, j) => j === i ? !v : v); localStorage.setItem('notifState', JSON.stringify(n)); return n; });
  const handlePrivacyToggle = (i: number) => setPrivacyState(p => { const n = p.map((v, j) => j === i ? !v : v); localStorage.setItem('privacyState', JSON.stringify(n)); return n; });

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous SÛR de vouloir supprimer définitivement votre compte ? Toutes vos données seront perdues à jamais (Rendez-vous, Messages, Services).")) {
      try {
        await api.delete('/auth/delete-account');
        localStorage.clear();
        window.location.href = '/login';
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Une erreur s'est produite lors de la suppression.");
      }
    }
  };

  const settingsTabs = [
    { id: 'info', label: 'Informations', icon: User }, 
    { id: 'password', label: 'Mot de passe', icon: Lock }, 
    { id: 'privacy', label: 'Confidentialité', icon: Shield }
  ];
  
  const notifItems = [{ label: 'Rappels de rendez-vous', desc: 'Rappels 24h avant' }, { label: 'Confirmations', desc: 'Confirmer ou refuser' }, { label: 'Offres et promotions', desc: 'Recevez les meilleures offres' }, { label: 'Nouveaux spécialistes', desc: "Dans votre secteur" }, { label: 'Résumé hebdomadaire', desc: 'Un récapitulatif' }];
  const privacyItems = [{ label: 'Profil public', desc: 'Permettre aux autres de voir votre profil' }, { label: "Afficher l'historique", desc: 'Montrer vos rendez-vous précédents' }, { label: 'Partage de données', desc: "Améliorer l'expérience Bookify" }];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto pb-8"
    >
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarFile} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="glass-card rounded-3xl p-6 mb-6 text-center">
            <div className="flex justify-center mb-4">
              <Avatar src={avatarSrc} initials={initials} size={96} fontSize={32} onClick={()=>fileInputRef.current?.click()} showEditBadge loading={avatarLoading} />
            </div>
            <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{userData.firstName} {userData.lastName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{userData.email}</p>
            {userData.categorie && (
              <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#0059B2] dark:text-blue-400 text-xs font-bold rounded-full mb-2">
                {userData.categorie}
              </span>
            )}
            {avatarError && <p className="mt-2 text-xs text-red-500 flex items-center justify-center gap-1"><AlertCircle size={12}/>{avatarError}</p>}
          </div>

          <div className="glass-card rounded-3xl p-4 mb-6 space-y-1">
            <button 
              onClick={() => setCurrentPage('profile')} 
              className={`group relative overflow-hidden w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${
                currentPage === 'profile' 
                  ? 'text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white hover:translate-x-1'
              }`}
            >
              {currentPage === 'profile' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </>
              )}
              <span className="relative flex items-center gap-3 z-10">
                <User size={20} className={currentPage === 'profile' ? "text-white" : ""} /> Mon Profil public
              </span>
            </button>
            <button 
              onClick={() => setCurrentPage('settings')} 
              className={`group relative overflow-hidden w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${
                currentPage === 'settings' 
                  ? 'text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white hover:translate-x-1'
              }`}
            >
              {currentPage === 'settings' && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </>
              )}
              <span className="relative flex items-center gap-3 z-10">
                <Settings size={20} className={currentPage === 'settings' ? "text-white" : ""} /> Paramètres du compte
              </span>
            </button>
            
            <div className="h-px bg-gray-100 dark:bg-white/5 my-3" />
            
            <button className="group w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:translate-x-1" onClick={() => setShowAide(true)}>
              <HelpCircle size={20} /> Aide
            </button>
            <button className="group w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 hover:translate-x-1" onClick={()=>{localStorage.clear();window.location.href='/login';}}>
              <LogOut size={20} /> Déconnexion
            </button>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Activité Récente</p>
            <div className="space-y-4">
              {[
                {label:'Rendez-vous',value:statsSummary.totalRdv.toString()},
                {label:'Total Clients',value:statsSummary.myClients.toString()},
                {label:'Note Globale',value:`${statsSummary.rating.toFixed(1)} ⭐`}
              ].map(s=>(
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 min-w-0">
          {currentPage === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Fraunces', serif" }}>Aperçu du Profil</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Voici comment les clients voient votre profil sur Bookify.</p>
                </div>
                <button 
                  className="group relative overflow-hidden font-semibold py-2.5 px-6 rounded-xl text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  onClick={()=>{setCurrentPage('settings');setActiveSettingsTab('info');}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                  <span className="relative flex items-center gap-2 justify-center z-10">
                    <Edit3 size={16}/> Modifier
                  </span>
                </button>
              </div>

              <div className="glass-card rounded-3xl p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <User className="text-[#0059B2]" size={20}/> Informations Générales
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    {icon:User,label:'Nom complet',value:`${userData.firstName} ${userData.lastName}`},
                    {icon:Mail,label:'Email professionnel',value:userData.email},
                    {icon:Phone,label:'Téléphone de contact',value:userData.phone},
                    {icon:MapPin,label:'Ville d\'intervention',value:userData.city},
                    {icon:Edit3,label:'Spécialité principale',value:userData.specialite},
                    {icon:Shield,label:'Catégorie',value:userData.categorie}
                  ].map(item=>{
                    const Icon=item.icon; return(
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30">
                        <Icon size={18} className="text-[#0059B2] dark:text-blue-400"/>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value||'—'}</p>
                      </div>
                    </div>);
                  })}
                </div>

                {userData.bio && (
                  <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider">Bio / Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5">
                      {userData.bio}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentPage === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Fraunces', serif" }}>Paramètres</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez vos informations privées et la sécurité de votre compte.</p>
              </div>

              {saved&&<div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold px-5 py-4 rounded-2xl"><Check size={18}/> Modifications enregistrées avec succès !</div>}
              {saveError&&<div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 font-semibold px-5 py-4 rounded-2xl"><AlertCircle size={18}/> {saveError}</div>}

              <div className="flex flex-col md:flex-row gap-6">
                {/* SETTINGS TABS */}
                <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  {settingsTabs.map(tab=>{const Icon=tab.icon;return(
                    <button 
                      key={tab.id} 
                      onClick={()=>setActiveSettingsTab(tab.id)} 
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${activeSettingsTab===tab.id ? 'bg-white dark:bg-[#1A1D24] text-[#0059B2] dark:text-blue-400 shadow-sm border border-gray-200 dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      <Icon size={16}/>{tab.label}
                    </button>
                  );})}
                </div>

                {/* SETTINGS CONTENT */}
                <div className="flex-1 min-w-0">
                  {activeSettingsTab === 'info' && (
                    <div className="glass-card rounded-3xl p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mise à jour des infos</h2>
                        {!isEditing ? (
                          <button className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-xl transition-all text-sm flex items-center gap-2" onClick={()=>setIsEditing(true)}><Edit3 size={14}/> Modifier</button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white font-semibold py-2 px-4 rounded-xl transition-all text-sm" onClick={handleCancel} disabled={isSaving}>Annuler</button>
                            <button className="group relative overflow-hidden font-semibold py-2 px-5 rounded-xl text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 text-sm" onClick={handleSave} disabled={isSaving}>
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                              <span className="relative flex items-center justify-center gap-2 z-10">
                                {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} {isSaving ? 'Attente...' : 'Sauvegarder'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Prénom</label>
                          <input className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${isEditing ? 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-[#0059B2] focus:ring-2 focus:ring-blue-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 cursor-not-allowed'}`} value={formData.firstName} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,firstName:e.target.value}))}/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Nom</label>
                          <input className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${isEditing ? 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-[#0059B2] focus:ring-2 focus:ring-blue-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 cursor-not-allowed'}`} value={formData.lastName} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,lastName:e.target.value}))}/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">Email <Lock size={12}/></label>
                          <input className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent text-gray-400 dark:text-gray-600 text-sm font-medium cursor-not-allowed outline-none" type="email" value={formData.email} disabled title="L'email ne peut pas être modifié"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Téléphone</label>
                          <input className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${isEditing ? 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-[#0059B2] focus:ring-2 focus:ring-blue-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 cursor-not-allowed'}`} value={formData.phone} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,phone:e.target.value}))}/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Spécialité</label>
                          <input className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${isEditing ? 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-[#0059B2] focus:ring-2 focus:ring-blue-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 cursor-not-allowed'}`} value={formData.specialite} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,specialite:e.target.value}))} placeholder="Ex: Plomberie générale"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Catégorie</label>
                          <select className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${isEditing ? 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-[#0059B2] focus:ring-2 focus:ring-blue-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 cursor-not-allowed appearance-none'}`} value={formData.categorie} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,categorie:e.target.value}))}>
                            <option value="">Sélectionner...</option>
                            <option value="Plombier">Plombier</option>
                            <option value="Électricien">Électricien</option>
                            <option value="Menuisier">Menuisier</option>
                            <option value="Mécanicien">Mécanicien</option>
                            <option value="Peintre">Peintre</option>
                            <option value="Jardinier">Jardinier</option>
                            <option value="Nettoyage">Nettoyage</option>
                            <option value="Informatique">Informatique</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Ville / Adresse</label>
                          <input className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${isEditing ? 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-[#0059B2] focus:ring-2 focus:ring-blue-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 cursor-not-allowed'}`} value={formData.city} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,city:e.target.value}))}/>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Bio / Description</label>
                          <textarea className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none resize-none ${isEditing ? 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-[#0059B2] focus:ring-2 focus:ring-blue-500/20' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 cursor-not-allowed'}`} rows={4} value={formData.bio} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,bio:e.target.value}))} placeholder="Décrivez votre expertise en quelques phrases..."/>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Où proposez-vous vos services ?</label>
                          <div className="flex items-center gap-6">
                            <label className={`flex items-center gap-2 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'} group`}>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.enLocal ? 'bg-[#1A6FD1] border-[#1A6FD1]' : 'border-gray-300 dark:border-white/20 group-hover:border-[#1A6FD1]'}`}>
                                {formData.enLocal && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">En Local</span>
                              <input type="checkbox" className="hidden" disabled={!isEditing} checked={formData.enLocal} onChange={(e) => setFormData(p => ({...p, enLocal: e.target.checked}))} />
                            </label>
                            <label className={`flex items-center gap-2 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'} group`}>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.aDomicile ? 'bg-purple-500 border-purple-500' : 'border-gray-300 dark:border-white/20 group-hover:border-purple-500'}`}>
                                {formData.aDomicile && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">À Domicile</span>
                              <input type="checkbox" className="hidden" disabled={!isEditing} checked={formData.aDomicile} onChange={(e) => setFormData(p => ({...p, aDomicile: e.target.checked}))} />
                            </label>
                          </div>
                          {!formData.enLocal && !formData.aDomicile && isEditing && (
                            <p className="text-xs text-red-500 mt-2 font-medium">Vous devez sélectionner au moins une option de déplacement.</p>
                          )}
                        </div>

                        {formData.enLocal && (
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide flex justify-between">
                              <span>Localisation exacte sur la carte</span>
                              {isEditing && <span className="text-[#0059B2] font-normal normal-case">Déplacez l'épingle</span>}
                            </label>
                            <div className={`transition-all duration-300 ${!isEditing ? 'opacity-70 pointer-events-none grayscale-[30%]' : ''}`}>
                              <LocationPicker 
                                position={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null} 
                                onChange={(pos) => isEditing && setFormData(p => ({...p, lat: pos.lat, lng: pos.lng}))} 
                                height="250px" 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'password' && (
                    <div className="glass-card rounded-3xl p-6 sm:p-8">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sécurité du compte</h2>
                      
                      {pwSuccess&&<div className="mb-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold px-5 py-4 rounded-2xl"><Check size={18}/>Mot de passe mis à jour !</div>}
                      {pwError&&<div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 font-semibold px-5 py-4 rounded-2xl"><AlertCircle size={18}/>{pwError}</div>}
                      
                      <div className="space-y-5 max-w-md">
                        {([{label:'Mot de passe actuel',key:'current'},{label:'Nouveau mot de passe',key:'next'},{label:'Confirmer le nouveau',key:'confirm'}] as {label:string;key:'current'|'next'|'confirm'}[]).map(({label,key})=>(
                          <div key={key}>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{label}</label>
                            <div className="relative">
                              <input 
                                type={showPwFields[key]?'text':'password'} 
                                autoComplete="new-password" 
                                className="w-full pl-4 pr-12 py-3 rounded-xl border bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm font-medium focus:border-[#0059B2] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                                value={pwForm[key]} 
                                onChange={e=>setPwForm(p=>({...p,[key]:e.target.value}))}
                              />
                              <button type="button" onClick={()=>setShowPwFields(p=>({...p,[key]:!p[key]}))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                {showPwFields[key]?<EyeOff size={18}/>:<Eye size={18}/>}
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {pwForm.next && (
                          <div className="pt-2">
                            <div className="flex gap-1.5 mb-2">
                              {[1,2,3,4].map(level=>{
                                const s = pwForm.next.length>=12&&/[A-Z]/.test(pwForm.next)&&/[0-9]/.test(pwForm.next)&&/[^a-zA-Z0-9]/.test(pwForm.next)?4:pwForm.next.length>=10&&/[A-Z]/.test(pwForm.next)&&/[0-9]/.test(pwForm.next)?3:pwForm.next.length>=8?2:1;
                                return <div key={level} className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{background:level<=s?['','#ef4444','#f59e0b','#3b82f6','#10b981'][s]:'var(--tw-colors-gray-200)'}}/>;
                              })}
                            </div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                              Sécurité : {pwForm.next.length<8?'Trop court':pwForm.next.length<10?'Faible':/[A-Z]/.test(pwForm.next)&&/[0-9]/.test(pwForm.next)&&/[^a-zA-Z0-9]/.test(pwForm.next)?'Très fort':/[A-Z]/.test(pwForm.next)&&/[0-9]/.test(pwForm.next)?'Fort':'Moyen'}
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-4">
                          <button 
                            className="group relative overflow-hidden font-semibold py-3 px-6 rounded-xl text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 w-full" 
                            onClick={handleChangePassword} 
                            disabled={isSavingPw}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                            <span className="relative flex items-center justify-center gap-2 z-10">
                              {isSavingPw?<Loader2 size={18} className="animate-spin"/>:<Lock size={18}/>} Mettre à jour le mot de passe
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'privacy' && (
                    <div className="glass-card rounded-3xl p-6 sm:p-8">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Confidentialité & Données</h2>
                      <div className="space-y-2 mb-8">
                        {privacyItems.map((item,i)=>(
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{item.label}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                            </div>
                            <button 
                              onClick={()=>handlePrivacyToggle(i)} 
                              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${privacyState[i] ? 'bg-[#0059B2]' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${privacyState[i] ? 'left-7' : 'left-1 shadow-sm'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-8 border-t border-red-100 dark:border-red-900/30">
                        <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">Zone de danger</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">La suppression de votre compte est définitive et toutes vos données (rendez-vous, clients, paramètres) seront perdues à jamais.</p>
                        <button 
                          onClick={handleDeleteAccount}
                          className="bg-white dark:bg-[#1A1D24] text-red-500 border-2 border-red-100 hover:border-red-500 dark:border-red-500/20 dark:hover:border-red-500 font-semibold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 active:scale-95"
                        >
                          <LogOut size={16}/> Supprimer mon compte
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </section>
      </div>
      {showAide && <AideModel onClose={() => setShowAide(false)} isOpen={showAide} />}
    </motion.div>
  );
};

export default Profils;