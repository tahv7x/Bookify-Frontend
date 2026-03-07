import React, { useState, useEffect } from 'react';
import {
  X, Search, CalendarCheck, UserCheck, CheckCircle2,
  ChevronRight, ChevronLeft, Star, Clock, MapPin,
  Bell, CreditCard, BookOpen
} from 'lucide-react';

interface AideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    id: 1,
    icon: Search,
    color: '#0059B2',
    bgColor: 'rgba(0,89,178,0.10)',
    title: 'Recherchez un spécialiste',
    subtitle: 'Trouvez le bon professionnel',
    description: 'Utilisez la barre de recherche pour trouver un médecin, dentiste, psychologue ou tout autre spécialiste près de chez vous.',
    tips: [
      { icon: MapPin, text: 'Filtrez par ville ou quartier' },
      { icon: Star, text: 'Consultez les avis et notes des patients' },
      { icon: Clock, text: 'Vérifiez les disponibilités en temps réel' },
    ],
    visual: (
      <div style={{ background: 'rgba(0,89,178,0.06)', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(0,89,178,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 10, padding: '10px 14px', border: '1.5px solid rgba(0,89,178,0.25)', boxShadow: '0 2px 8px rgba(0,89,178,0.08)' }}>
          <Search size={15} color="#0059B2" />
          <span style={{ fontSize: 13, color: '#9ca3af' }}>Dentiste à Casablanca...</span>
          <div style={{ marginLeft: 'auto', background: '#0059B2', color: '#fff', borderRadius: 7, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>Chercher</div>
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {['Dr. Youssef Alami · Dentiste ⭐4.9', 'Dr. Sara Bennis · Cardiologue ⭐4.7'].map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 9, padding: '9px 12px', fontSize: 12, color: '#374151', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0059B2,#1A6FD1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {item.charAt(3)}
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: CalendarCheck,
    color: '#0891b2',
    bgColor: 'rgba(8,145,178,0.10)',
    title: 'Choisissez un créneau',
    subtitle: 'Réservez à votre convenance',
    description: 'Sélectionnez la date et l\'heure qui vous conviennent parmi les créneaux disponibles du praticien.',
    tips: [
      { icon: CalendarCheck, text: 'Calendrier interactif avec disponibilités' },
      { icon: Bell, text: 'Rappel automatique 24h avant' },
      { icon: Clock, text: 'Créneaux matin, après-midi et soir' },
    ],
    visual: (
      <div style={{ background: 'rgba(8,145,178,0.06)', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(8,145,178,0.12)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0891b2', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Janvier 2025</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <ChevronLeft size={14} color="#0891b2" />
            <ChevronRight size={14} color="#0891b2" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 10 }}>
          {['L','M','M','J','V','S','D'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#9ca3af', padding: '2px 0' }}>{d}</div>
          ))}
          {[...Array(4)].map((_, i) => <div key={i} />)}
          {[15,16,17,18,19,20,21].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, borderRadius: 7, padding: '5px 0', fontWeight: d === 18 ? 700 : 400, background: d === 18 ? '#0891b2' : 'transparent', color: d === 18 ? '#fff' : d === 19 || d === 20 ? '#d1d5db' : '#374151', cursor: d !== 19 && d !== 20 ? 'pointer' : 'default' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['09:00','10:30','14:00','15:30'].map((t, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 7, background: i === 1 ? '#0891b2' : '#fff', color: i === 1 ? '#fff' : '#374151', border: `1.5px solid ${i === 1 ? '#0891b2' : '#e5e7eb'}`, cursor: 'pointer' }}>{t}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: UserCheck,
    color: '#7c3aed',
    bgColor: 'rgba(124,58,237,0.10)',
    title: 'Confirmez votre profil',
    subtitle: 'Vos infos en un clic',
    description: 'Vérifiez vos informations personnelles avant de confirmer. Votre profil est rempli automatiquement depuis votre compte.',
    tips: [
      { icon: UserCheck, text: 'Données pré-remplies depuis votre compte' },
      { icon: CreditCard, text: 'Ajoutez une note ou motif de consultation' },
      { icon: CheckCircle2, text: 'Relisez avant de valider' },
    ],
    visual: (
      <div style={{ background: 'rgba(124,58,237,0.06)', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(124,58,237,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Ahmed Moussaoui</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>ahmed.m@email.com</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,0.1)', padding: '3px 8px', borderRadius: 6 }}>Vérifié ✓</div>
        </div>
        {[{ label: 'Date', value: '18 Jan · 10:30' }, { label: 'Spécialiste', value: 'Dr. Alami' }, { label: 'Motif', value: 'Consultation générale' }].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(124,58,237,0.1)' : 'none' }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{row.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{row.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    icon: CheckCircle2,
    color: '#059669',
    bgColor: 'rgba(5,150,105,0.10)',
    title: 'Rendez-vous confirmé !',
    subtitle: 'C\'est tout !',
    description: 'Votre rendez-vous est enregistré. Vous recevrez une confirmation et un rappel. Retrouvez-le dans "Mes Rendez-vous".',
    tips: [
      { icon: Bell, text: 'Notification de confirmation immédiate' },
      { icon: CalendarCheck, text: 'Visible dans "Mes Rendez-vous"' },
      { icon: Star, text: 'Laissez un avis après la consultation' },
    ],
    visual: (
      <div style={{ background: 'rgba(5,150,105,0.06)', borderRadius: 14, padding: '20px 18px', border: '1px solid rgba(5,150,105,0.15)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <CheckCircle2 size={28} color="#059669" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginBottom: 4 }}>Rendez-vous confirmé !</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>Dr. Youssef Alami · 18 Jan à 10:30</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 8, background: '#059669', color: '#fff' }}>Voir le RDV</div>
          <div style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', color: '#6b7280' }}>Annuler</div>
        </div>
      </div>
    ),
  },
];

const AideModal: React.FC<AideModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animDir, setAnimDir] = useState<'left' | 'right'>('right');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) { setTimeout(() => setVisible(true), 10); setCurrentStep(0); }
    else setVisible(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  const goTo = (idx: number) => {
    setAnimDir(idx > currentStep ? 'right' : 'left');
    setCurrentStep(idx);
  };
  const next = () => { if (currentStep < steps.length - 1) goTo(currentStep + 1); else onClose(); };
  const prev = () => { if (currentStep > 0) goTo(currentStep - 1); };

  return (
    <>
      <style>{`
        @keyframes aideBackdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes aideModalIn { from { opacity: 0; transform: scale(0.94) translateY(20px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes aideStepIn { from { opacity: 0; transform: translateX(32px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes aideStepInLeft { from { opacity: 0; transform: translateX(-32px) } to { opacity: 1; transform: translateX(0) } }
        .aide-backdrop { animation: aideBackdropIn 0.25s ease both; }
        .aide-modal { animation: aideModalIn 0.3s cubic-bezier(.16,1,.3,1) both; }
        .aide-step-right { animation: aideStepIn 0.35s cubic-bezier(.16,1,.3,1) both; }
        .aide-step-left { animation: aideStepInLeft 0.35s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      {/* Backdrop */}
      <div
        className="aide-backdrop"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      >
        {/* Modal */}
        <div
          className="aide-modal"
          onClick={e => e.stopPropagation()}
          style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.18)', overflow: 'hidden', position: 'relative' }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0059B2 0%, #1A6FD1 100%)', padding: '22px 24px 20px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8, display: 'flex' }}>
                <BookOpen size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Guide d'utilisation</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Comment prendre un rendez-vous</div>
              </div>
              <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)') }
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)') }
              >
                <X size={16} color="#fff" />
              </button>
            </div>
            {/* Step indicators */}
            <div style={{ display: 'flex', gap: 6 }}>
              {steps.map((s, i) => (
                <button key={i} onClick={() => goTo(i)} style={{ flex: i === currentStep ? 3 : 1, height: 5, borderRadius: 999, background: i === currentStep ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(.16,1,.3,1)' }} />
              ))}
            </div>
          </div>

          {/* Step content */}
          <div key={currentStep} className={`aide-step-${animDir}`} style={{ padding: '24px 24px 20px' }}>
            {/* Step badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: step.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={step.color} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: step.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>
                  Étape {step.id} sur {steps.length} · {step.subtitle}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{step.title}</div>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>{step.description}</p>

            {/* Visual */}
            <div style={{ marginBottom: 16 }}>{step.visual}</div>

            {/* Tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {step.tips.map((tip, i) => {
                const TipIcon = tip.icon;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', background: step.bgColor, borderRadius: 10 }}>
                    <TipIcon size={13} color={step.color} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>{tip.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer navigation */}
          <div style={{ padding: '14px 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={prev}
              disabled={currentStep === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'transparent', color: currentStep === 0 ? '#d1d5db' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: currentStep === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              <ChevronLeft size={14} />Précédent
            </button>
            <div style={{ display: 'flex', gap: 5 }}>
              {steps.map((_, i) => (
                <div key={i} style={{ width: i === currentStep ? 18 : 6, height: 6, borderRadius: 999, background: i === currentStep ? step.color : '#e5e7eb', transition: 'all 0.3s' }} />
              ))}
            </div>
            <button
              onClick={next}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: step.color, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 12px ${step.color}40` }}
            >
              {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}<ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AideModal;