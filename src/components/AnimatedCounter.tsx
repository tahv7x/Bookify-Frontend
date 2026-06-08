import React from "react";
import { motion } from "framer-motion";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";

interface StatItem {
  icon: React.ComponentType<any>;
  value: number;
  suffix: string;
  label: string;
}

interface AnimatedCounterProps {
  stats: StatItem[];
}

function Counter({ value }: { value: number }) {
  const animatedValue = useAnimatedNumber(value, 2.5);
  return <motion.span>{animatedValue}</motion.span>;
}

export default function AnimatedCounter({ stats }: AnimatedCounterProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="relative p-6 rounded-3xl border border-white/60 dark:border-[#2d3148] bg-white/70 dark:bg-[#1a1d27]/70 backdrop-blur-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(26,111,209,0.15)] transition-all duration-300 overflow-hidden"
          >
            {/* Visual gradient orb in background */}
            <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-[#1A6FD1]/10 blur-xl pointer-events-none" />

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#1A6FD1]/10 dark:bg-[#1A6FD1]/20 rounded-2xl flex items-center justify-center text-[#1A6FD1]">
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-extrabold tracking-tight font-poppins text-slate-900 dark:text-white flex items-baseline">
                <Counter value={stat.value} />
                <span className="text-[#1A6FD1] ml-0.5">{stat.suffix}</span>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-[#8892a4] leading-relaxed">
              {stat.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
