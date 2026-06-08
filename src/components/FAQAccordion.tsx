import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: string;
  icon: React.ComponentType<any>;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center mb-12">
        <p className="text-sm font-semibold text-[#1A6FD1] uppercase tracking-widest mb-3">
          FAQ
        </p>
        <h2 className="font-poppins font-bold text-3xl md:text-4xl text-slate-900 dark:text-white">
          Questions fréquemment posées
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isOpen = openId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-[#2d3148]/20 focus:outline-none"
              >
                <div className="flex items-center gap-3.5 pr-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A6FD1]/10 dark:bg-[#1A6FD1]/20 flex items-center justify-center text-[#1A6FD1] shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white font-poppins">
                    {item.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-500 dark:text-[#8892a4]"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { duration: 0.25 }, opacity: { duration: 0.15 } }}
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-[#2d3148]/40">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8892a4] leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
