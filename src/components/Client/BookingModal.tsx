import React, { useState, useEffect } from "react";
import {
  X,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  MessageSquare,
  Send,
} from "lucide-react";
import { createRendezVous, acceptAlternativeDate } from "../../services/Client/rendezVousService";
import toast from 'react-hot-toast';
import api from "../../services/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any;
  availabilityData: any[];
  initialSlot?: string | null;
  mode?: "book" | "reschedule";
  rescheduleRdvId?: number;
  initialSelectedServiceId?: number | null;
  initialSelectedLieu?: "En Local" | "À Domicile" | null;
}

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  provider,
  availabilityData,
  initialSlot = null,
  mode = "book",
  rescheduleRdvId,
  initialSelectedServiceId = null,
  initialSelectedLieu = null,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const [visible, setVisible] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    initialSelectedServiceId,
  );
  const [selectedLieu, setSelectedLieu] = useState<
    "En Local" | "À Domicile" | null
  >(initialSelectedLieu);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && provider?.id) {
      api.get(`/RendezVous/prestataire/${provider.id}/occupied`)
        .then(res => setOccupiedSlots(res.data))
        .catch(err => console.error("Error fetching occupied slots", err));
    }
  }, [isOpen, provider]);

  const isServiceFullDay = (s: any) =>
    Boolean(s?.isFullDay) || /jour/i.test(s?.uniteDuree || "");

  const isSlotOccupied = (dateStr: string, timeStr: string) => {
    if (!selectedServiceId || !provider?.services) return false;
    const selectedService = provider.services.find(
      (s: any) => s.id === selectedServiceId,
    );
    if (!selectedService) return false;

    const isDaily = isServiceFullDay(selectedService);
    const slotStart = isDaily
      ? new Date(`${dateStr}T00:00:00`)
      : new Date(`${dateStr}T${timeStr}:00`);

    const duree = selectedService.duree || 1;
    const unite = (selectedService.uniteDuree || 'HEURES').toUpperCase();
    const slotEnd = new Date(slotStart);
    if (unite.includes('JOUR')) {
      slotEnd.setDate(slotEnd.getDate() + duree);
    } else if (unite.includes('MINUTE')) {
      slotEnd.setMinutes(slotEnd.getMinutes() + duree);
    } else {
      slotEnd.setHours(slotEnd.getHours() + duree);
    }

    return occupiedSlots.some((occ: any) => {
      const occStart = new Date(occ.dateDebut);
      const occEnd = new Date(occ.dateFin || occStart.getTime() + 60 * 60 * 1000);

      return occStart < slotEnd && occEnd > slotStart;
    });
  };

  // Initialize service selection
  useEffect(() => {
    if (provider?.services?.length > 0 && !selectedServiceId) {
      const defaultService = initialSlot
        ? provider.services.find((s: any) => !isServiceFullDay(s))
        : provider.services[0];
      setSelectedServiceId(defaultService?.id || provider.services[0].id);
    }
    if (provider) {
      if (provider.enLocal && !provider.aDomicile) setSelectedLieu("En Local");
      else if (!provider.enLocal && provider.aDomicile)
        setSelectedLieu("À Domicile");
      else setSelectedLieu(null);
    }
  }, [provider, initialSlot]);

  // Initialize activeDate
  useEffect(() => {
    if (availabilityData && availabilityData.length > 0 && !activeDate) {
      const firstAvailableDay = availabilityData.find((d) => d.slots.some((s: any) => s.available));
      if (firstAvailableDay) setActiveDate(firstAvailableDay.date);
      else setActiveDate(availabilityData[0].date);
    }
  }, [availabilityData, activeDate]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
      setCurrentStep(mode === "reschedule" && initialSelectedServiceId ? 1 : 0);
      setSelectedSlot(initialSlot || null);
      setSlotError(null);
      setDescription("");
      if (initialSelectedServiceId) {
        setSelectedServiceId(initialSelectedServiceId);
      } else {
        const defaultService = initialSlot && provider?.services
          ? provider.services.find((s: any) => !isServiceFullDay(s))
          : provider?.services?.[0];
        if (defaultService) setSelectedServiceId(defaultService.id);
      }
      if (initialSelectedLieu) setSelectedLieu(initialSelectedLieu);
    } else {
      setVisible(false);
    }
  }, [isOpen, initialSlot, provider]);

  if (!isOpen || !provider) return null;

  const goTo = (idx: number) => {
    setAnimDir(idx > currentStep ? "right" : "left");
    setCurrentStep(idx);
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedServiceId && selectedLieu) goTo(1);
    else if (currentStep === 1 && selectedSlot) goTo(2);
    else if (currentStep === 2) submitBooking();
  };

  const handlePrev = () => {
    if (currentStep > 0 && currentStep < 3) {
      if (mode === "reschedule" && currentStep === 1) return; // Prevent going back to step 0
      goTo(currentStep - 1);
    }
  };

  const submitBooking = async () => {
    if (!selectedSlot || !selectedServiceId || !selectedLieu) return;
    setIsBooking(true);
    try {
      const selectedService = provider.services.find(
        (s: any) => s.id === selectedServiceId,
      );
      const isFullDayService =
        Boolean(selectedService?.isFullDay) ||
        /jour/i.test(selectedService?.uniteDuree || "");

      const [dateStr, time] = selectedSlot.split(" ");
      const targetDate = isFullDayService
        ? new Date(`${dateStr}T00:00:00`)
        : new Date(`${dateStr}T${time}:00`);

      const endDate = new Date(targetDate);
      if (isFullDayService) {
        endDate.setHours(23, 59, 59, 999);
      } else {
        const duree = selectedService?.duree || 1;
        const unite = (selectedService?.uniteDuree || "HEURES").toUpperCase();
        if (unite.includes("JOUR")) {
          endDate.setDate(endDate.getDate() + duree);
        } else if (unite.includes("MINUTE")) {
          endDate.setMinutes(endDate.getMinutes() + duree);
        } else {
          endDate.setHours(endDate.getHours() + duree);
        }
      }

      if (mode === "reschedule" && rescheduleRdvId) {
        await acceptAlternativeDate(
          rescheduleRdvId,
          targetDate.toISOString(),
          endDate.toISOString()
        );
      } else {
        await createRendezVous({
          idPres: Number(provider.id),
          idServ: selectedServiceId,
          DateDebut: targetDate.toISOString(),
          DateFin: endDate.toISOString(),
          Lieu: selectedLieu,
        });
      }
      goTo(3); // Success step
    } catch (error: any) {
      console.error("Booking error:", error);
      const data = error.response?.data;
      if (data?.errors) {
        toast.error("Erreur de validation: " + JSON.stringify(data.errors));
      } else {
        const errorMsg = data?.detail 
          ? `${data.message || "Erreur"}: ${data.detail}` 
          : (data?.message || "Une erreur est survenue lors de la réservation.");
        toast.error(errorMsg);
      }
    } finally {
      setIsBooking(false);
    }
  };

  const handleSlotClick = (dayData: any, slotIdx: number, slotKey: string) => {
    setSlotError(null);
    const selectedService = provider.services.find(
      (s: any) => s.id === selectedServiceId,
    );
    const duree = selectedService?.duree || 1;
    const unite = (selectedService?.uniteDuree || "HEURES").toUpperCase();
    const durationInMinutes = unite.includes("HEURE") 
      ? duree * 60 
      : unite.includes("JOUR") 
        ? duree * 24 * 60 
        : duree;
    const slotsNeeded = Math.ceil(durationInMinutes / 60);

    if (selectedSlot === slotKey) {
      setSelectedSlot(null);
      return;
    }

    let isAvailable = true;
    for (let k = 0; k < slotsNeeded; k++) {
      const s = dayData.slots[slotIdx + k];
      if (!s || !s.available) {
        isAvailable = false;
        break;
      }
      if (k > 0) {
        const prev = dayData.slots[slotIdx + k - 1];
        const prevHour = parseInt(prev.time.split(":")[0], 10);
        const currHour = parseInt(s.time.split(":")[0], 10);
        if (currHour !== prevHour + 1) {
          isAvailable = false;
          break;
        }
      }
    }

    if (!isAvailable) {
      setSlotError(
        `Ce service nécessite ${slotsNeeded} heure(s) consécutive(s). Veuillez choisir un autre créneau.`,
      );
    } else {
      setSelectedSlot(slotKey);
    }
  };

  const isSlotSelected = (dDate: string, sIdx: number) => {
    if (!selectedSlot) return false;
    const [selDate, selTime] = selectedSlot.split(" ");
    if (selDate !== dDate) return false;

    const selDayData = availabilityData.find((d) => d.date === selDate);
    if (!selDayData) return false;

    const startIdx = selDayData.slots.findIndex((s: any) => s.time === selTime);
    if (startIdx === -1) return false;

    const selectedService = provider.services.find(
      (s: any) => s.id === selectedServiceId,
    );
    const duree = selectedService?.duree || 1;
    const unite = (selectedService?.uniteDuree || "HEURES").toUpperCase();
    const durationInMinutes = unite.includes("HEURE") 
      ? duree * 60 
      : unite.includes("JOUR") 
        ? duree * 24 * 60 
        : duree;
    const slotsNeeded = Math.ceil(durationInMinutes / 60);

    return sIdx >= startIdx && sIdx < startIdx + slotsNeeded;
  };

  // Steps definition for UI metadata
  const stepsMeta = [
    {
      id: 1,
      icon: Briefcase,
      color: "#0059B2",
      bgColor: "rgba(0,89,178,0.10)",
      title: "Choisissez le service",
      subtitle: "Prestation souhaitée",
    },
    {
      id: 2,
      icon: CalendarCheck,
      color: "#0891b2",
      bgColor: "rgba(8,145,178,0.10)",
      title: "Choisissez un créneau",
      subtitle: "Date et Heure",
    },
    {
      id: 3,
      icon: MessageSquare,
      color: "#7c3aed",
      bgColor: "rgba(124,58,237,0.10)",
      title: "Détails de la demande",
      subtitle: "Résumé",
    },
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
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        {/* Modal */}
        <div
          className="aide-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: 22,
            width: "100%",
            maxWidth: 520,
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.4), 0 0 40px rgba(0, 89, 178, 0.2)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #0059B2 0%, #1A6FD1 100%)",
              padding: "22px 24px 20px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  padding: 8,
                  display: "flex",
                }}
              >
                <CalendarCheck size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                  {mode === "reschedule" ? "Choisir une autre heure" : "Réservation en ligne"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                  Prendre rendez-vous avec {provider.name}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  marginLeft: "auto",
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: 8,
                  padding: 7,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
              >
                <X size={16} color="#fff" />
              </button>
            </div>

            {/* Step indicators (only show for first 3 steps) */}
            {currentStep < 3 && (
              <div style={{ display: "flex", gap: 6 }}>
                {stepsMeta.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      // Only allow clicking past steps
                      if (i < currentStep) goTo(i);
                    }}
                    style={{
                      flex: i === currentStep ? 3 : 1,
                      height: 5,
                      borderRadius: 999,
                      background:
                        i === currentStep ? "#fff" : "rgba(255,255,255,0.3)",
                      border: "none",
                      cursor: i < currentStep ? "pointer" : "default",
                      transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div
            className={`aide-step-${animDir}`}
            style={{ padding: "24px 24px 20px", minHeight: "350px" }}
          >
            {/* SUCCESS STEP */}
            {currentStep === 3 ? (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(5,150,105,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <CheckCircle2 size={32} color="#059669" />
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  Demande envoyée !
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                    marginBottom: 24,
                    lineHeight: 1.6,
                  }}
                >
                  Votre réservation a bien été transmise.{" "}
                  <strong>{provider.name}</strong> vous répondra très rapidement
                  sur votre espace client.
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    background: "#f3f4f6",
                    color: "#374151",
                    fontSize: 14,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#e5e7eb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f3f4f6")
                  }
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Meta Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: stepsMeta[currentStep].bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {React.createElement(stepsMeta[currentStep].icon, {
                      size: 20,
                      color: stepsMeta[currentStep].color,
                    })}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: stepsMeta[currentStep].color,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 1,
                      }}
                    >
                      Étape {stepsMeta[currentStep].id} sur 3 ·{" "}
                      {stepsMeta[currentStep].subtitle}
                    </div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {stepsMeta[currentStep].title}
                    </div>
                  </div>
                </div>

                {/* STEP 1: SERVICES & LIEU */}
                {currentStep === 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#374151",
                          marginBottom: 10,
                        }}
                      >
                        Sélectionnez un service :
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {provider.services
                          .filter((s: any) => !initialSlot || !isServiceFullDay(s))
                          .map((s: any) => (
                            <div
                              key={s.id}
                              onClick={() => setSelectedServiceId(s.id)}
                              style={{
                                padding: "14px",
                                borderRadius: 14,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                border: `2px solid ${selectedServiceId === s.id ? "#0059B2" : "#f3f4f6"}`,
                                background:
                                  selectedServiceId === s.id
                                    ? "rgba(0,89,178,0.04)"
                                    : "#fff",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color:
                                      selectedServiceId === s.id
                                        ? "#0059B2"
                                        : "#374151",
                                  }}
                                >
                                  {s.nom || s.name}
                                </span>
                                <span
                                  style={{
                                    fontWeight: 800,
                                    fontSize: 14,
                                    color: "#111827",
                                  }}
                                >
                                  {s.prix} MAD
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {provider.enLocal && provider.aDomicile && (
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#374151",
                            marginBottom: 10,
                          }}
                        >
                          Lieu du rendez-vous :
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={() => setSelectedLieu("En Local")}
                            style={{
                              flex: 1,
                              padding: "12px",
                              borderRadius: 12,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              border: `2px solid ${selectedLieu === "En Local" ? "#0059B2" : "#f3f4f6"}`,
                              background:
                                selectedLieu === "En Local"
                                  ? "rgba(0,89,178,0.04)"
                                  : "#fff",
                              color:
                                selectedLieu === "En Local"
                                  ? "#0059B2"
                                  : "#374151",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            🏢 Sur place
                          </button>
                          <button
                            onClick={() => setSelectedLieu("À Domicile")}
                            style={{
                              flex: 1,
                              padding: "12px",
                              borderRadius: 12,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              border: `2px solid ${selectedLieu === "À Domicile" ? "#7c3aed" : "#f3f4f6"}`,
                              background:
                                selectedLieu === "À Domicile"
                                  ? "rgba(124,58,237,0.04)"
                                  : "#fff",
                              color:
                                selectedLieu === "À Domicile"
                                  ? "#7c3aed"
                                  : "#374151",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            🏠 À Domicile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: AVAILABILITY GRID / DATE SELECTION */}
                {currentStep === 1 &&
                  (() => {
                    const selectedService = provider.services.find(
                      (s: any) => s.id === selectedServiceId,
                    );
                    const isDaily =
                      Boolean(selectedService?.isFullDay) ||
                      /jour/i.test(selectedService?.uniteDuree || "");
                    
                    const availableDays = availabilityData.filter((d) => {
                      if (isDaily) return d.isFullDayConfigured || d.slots.some((s: any) => s.available);
                      return d.slots.some((s: any) => s.available);
                    });

                    return (
                      <div
                        style={{
                          background: "rgba(8,145,178,0.03)",
                          borderRadius: 14,
                          padding: "16px",
                          border: "1px solid rgba(8,145,178,0.1)",
                        }}
                      >
                        {isDaily ? (
                          <div>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#374151",
                                marginBottom: 12,
                                textAlign: "center",
                              }}
                            >
                              Ce service se compte en Jours. Choisissez votre
                              date de début :
                            </p>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(80px, 1fr))",
                                gap: 8,
                              }}
                            >
                              {availableDays.map((d) => {
                                  const key = `${d.date} 00:00`;
                                  if (isSlotOccupied(d.date, "00:00")) return null;
                                  const isSelected = selectedSlot === key;
                                  return (
                                    <button
                                      key={d.date}
                                      onClick={() =>
                                        setSelectedSlot(isSelected ? null : key)
                                      }
                                      style={{
                                        padding: "12px 8px",
                                        borderRadius: 12,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        background: isSelected
                                          ? "linear-gradient(135deg, #0059B2, #1A6FD1)"
                                          : "#fff",
                                        color: isSelected ? "#fff" : "#0891b2",
                                        boxShadow: isSelected
                                          ? "0 4px 10px rgba(0,89,178,0.3)"
                                          : "0 1px 2px rgba(0,0,0,0.05)",
                                        border: isSelected
                                          ? "none"
                                          : "1px solid rgba(8,145,178,0.2)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 2
                                      }}
                                    >
                                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", opacity: isSelected ? 0.9 : 0.6 }}>{d.day.split(' ')[0]}</span>
                                      <span style={{ fontSize: 14, fontWeight: 800 }}>{d.day.split(' ')[1]}</span>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#374151",
                                marginBottom: 16,
                                textAlign: "center",
                              }}
                            >
                              Choisissez une date et une heure :
                            </p>
                            
                            {/* Horizontal scroll of days */}
                            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, margin: "0 -4px", padding: "4px" }} className="hide-scrollbar">
                              <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                              {availableDays.map((d) => {
                                const isActive = activeDate === d.date;
                                return (
                                  <button
                                    key={d.date}
                                    onClick={() => setActiveDate(d.date)}
                                    style={{
                                      minWidth: 72,
                                      padding: "10px 8px",
                                      borderRadius: 12,
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                      background: isActive ? "linear-gradient(135deg, #0059B2, #1A6FD1)" : "#fff",
                                      color: isActive ? "#fff" : "#374151",
                                      boxShadow: isActive ? "0 4px 10px rgba(0,89,178,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
                                      border: isActive ? "none" : "1px solid rgba(0,0,0,0.05)",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: 2
                                    }}
                                  >
                                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", opacity: isActive ? 0.9 : 0.5 }}>{d.day.split(' ')[0]}</span>
                                    <span style={{ fontSize: 15, fontWeight: 900 }}>{d.day.split(' ')[1]}</span>
                                  </button>
                                );
                              })}
                              {availableDays.length === 0 && (
                                <div style={{ fontSize: 13, color: "#6b7280", textAlign: "center", width: "100%", padding: "10px 0" }}>
                                  Aucun jour disponible
                                </div>
                              )}
                            </div>

                            {/* Grid of slots for the selected day */}
                            <div style={{ marginTop: 12 }}>
                              {activeDate && (() => {
                                const activeDayData = availabilityData.find((d) => d.date === activeDate);
                                if (!activeDayData) return null;
                                
                                return (
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8 }}>
                                    {activeDayData.slots.map((slot: any, slotIdx: number) => {
                                      if (!slot.available) return null;
                                      if (isSlotOccupied(activeDayData.date, slot.time)) return null;
                                      
                                      // Hide past slots for hourly services
                                      const selectedService = provider?.services?.find((s: any) => s.id === selectedServiceId);
                                      const isDailyService = Boolean(selectedService?.isFullDay) || /jour/i.test(selectedService?.uniteDuree || "");
                                      if (!isDailyService && slot.time) {
                                        const [hours, minutes] = slot.time.split(':').map(Number);
                                        const slotDateTime = new Date(activeDayData.date);
                                        slotDateTime.setHours(hours, minutes, 0, 0);
                                        
                                        if (slotDateTime < new Date()) return null;
                                      }

                                      const key = `${activeDayData.date} ${slot.time}`;
                                      const isSelected = isSlotSelected(activeDayData.date, slotIdx);
                                      return (
                                        <button
                                          key={key}
                                          onClick={() => handleSlotClick(activeDayData, slotIdx, key)}
                                          style={{
                                            padding: "10px 0",
                                            borderRadius: 10,
                                            fontSize: 13,
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            background: isSelected ? "linear-gradient(135deg, #0059B2, #1A6FD1)" : "#fff",
                                            color: isSelected ? "#fff" : "#0891b2",
                                            boxShadow: isSelected ? "0 4px 10px rgba(0,89,178,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
                                            border: isSelected ? "none" : "1px solid rgba(8,145,178,0.2)",
                                          }}
                                          onMouseEnter={(e) => {
                                            if (!isSelected) {
                                              e.currentTarget.style.background = "#0891b2";
                                              e.currentTarget.style.color = "#fff";
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!isSelected) {
                                              e.currentTarget.style.background = "#fff";
                                              e.currentTarget.style.color = "#0891b2";
                                            }
                                          }}
                                        >
                                          {slot.time}
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                        {slotError && (
                          <div
                            style={{
                              marginTop: 16,
                              padding: "10px 14px",
                              borderRadius: 8,
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              fontSize: 13,
                              fontWeight: 600,
                              textAlign: "center",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                          >
                            {slotError}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {/* STEP 3: DETAILS */}
                {currentStep === 2 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(124,58,237,0.05)",
                        borderRadius: 14,
                        padding: "16px",
                        border: "1px solid rgba(124,58,237,0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#111827",
                          marginBottom: 10,
                        }}
                      >
                        Récapitulatif
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                          paddingBottom: 8,
                          borderBottom: "1px dashed rgba(124,58,237,0.2)",
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#6b7280" }}>
                          Service
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {provider.services.find(
                            (s: any) => s.id === selectedServiceId,
                          )?.nom ||
                            provider.services.find(
                              (s: any) => s.id === selectedServiceId,
                            )?.name}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#6b7280" }}>
                          Lieu
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {selectedLieu === "À Domicile"
                            ? "🏠 À domicile"
                            : "🏢 Sur place"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: "1px dashed rgba(124,58,237,0.2)",
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#6b7280" }}>
                          Créneau
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#7c3aed",
                          }}
                        >
                          {selectedSlot}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#374151",
                          marginBottom: 8,
                        }}
                      >
                        Message pour {provider.name} (Optionnel)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Précisez votre besoin, vos attentes..."
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: 12,
                          border: "1.5px solid #e5e7eb",
                          fontSize: 13,
                          fontFamily: "inherit",
                          resize: "none",
                          height: 100,
                          outline: "none",
                          transition: "border 0.2s",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = "#7c3aed")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "#e5e7eb")
                        }
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer navigation (Only for steps 1-3) */}
          {currentStep < 3 && (
            <div
              style={{
                padding: "16px 24px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #f3f4f6",
                background: "#fafafa",
              }}
            >
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                  color: currentStep === 0 ? "#d1d5db" : "#374151",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: currentStep === 0 ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                <ChevronLeft size={16} /> Retour
              </button>

              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 &&
                    (!selectedServiceId || !selectedLieu)) ||
                  (currentStep === 1 && !selectedSlot) ||
                  isBooking
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    isBooking ||
                    (currentStep === 0 &&
                      (!selectedServiceId || !selectedLieu)) ||
                    (currentStep === 1 && !selectedSlot)
                      ? "#d1d5db"
                      : stepsMeta[currentStep].color,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor:
                    isBooking ||
                    (currentStep === 0 &&
                      (!selectedServiceId || !selectedLieu)) ||
                    (currentStep === 1 && !selectedSlot)
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    isBooking ||
                    (currentStep === 0 &&
                      (!selectedServiceId || !selectedLieu)) ||
                    (currentStep === 1 && !selectedSlot)
                      ? "none"
                      : `0 4px 14px ${stepsMeta[currentStep].color}50`,
                }}
              >
                {isBooking ? (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid #fff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : currentStep === 2 ? (
                  "Confirmer"
                ) : (
                  "Suivant"
                )}
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
