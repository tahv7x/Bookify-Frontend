import React, { useState, useEffect } from 'react';
import {
  X, CalendarCheck, CheckCircle2, ChevronRight, ChevronLeft,
  Briefcase, MessageSquare, Send
} from 'lucide-react';
import { createRendezVous } from '../../services/Client/rendezVousService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any;
  availabilityData: any[];
  initialSlot?: string | null;
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, provider, availabilityData, initialSlot = null }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animDir, setAnimDir] = useState<'left' | 'right'>('right');
  const [visible, setVisible] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Initialize service selection
  useEffect(() => {
    if (provider?.services?.length > 0 && !selectedServiceId) {
      setSelectedServiceId(provider.services[0].id);
    }
  }, [provider]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
      setCurrentStep(0);
      setSelectedSlot(initialSlot || null);
      setDescription('');
    } else {
      setVisible(false);
    }
  }, [isOpen, initialSlot]);

  if (!isOpen || !provider) return null;

  const goTo = (idx: number) => {
    setAnimDir(idx > currentStep ? 'right' : 'left');
    setCurrentStep(idx);
  };
  
  const handleNext = () => {
    if (currentStep === 0 && selectedServiceId) goTo(1);
    else if (currentStep === 1 && selectedSlot) goTo(2);
    else if (currentStep === 2) submitBooking();
  };
  
  const handlePrev = () => {
    if (currentStep > 0 && currentStep < 3) goTo(currentStep - 1);
  };

  const submitBooking = async () => {
    if (!selectedSlot || !selectedServiceId) return;
    setIsBooking(true);
    try {
      const [dayName, time] = selectedSlot.split(' ');
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const targetDayIndex = days.indexOf(dayName);
      const today = new Date();
      let daysToAdd = targetDayIndex - today.getDay();
      if (daysToAdd <= 0) daysToAdd += 7;
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      const [hours, minutes] = time.split(':');
      targetDate.setHours(Number(hours), Number(minutes), 0, 0);

      const endDate = new Date(targetDate);
      endDate.setHours(targetDate.getHours() + 1);

      await createRendezVous({
        idPres: Number(provider.id),
        idServ: selectedServiceId,
        DateDebut: targetDate.toISOString(),
        DateFin: endDate.toISOString()
      });
      goTo(3); // Success step
    } catch (error) {
      console.error("Booking error:", error);
      alert("Une erreur est survenue lors de la réservation.");
    } finally {
      setIsBooking(false);
    }
  };

  // Steps definition for UI metadata
  const stepsMeta = [
    { id: 1, icon: Briefcase, color: '#0059B2', bgColor: 'rgba(0,89,178,0.10)', title: 'Choisissez le service', subtitle: 'Prestation souhaitée' },
    { id: 2, icon: CalendarCheck, color: '#0891b2', bgColor: 'rgba(8,145,178,0.10)', title: 'Choisissez un créneau', subtitle: 'Date et Heure' },
    { id: 3, icon: MessageSquare, color: '#7c3aed', bgColor: 'rgba(124,58,237,0.10)', title: 'Détails de la demande', subtitle: 'Résumé' },
  ];

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
          style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 520, boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(0, 89, 178, 0.2)', overflow: 'hidden', position: 'relative' }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0059B2 0%, #1A6FD1 100%)', padding: '22px 24px 20px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8, display: 'flex' }}>
                <CalendarCheck size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Réservation en ligne</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Prendre rendez-vous avec {provider.name}</div>
              </div>
              <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)') }
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)') }
              >
                <X size={16} color="#fff" />
              </button>
            </div>
            
            {/* Step indicators (only show for first 3 steps) */}
            {currentStep < 3 && (
              <div style={{ display: 'flex', gap: 6 }}>
                {stepsMeta.map((s, i) => (
                  <button key={i} onClick={() => {
                    // Only allow clicking past steps
                    if (i < currentStep) goTo(i);
                  }} style={{ flex: i === currentStep ? 3 : 1, height: 5, borderRadius: 999, background: i === currentStep ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', cursor: i < currentStep ? 'pointer' : 'default', transition: 'all 0.35s cubic-bezier(.16,1,.3,1)' }} />
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div className={`aide-step-${animDir}`} style={{ padding: '24px 24px 20px', minHeight: '350px' }}>
            
            {/* SUCCESS STEP */}
            {currentStep === 3 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} color="#059669" />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Demande envoyée !</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
                  Votre réservation a bien été transmise. <strong>{provider.name}</strong> vous répondra très rapidement sur votre espace client.
                </div>
                <button
                  onClick={onClose}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#f3f4f6', color: '#374151', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Meta Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: stepsMeta[currentStep].bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {React.createElement(stepsMeta[currentStep].icon, { size: 20, color: stepsMeta[currentStep].color })}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: stepsMeta[currentStep].color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>
                      Étape {stepsMeta[currentStep].id} sur 3 · {stepsMeta[currentStep].subtitle}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{stepsMeta[currentStep].title}</div>
                  </div>
                </div>

                {/* STEP 1: SERVICES */}
                {currentStep === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {provider.services.map((s:any) => (
                      <div 
                        key={s.id}
                        onClick={() => setSelectedServiceId(s.id)}
                        style={{ 
                          padding: '16px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                          border: `2px solid ${selectedServiceId === s.id ? '#0059B2' : '#f3f4f6'}`,
                          background: selectedServiceId === s.id ? 'rgba(0,89,178,0.04)' : '#fff'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: selectedServiceId === s.id ? '#0059B2' : '#374151' }}>{s.nom || s.name}</span>
                          <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{s.prix} MAD</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 2: AVAILABILITY GRID / DATE SELECTION */}
                {currentStep === 1 && (() => {
                  const selectedService = provider.services.find((s:any) => s.id === selectedServiceId);
                  const isDaily = selectedService?.uniteDuree === 'Jour';

                  return (
                  <div style={{ background: 'rgba(8,145,178,0.03)', borderRadius: 14, padding: '16px', border: '1px solid rgba(8,145,178,0.1)' }}>
                    {isDaily ? (
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textAlign: 'center' }}>
                          Ce service se compte en Jours. Choisissez votre date de début :
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                          {availabilityData.filter(d => d.slots.some((s:any) => s.available)).map(d => {
                            // Format slot key without time since it's daily
                            const key = `${d.day} 09:00`; 
                            const isSelected = selectedSlot === key;
                            return (
                              <button
                                key={d.day}
                                onClick={() => setSelectedSlot(isSelected ? null : key)}
                                style={{
                                  padding: '12px 8px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                  background: isSelected ? 'linear-gradient(135deg, #0059B2, #1A6FD1)' : '#fff',
                                  color: isSelected ? '#fff' : '#0891b2',
                                  boxShadow: isSelected ? '0 4px 10px rgba(0,89,178,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                                  border: isSelected ? 'none' : '1px solid rgba(8,145,178,0.2)'
                                }}
                              >
                                {d.day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                    <div style={{ overflowX: 'auto', margin: '-8px' }}>
                      <div style={{ minWidth: 400, padding: 8 }}>
                        {/* Day headers */}
                        <div style={{ display: 'grid', gap: 4, marginBottom: 8, gridTemplateColumns: '44px repeat(6, 1fr)' }}>
                          <div/>
                          {availabilityData.map(d => (
                            <div key={d.day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>{d.day}</div>
                          ))}
                        </div>
                        {/* Time rows */}
                        {TIME_SLOTS.map((timeLabel, slotIdx) => (
                          <div key={slotIdx} style={{ display: 'grid', gap: 4, marginBottom: 4, gridTemplateColumns: '44px repeat(6, 1fr)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>{timeLabel}</span>
                            </div>
                            {availabilityData.map((dayData) => {
                              const slot = dayData.slots[slotIdx];
                              const key = `${dayData.day} ${slot.time}`;
                              const isSelected = selectedSlot === key;
                              
                              return slot.available ? (
                                <button
                                  key={dayData.day}
                                  onClick={() => setSelectedSlot(isSelected ? null : key)}
                                  style={{
                                    height: 34, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                    background: isSelected ? 'linear-gradient(135deg, #0059B2, #1A6FD1)' : '#fff',
                                    color: isSelected ? '#fff' : '#0891b2',
                                    boxShadow: isSelected ? '0 4px 10px rgba(0,89,178,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                                    border: isSelected ? 'none' : '1px solid rgba(8,145,178,0.2)'
                                  }}
                                  onMouseEnter={e => { if(!isSelected) { e.currentTarget.style.background = '#0891b2'; e.currentTarget.style.color = '#fff'; } }}
                                  onMouseLeave={e => { if(!isSelected) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0891b2'; } }}
                                >
                                  {slot.time}
                                </button>
                              ) : (
                                <div key={dayData.day} style={{ height: 34, borderRadius: 8, background: '#f3f4f6', border: '1px solid #e5e7eb', cursor: 'not-allowed' }}/>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                  );
                })}

                {/* STEP 3: DETAILS */}
                {currentStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'rgba(124,58,237,0.05)', borderRadius: 14, padding: '16px', border: '1px solid rgba(124,58,237,0.1)' }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Récapitulatif</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px dashed rgba(124,58,237,0.2)' }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>Service</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                          {provider.services.find((s:any)=>s.id===selectedServiceId)?.nom || provider.services.find((s:any)=>s.id===selectedServiceId)?.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>Créneau</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>
                          {provider.services.find((s:any)=>s.id===selectedServiceId)?.uniteDuree === 'Jour' 
                            ? selectedSlot?.split(' ')[0] 
                            : selectedSlot}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Message pour {provider.name} (Optionnel)</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Précisez votre besoin, vos attentes..."
                        style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit', resize: 'none', height: 100, outline: 'none', transition: 'border 0.2s' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                        onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer navigation (Only for steps 1-3) */}
          {currentStep < 3 && (
            <div style={{ padding: '16px 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', color: currentStep === 0 ? '#d1d5db' : '#374151', fontSize: 13, fontWeight: 700, cursor: currentStep === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              >
                <ChevronLeft size={16} /> Retour
              </button>
              
              <button
                onClick={handleNext}
                disabled={(currentStep === 0 && !selectedServiceId) || (currentStep === 1 && !selectedSlot) || isBooking}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 12, border: 'none', 
                  background: isBooking || (currentStep === 0 && !selectedServiceId) || (currentStep === 1 && !selectedSlot) ? '#d1d5db' : stepsMeta[currentStep].color, 
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: isBooking || (currentStep === 0 && !selectedServiceId) || (currentStep === 1 && !selectedSlot) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  boxShadow: isBooking || (currentStep === 0 && !selectedServiceId) || (currentStep === 1 && !selectedSlot) ? 'none' : `0 4px 14px ${stepsMeta[currentStep].color}50` 
                }}
              >
                {isBooking ? <div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}/> : (currentStep === 2 ? 'Confirmer' : 'Suivant')}
                {!isBooking && currentStep < 2 && <ChevronRight size={16} />}
                {!isBooking && currentStep === 2 && <Send size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default BookingModal;