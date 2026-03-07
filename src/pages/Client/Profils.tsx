import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import { updateUser } from '../../services/Client/UpdateUser';
import api from '../../services/api';
import {
  User, Settings, Star, Calendar, ChevronRight,
  Camera, Edit3, Mail, Phone, MapPin, Lock,
  Bell, Shield, LogOut, Check, X, Eye, EyeOff, HelpCircle, Loader2, AlertCircle
} from 'lucide-react';
import AideModel from '../../components/AideModel';

type ProfilePage = 'profile' | 'settings';
interface UserData { firstName: string; lastName: string; email: string; phone: string; city: string; bio: string; }

const AVATAR_KEY = 'userAvatar';
const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = () => rej(new Error('Read failed')); r.readAsDataURL(file); });

const Avatar: React.FC<{ src: string | null; initials: string; size?: number; fontSize?: number; onClick?: () => void; showEditBadge?: boolean; loading?: boolean; }> =
  ({ src, initials, size = 88, fontSize = 32, onClick, showEditBadge = false, loading = false }) => (
  <div style={{ position: 'relative', display: 'inline-block' }} onClick={onClick}>
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, cursor: onClick ? 'pointer' : 'default', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px var(--tw-ring-color,#fff), 0 0 0 6px #e5e7eb', overflow: 'hidden' }}>
      {loading ? <Loader2 size={size * 0.28} className="spin" style={{ color: '#0059B2' }} />
        : src ? <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0059B2,#1A6FD1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: '#fff' }}>{initials}</div>
      }
      {onClick && !loading && <div className="avatar-hover-overlay"><Camera size={size * 0.2} color="#fff" /></div>}
    </div>
    {showEditBadge && !loading && (
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#fff', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default' }}>
        <Camera size={12} color="#6b7280" />
      </div>
    )}
  </div>
);

const Profils: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profils');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<ProfilePage>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('info');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => localStorage.getItem(AVATAR_KEY));
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showAide,setShowAide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_MB = 5;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    setAvatarError(null);
    if (!ACCEPTED.includes(file.type)) { setAvatarError('Format non supporté.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setAvatarError(`Max ${MAX_MB} MB.`); return; }
    setAvatarLoading(true);
    try { const url = await readFileAsDataURL(file); localStorage.setItem(AVATAR_KEY, url); setAvatarSrc(url); window.dispatchEvent(new Event('avatarUpdated')); }
    catch { setAvatarError("Erreur lors du chargement."); } finally { setAvatarLoading(false); }
  };
  const handleAvatarRemove = () => { localStorage.removeItem(AVATAR_KEY); setAvatarSrc(null); window.dispatchEvent(new Event('avatarUpdated')); };

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [showPwFields, setShowPwFields] = useState({ current: false, next: false, confirm: false });
  const [notifState, setNotifState] = useState<boolean[]>(() => { const s = localStorage.getItem('notifState'); return s ? JSON.parse(s) : [true,true,false,true,false]; });
  const [privacyState, setPrivacyState] = useState<boolean[]>(() => { const s = localStorage.getItem('privacyState'); return s ? JSON.parse(s) : [true,true,false]; });
  const [userData, setUserData] = useState<UserData>({ firstName:'',lastName:'',email:'',phone:'',city:'',bio:'' });
  const [formData, setFormData] = useState<UserData>({ ...userData });

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      const u = JSON.parse(s); const names = (u.nomComplet||u.nom||'').split(' ');
      const data: UserData = { firstName:names[0]||'', lastName:names.slice(1).join(' ')||'', email:u.email||'', phone:u.telephone||'', city:u.adresse||'', bio:localStorage.getItem('userBio')||'' };
      setUserId(u.idUtilisateur??u.id??u.userId??u.Id??null); setUserName(u.nomComplet||u.nom||''); setUserData(data); setFormData(data);
    }
  }, []);

  const initials = userData.firstName.charAt(0).toUpperCase() + (userData.lastName.charAt(0)||'').toUpperCase();

  const handleSave = async () => {
    if (userId===null) { setSaveError("Impossible d'identifier l'utilisateur."); return; }
    setIsSaving(true); setSaveError(null);
    try {
      const payload = { NomComplet:`${formData.firstName} ${formData.lastName}`.trim(), Telephone:formData.phone, Adresse:formData.city, Role:JSON.parse(localStorage.getItem('user')||'{}').role??'' };
      await updateUser(userId, payload);
      const updated = JSON.parse(localStorage.getItem('user')||'{}'); const names=(updated.nomComplet||updated.nom||'').split(' ');
      setUserData({ firstName:names[0]||formData.firstName, lastName:names.slice(1).join(' ')||formData.lastName, email:updated.email||formData.email, phone:updated.telephone||formData.phone, city:updated.adresse||formData.city, bio:formData.bio });
      localStorage.setItem('userBio', formData.bio); setUserName(updated.nomComplet||updated.nom||`${formData.firstName} ${formData.lastName}`);
      setIsEditing(false); setSaved(true); setTimeout(()=>setSaved(false),3000);
    } catch(err:any) { setSaveError(err?.response?.data?.message||'Une erreur est survenue.'); } finally { setIsSaving(false); }
  };
  const handleCancel = () => { setFormData({...userData}); setIsEditing(false); setSaveError(null); };
  const handleChangePassword = async () => {
    setPwError(null);
    if (!pwForm.current||!pwForm.next||!pwForm.confirm) { setPwError('Veuillez remplir tous les champs.'); return; }
    if (pwForm.next.length<8) { setPwError('Minimum 8 caractères.'); return; }
    if (pwForm.next!==pwForm.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    setIsSavingPw(true);
    try {
      const user=JSON.parse(localStorage.getItem('user')||'{}');
      await api.put(`/auth/change-password/${user.idUtilisateur}`,{AncienMotDePasse:pwForm.current,NouveauMotDePasse:pwForm.next});
      setPwSuccess(true); setPwForm({current:'',next:'',confirm:''}); setTimeout(()=>setPwSuccess(false),3000);
    } catch(err:any) { setPwError(err?.response?.data?.message||'Mot de passe actuel incorrect.'); } finally { setIsSavingPw(false); }
  };
  const handleNotifToggle=(i:number)=>setNotifState(p=>{const n=p.map((v,j)=>j===i?!v:v);localStorage.setItem('notifState',JSON.stringify(n));return n;});
  const handlePrivacyToggle=(i:number)=>setPrivacyState(p=>{const n=p.map((v,j)=>j===i?!v:v);localStorage.setItem('privacyState',JSON.stringify(n));return n;});

  const recentAppointments=[{doctor:'Dr. Youssef Alami',specialty:'Dentiste',date:'15 Jan 2025',status:'Terminé',rating:5},{doctor:'Dr. Sara Bennis',specialty:'Cardiologue',date:'3 Fév 2025',status:'Confirmé',rating:null},{doctor:'Dr. Ahmed Tazi',specialty:'Psychologue',date:'28 Déc 2024',status:'Terminé',rating:4}];
  const settingsTabs=[{id:'info',label:'Informations',icon:User},{id:'password',label:'Mot de passe',icon:Lock},{id:'notifications',label:'Notifications',icon:Bell},{id:'privacy',label:'Confidentialité',icon:Shield}];
  const profileSidebarLinks=[{id:'profile' as ProfilePage,label:'Mon Profil',icon:User},{id:'settings' as ProfilePage,label:'Paramètres du compte',icon:Settings}];
  const notifItems=[{label:'Rappels de rendez-vous',desc:'Rappels 24h avant'},{label:'Confirmations',desc:'Confirmer ou refuser'},{label:'Offres et promotions',desc:'Recevez les meilleures offres'},{label:'Nouveaux spécialistes',desc:"Dans votre secteur"},{label:'Résumé hebdomadaire',desc:'Un récapitulatif'}];
  const privacyItems=[{label:'Profil public',desc:'Permettre aux autres de voir votre profil'},{label:"Afficher l'historique",desc:'Montrer vos rendez-vous précédents'},{label:'Partage de données',desc:"Améliorer l'expérience Bookify"}];

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif; }
        @keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{0%{transform:scale(.92);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .anim-fade-up{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}
        .anim-fade-in{animation:fadeIn .4s ease both}
        .anim-slide-in{animation:slideInRight .4s cubic-bezier(.16,1,.3,1) both}
        .anim-pop{animation:pop .4s cubic-bezier(.16,1,.3,1) both}
        .spin{animation:spin 1s linear infinite}
        .sidebar-overlay{animation:fadeIn .3s ease-out forwards}

        /* ── CARD ── */
        .card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;}
        .dark .card{background:#1a1d27;border-color:#2d3148;}

        /* ── CARD TEXT ── */
        .dark .card h1,.dark .card h2,.dark .card p,.dark .card span,.dark .card label{color:#e2e8f0;}
        .dark .card .text-gray-400,.dark .card .text-gray-500,.dark .card .text-gray-600{color:#8892a4;}
        .dark .card .text-gray-900{color:#e2e8f0;}
        .dark .card .border-gray-100{border-color:#2d3148;}
        .dark .card .border-gray-50{border-color:#2d3148;}
        .dark .card .bg-blue-50{background:rgba(0,89,178,.15);}
        .dark .card .hover\\:bg-gray-50:hover{background:#2d3148;}

        /* ── AVATAR OVERLAY ── */
        .avatar-hover-overlay{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.38);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;}
        div[style*="cursor: pointer"]:hover .avatar-hover-overlay{opacity:1;}

        /* ── INPUTS ── */
        .input-field{width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;outline:none;background:#fafafa;color:#111827;transition:border-color .2s,box-shadow .2s,background .2s;}
        .input-field:focus{border-color:#0059B2;box-shadow:0 0 0 3px rgba(37,99,235,.12);background:#fff;}
        .input-field:disabled{background:#f3f4f6;color:#9ca3af;cursor:not-allowed;}
        .dark .input-field{background:#0f1117;border-color:#2d3148;color:#e2e8f0;}
        .dark .input-field:focus{border-color:#0059B2;background:#0f1117;}
        .dark .input-field:disabled{background:#0f1117;color:#4b5563;}

        /* ── BUTTONS ── */
        .btn-primary{padding:9px 20px;background:#0059B2;color:#fff;border-radius:10px;font-weight:600;font-size:14px;border:none;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;}
        .btn-primary:hover:not(:disabled){background:#004a99;box-shadow:0 4px 12px rgba(37,99,235,.3);}
        .btn-primary:disabled{opacity:.65;cursor:not-allowed;}
        .btn-ghost{padding:9px 20px;background:transparent;color:#6b7280;border-radius:10px;font-weight:600;font-size:14px;border:1.5px solid #e5e7eb;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;}
        .btn-ghost:hover{background:#f3f4f6;color:#374151;}
        .dark .btn-ghost{color:#8892a4;border-color:#2d3148;}
        .dark .btn-ghost:hover{background:#2d3148;color:#e2e8f0;}
        .btn-danger-ghost{padding:9px 20px;background:transparent;color:#ef4444;border-radius:10px;font-weight:600;font-size:14px;border:1.5px solid #fecaca;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;}
        .btn-danger-ghost:hover{background:#fef2f2;}

        /* ── NAV ── */
        .prof-nav{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;color:#6b7280;border:none;background:none;width:100%;text-align:left;}
        .prof-nav:hover{background:#f3f4f6;color:#111827;}
        .prof-nav.active{background:#eff6ff;color:#0059B2;font-weight:600;}
        .dark .prof-nav{color:#8892a4;}
        .dark .prof-nav:hover{background:#2d3148;color:#e2e8f0;}
        .dark .prof-nav.active{background:rgba(0,89,178,.18);color:#60a5fa;}

        .settings-tab{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;color:#6b7280;border:none;background:none;width:100%;text-align:left;}
        .settings-tab:hover{background:#f3f4f6;color:#111827;}
        .settings-tab.active{background:#eff6ff;color:#0059B2;font-weight:600;}
        .dark .settings-tab{color:#8892a4;}
        .dark .settings-tab:hover{background:#2d3148;color:#e2e8f0;}
        .dark .settings-tab.active{background:rgba(0,89,178,.18);color:#60a5fa;}

        /* ── TOGGLES ── */
        .toggle-track{width:44px;height:24px;border-radius:12px;position:relative;cursor:pointer;border:none;transition:background .2s;flex-shrink:0;}
        .toggle-thumb{position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.2);}
        .toggle-on{background:#0059B2;} .toggle-off{background:#d1d5db;}
        .dark .toggle-off{background:#4b5563;}
        .toggle-on .toggle-thumb{transform:translateX(20px);}

        /* ── BADGES ── */
        .status-done{background:#d1fae5;color:#065f46;} .status-confirm{background:#dbeafe;color:#0059B2;}
        .dark .status-done{background:rgba(16,185,129,.15);color:#6ee7b7;}
        .dark .status-confirm{background:rgba(0,89,178,.15);color:#93c5fd;}
        .status-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;}
        .star-filled{color:#f59e0b;fill:#f59e0b;} .star-empty{color:#d1d5db;}
      `}</style>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarFile} />

      {isSidebarOpen && <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40" onClick={()=>setIsSidebarOpen(false)} />}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-surface transform transition-transform duration-300 z-50 ${isSidebarOpen?'translate-x-0':'-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s=>{setActiveSection(s);setIsSidebarOpen(false);}} />
      </div>

      <main className={`min-h-screen transition-all duration-300 lg:${isSidebarOpen?'ml-64':'ml-0'}`}>
        <TopBar userName={userName} onMenuToggle={()=>setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-60 shrink-0 anim-slide-in">
            <div className="card p-5 mb-4 text-center">
              <div className="flex justify-center mb-3">
                <Avatar src={avatarSrc} initials={initials} size={88} fontSize={32} onClick={()=>fileInputRef.current?.click()} showEditBadge loading={avatarLoading} />
              </div>
              <p className="font-bold text-gray-900 text-sm">{userData.firstName} {userData.lastName}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{userData.email}</p>
              {avatarError && <p className="mt-2 text-xs text-red-500 flex items-center justify-center gap-1"><AlertCircle size={11}/>{avatarError}</p>}
            </div>
            <div className="card p-3 mb-4">
              {profileSidebarLinks.map(link=>{const Icon=link.icon;return(
                <button key={link.id} onClick={()=>setCurrentPage(link.id)} className={`prof-nav ${currentPage===link.id?'active':''}`}>
                  <Icon size={16}/><span className="flex-1 text-left">{link.label}</span>{currentPage===link.id&&<ChevronRight size={14}/>}
                </button>
              );})}
              <div className="my-1.5 border-t border-gray-100"/>
              <button className="prof-nav" onClick={() => setShowAide(true)}>
                <HelpCircle size={16}/>Aide
              </button>
              <button className="prof-nav" style={{color:'#ef4444'}} onClick={()=>{localStorage.removeItem('user');window.location.href='/login';}}>
                <LogOut size={16} style={{color:'#ef4444'}}/>Déconnexion
              </button>
            </div>
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Activité</p>
              {[{label:'Rendez-vous',value:'12'},{label:'Avis laissés',value:'7'},{label:'Favoris',value:'4'}].map(s=>(
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{s.label}</span>
                  <span className="text-sm font-bold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN */}
          <section className="flex-1 min-w-0">

            {currentPage==='profile' && (
              <div className="anim-fade-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">Profil</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">Gérez vos informations personnelles</p>
                  </div>
                  <button className="btn-primary" onClick={()=>{setCurrentPage('settings');setActiveSettingsTab('info');}}><Edit3 size={14}/>Modifier</button>
                </div>
                <div className="card p-6 mb-5">
                  <h2 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2"><User size={16} className="text-[#0059B2]"/>Informations personnelles</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[{icon:User,label:'Nom complet',value:`${userData.firstName} ${userData.lastName}`},{icon:Mail,label:'Email',value:userData.email},{icon:Phone,label:'Téléphone',value:userData.phone},{icon:MapPin,label:'Ville',value:userData.city}].map(item=>{
                      const Icon=item.icon; return(
                      <div key={item.label} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5"><Icon size={15} className="text-[#0059B2]"/></div>
                        <div><p className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</p><p className="text-sm font-semibold text-gray-900">{item.value||'—'}</p></div>
                      </div>);
                    })}
                  </div>
                  {userData.bio&&<div className="mt-5 pt-5 border-t border-gray-100"><p className="text-xs text-gray-400 font-medium mb-1">Bio</p><p className="text-sm text-gray-700">{userData.bio}</p></div>}
                </div>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Calendar size={16} className="text-[#0059B2]"/>Rendez-vous récents</h2>
                    <button className="text-xs text-[#0059B2] font-semibold hover:underline">Voir tout</button>
                  </div>
                  <div className="space-y-2">
                    {recentAppointments.map((appt,i)=>(
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0059B2] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-sm shrink-0">{appt.doctor.charAt(4)}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{appt.doctor}</p><p className="text-xs text-gray-500">{appt.specialty} · {appt.date}</p></div>
                        <div className="text-right shrink-0">
                          <span className={`status-badge ${appt.status==='Terminé'?'status-done':'status-confirm'}`}>{appt.status}</span>
                          {appt.rating&&<div className="flex gap-0.5 justify-end mt-1">{[1,2,3,4,5].map(s=><Star key={s} size={10} className={s<=appt.rating!?'star-filled':'star-empty'}/>)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentPage==='settings' && (
              <div className="anim-fade-up">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">Paramètres du compte</h1>
                  <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">Gérez vos préférences et sécurité</p>
                </div>
                {saved&&<div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-semibold px-4 py-3 rounded-xl anim-pop"><Check size={15}/>Modifications enregistrées !</div>}
                {saveError&&<div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold px-4 py-3 rounded-xl anim-pop"><AlertCircle size={15}/>{saveError}</div>}

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="card p-3 sm:w-48 shrink-0 h-fit">
                    {settingsTabs.map(tab=>{const Icon=tab.icon;return(
                      <button key={tab.id} onClick={()=>setActiveSettingsTab(tab.id)} className={`settings-tab ${activeSettingsTab===tab.id?'active':''}`}><Icon size={15}/>{tab.label}</button>
                    );})}
                  </div>
                  <div className="flex-1 min-w-0">

                    {activeSettingsTab==='info' && (
                      <div className="card p-6 anim-fade-in">
                        <div className="flex items-center justify-between mb-5">
                          <h2 className="text-sm font-bold text-gray-900">Informations personnelles</h2>
                          {!isEditing?<button className="btn-primary" onClick={()=>setIsEditing(true)}><Edit3 size={13}/>Modifier</button>:
                          <div className="flex gap-2"><button className="btn-ghost" onClick={handleCancel} disabled={isSaving}><X size={13}/>Annuler</button>
                          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>{isSaving?<><Loader2 size={13} className="spin"/>Enregistrement...</>:<><Check size={13}/>Enregistrer</>}</button></div>}
                        </div>
                        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                          <Avatar src={avatarSrc} initials={initials} size={72} fontSize={26} onClick={()=>fileInputRef.current?.click()} loading={avatarLoading}/>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{userData.firstName} {userData.lastName}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <button onClick={()=>fileInputRef.current?.click()} className="text-xs text-[#0059B2] font-semibold flex items-center gap-1 hover:underline"><Camera size={11}/>{avatarSrc?'Changer la photo':'Ajouter une photo'}</button>
                              {avatarSrc&&<button onClick={handleAvatarRemove} className="text-xs text-red-500 font-semibold flex items-center gap-1 hover:underline"><X size={11}/>Supprimer</button>}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max {MAX_MB} MB</p>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Prénom</label><input className="input-field" value={formData.firstName} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,firstName:e.target.value}))}/></div>
                          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom</label><input className="input-field" value={formData.lastName} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,lastName:e.target.value}))}/></div>
                          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label><input className="input-field" type="email" value={formData.email} disabled/></div>
                          <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label><input className="input-field" value={formData.phone} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,phone:e.target.value}))}/></div>
                          <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1.5">Ville</label><input className="input-field" value={formData.city} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,city:e.target.value}))}/></div>
                          <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1.5">Bio</label><textarea className="input-field resize-none" rows={3} value={formData.bio} disabled={!isEditing} onChange={e=>setFormData(p=>({...p,bio:e.target.value}))}/></div>
                        </div>
                      </div>
                    )}

                    {activeSettingsTab==='password' && (
                      <div className="card p-6 anim-fade-in">
                        <h2 className="text-sm font-bold text-gray-900 mb-5">Changer le mot de passe</h2>
                        {pwSuccess&&<div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-semibold px-4 py-3 rounded-xl anim-pop"><Check size={15}/>Mot de passe modifié !</div>}
                        {pwError&&<div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold px-4 py-3 rounded-xl anim-pop"><AlertCircle size={15}/>{pwError}</div>}
                        <div className="space-y-4 max-w-sm">
                          {([{label:'Mot de passe actuel',key:'current'},{label:'Nouveau mot de passe',key:'next'},{label:'Confirmer mot de passe',key:'confirm'}] as {label:string;key:'current'|'next'|'confirm'}[]).map(({label,key})=>(
                            <div key={key}><label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                            <div className="relative"><input type={showPwFields[key]?'text':'password'} autoComplete="new-password" placeholder="" className="input-field pr-10" value={pwForm[key]} onChange={e=>setPwForm(p=>({...p,[key]:e.target.value}))}/>
                            <button type="button" onClick={()=>setShowPwFields(p=>({...p,[key]:!p[key]}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPwFields[key]?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></div>
                          ))}
                          {pwForm.next&&<div><div className="flex gap-1 mb-1">{[1,2,3,4].map(level=>{const s=pwForm.next.length>=12&&/[A-Z]/.test(pwForm.next)&&/[0-9]/.test(pwForm.next)&&/[^a-zA-Z0-9]/.test(pwForm.next)?4:pwForm.next.length>=10&&/[A-Z]/.test(pwForm.next)&&/[0-9]/.test(pwForm.next)?3:pwForm.next.length>=8?2:1;return<div key={level} className="h-1 flex-1 rounded-full transition-all" style={{background:level<=s?['','#ef4444','#f59e0b','#3b82f6','#22c55e'][s]:'#e5e7eb'}}/>;})}</div><p className="text-xs text-gray-400">{pwForm.next.length<8?'Trop court':pwForm.next.length<10?'Faible':/[A-Z]/.test(pwForm.next)&&/[0-9]/.test(pwForm.next)&&/[^a-zA-Z0-9]/.test(pwForm.next)?'Très fort':/[A-Z]/.test(pwForm.next)&&/[0-9]/.test(pwForm.next)?'Fort':'Moyen'}</p></div>}
                          <button className="btn-primary w-full justify-center mt-1" onClick={handleChangePassword} disabled={isSavingPw}>{isSavingPw?<><Loader2 size={13} className="spin"/>Modification...</>:<><Check size={13}/>Mettre à jour</>}</button>
                        </div>
                      </div>
                    )}

                    {activeSettingsTab==='notifications' && (
                      <div className="card p-6 anim-fade-in">
                        <h2 className="text-sm font-bold text-gray-900 mb-5">Préférences de notifications</h2>
                        <div className="space-y-1">{notifItems.map((item,i)=>(
                          <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                            <div><p className="text-sm font-semibold text-gray-900">{item.label}</p><p className="text-xs text-gray-500 mt-0.5">{item.desc}</p></div>
                            <button onClick={()=>handleNotifToggle(i)} className={`toggle-track ${notifState[i]?'toggle-on':'toggle-off'}`}><div className="toggle-thumb"/></button>
                          </div>
                        ))}</div>
                      </div>
                    )}

                    {activeSettingsTab==='privacy' && (
                      <div className="card p-6 anim-fade-in">
                        <h2 className="text-sm font-bold text-gray-900 mb-5">Confidentialité & Sécurité</h2>
                        <div className="space-y-1">{privacyItems.map((item,i)=>(
                          <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                            <div><p className="text-sm font-semibold text-gray-900">{item.label}</p><p className="text-xs text-gray-500 mt-0.5">{item.desc}</p></div>
                            <button onClick={()=>handlePrivacyToggle(i)} className={`toggle-track ${privacyState[i]?'toggle-on':'toggle-off'}`}><div className="toggle-thumb"/></button>
                          </div>
                        ))}</div>
                        <div className="pt-5 mt-2 border-t border-gray-100">
                          <p className="text-sm font-bold text-gray-900 mb-3">Zone de danger</p>
                          <button className="btn-danger-ghost"><LogOut size={14}/>Supprimer mon compte</button>
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
        <AideModel isOpen={showAide} onClose={() => setShowAide(false)} />
      </main>
    </div>
  );
};
export default Profils;