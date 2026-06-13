import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

interface TestimonialCarouselProps {
  testimonials: TestimonialItem[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [index]);

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const current = testimonials[index];

  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center relative overflow-hidden">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[#1A6FD1]/10 pointer-events-none">
        <Quote className="w-36 h-36 rotate-180" />
      </div>

      <div className="relative h-[320px] sm:h-[260px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute w-full flex flex-col items-center px-4"
          >
            <div className="flex items-center gap-1 mb-4 justify-center">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#1A6FD1] text-[#1A6FD1]" />
              ))}
            </div>

            <p className="text-lg sm:text-xl md:text-2xl font-medium italic text-slate-800 dark:text-[#e2e8f0] leading-relaxed max-w-2xl font-poppins">
              "{current.quote}"
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_8px_rgba(26,111,209,0.3)]">
                {current.avatar}
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {current.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#8892a4] mt-0.5">
                  {current.role}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={handlePrev}
          aria-label="Previous testimonial"
          className="h-10 w-10 rounded-full border border-slate-200 dark:border-[#2d3148] bg-white dark:bg-[#1a1d27] text-slate-700 dark:text-[#e2e8f0] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#2d3148] transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-[#1A6FD1]" : "w-2 bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next testimonial"
          className="h-10 w-10 rounded-full border border-slate-200 dark:border-[#2d3148] bg-white dark:bg-[#1a1d27] text-slate-700 dark:text-[#e2e8f0] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#2d3148] transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
