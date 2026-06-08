import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Moon, Sun, ChevronDown, Calendar, 
  Clock, CheckCircle, XCircle, Activity, 
  DollarSign, Star, CalendarDays, User, Menu,
  ArrowRight
} from 'lucide-react';

type BookingStatus = 'Upcoming' | 'Pending' | 'Completed' | 'Cancelled';

interface Booking {
  id: string;
  provider: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  amount: string;
}

const Avatar = ({ src, name, className = "" }: { src?: string, name: string, className?: string }) => {
  const [error, setError] = useState(false);
  // Using DiceBear Initials API as requested for a beautiful fallback
  const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1e293b,0f172a&textColor=ffffff`;
  
  return (
    <img 
      src={error || !src ? fallback : src} 
      alt={name}
      onError={() => setError(true)}
      className={`object-cover rounded-full ${className}`}
    />
  );
};

// Mock Data
const TABS = ['Dashboard', 'Appointments', 'Browse Services', 'Creator Profile'];
const CATEGORIES = ['Dentists', 'Plumbers', 'Freelancers', 'Wellness', 'Tutors'];

const PROVIDERS = [
  { id: 1, name: 'Dr. Sarah Jenkins', category: 'Dentists', rating: 4.9, reviews: 128, popular: true, img: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 2, name: 'Mike Richards', category: 'Plumbers', rating: 4.7, reviews: 84, popular: false, img: 'https://i.pravatar.cc/150?u=mike' },
  { id: 3, name: 'Elena Rodriguez', category: 'Wellness', rating: 5.0, reviews: 210, popular: true, img: 'invalid-link.jpg' }, // intentional broken link to test fallback
  { id: 4, name: 'David Kim', category: 'Tutors', rating: 4.8, reviews: 92, popular: false, img: 'https://i.pravatar.cc/150?u=david' },
];

const BOOKINGS: Booking[] = [
  { id: 'B-1042', provider: 'Dr. Sarah Jenkins', service: 'Dental Checkup', date: 'Oct 24, 2024', time: '10:00 AM', status: 'Upcoming', amount: '$150' },
  { id: 'B-1041', provider: 'Elena Rodriguez', service: 'Deep Tissue Massage', date: 'Oct 25, 2024', time: '02:30 PM', status: 'Pending', amount: '$85' },
  { id: 'B-1040', provider: 'Mike Richards', service: 'Pipe Repair', date: 'Oct 20, 2024', time: '09:00 AM', status: 'Completed', amount: '$200' },
  { id: 'B-1039', provider: 'Alex Chen', service: 'Web Development', date: 'Oct 15, 2024', time: '11:00 AM', status: 'Cancelled', amount: '$500' },
];

const METRICS = [
  { id: 'Upcoming', label: 'Upcoming Scheduled', value: 3, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 'Pending', label: 'Pending Approval', value: 1, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { id: 'Cancelled', label: 'Cancelled/Past', value: 24, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  { id: 'All', label: 'Total Valuation', value: '$4,250', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
];

export default function ServiceBookingDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeCategory, setActiveCategory] = useState('Dentists');
  const [metricFilter, setMetricFilter] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = BOOKINGS.filter(b => 
    metricFilter === 'All' || 
    b.status === metricFilter || 
    (metricFilter === 'Cancelled' && (b.status === 'Cancelled' || b.status === 'Completed'))
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 selection:bg-indigo-500/30">
        
        {/* Custom Ultra-Thin Scrollbar Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.2);
            border-radius: 20px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(51, 65, 85, 0.5);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.4);
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(71, 85, 105, 0.8);
          }
        `}} />

        {/* STADIUM CAPSULE TOP NAVBAR */}
        <nav className="sticky top-0 z-40 px-4 py-4 pt-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-inner">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-lg mr-2 font-[Space_Grotesk]">Bookify</span>
            </div>

            {/* Stadium Capsule Tabs */}
            <div className="hidden md:flex items-center p-1.5 rounded-full backdrop-blur-md bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm relative">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-2 text-sm font-medium transition-colors z-10 ${
                    activeTab === tab 
                      ? 'text-indigo-900 dark:text-white' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_1px_4px_-1px_rgba(0,0,0,0.02)] dark:shadow-none border border-slate-200/50 dark:border-slate-700/50"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-full backdrop-blur-md bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-slate-400 hover:text-slate-200" /> : <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900" />}
              </button>
              <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full backdrop-blur-md bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors group">
                <Avatar name="Alex Morgan" src="https://i.pravatar.cc/150?u=alex" className="w-8 h-8 border border-white dark:border-slate-700 shadow-sm" />
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
              </div>
            </div>

          </div>
        </nav>

        <main className="pb-20 px-4 max-w-6xl mx-auto space-y-10 pt-4">
          
          {/* HERO SECTION */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800/80 shadow-sm p-8 md:p-12">
            {/* Ambient Soft Neon Orbs */}
            <div className="absolute top-[-20%] left-[10%] w-64 h-64 bg-purple-400/20 dark:bg-indigo-500/15 rounded-full blur-3xl animate-pulse mix-blend-multiply dark:mix-blend-lighten" />
            <div className="absolute bottom-[-20%] right-[10%] w-72 h-72 bg-indigo-400/20 dark:bg-purple-500/15 rounded-full blur-3xl animate-pulse mix-blend-multiply dark:mix-blend-lighten" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-3">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white font-[Space_Grotesk]"
                >
                  Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Alex</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-slate-600 dark:text-slate-400 max-w-lg"
                >
                  You have <span className="font-semibold text-slate-800 dark:text-slate-200">3 upcoming appointments</span> this week. Let's get things done.
                </motion.p>
              </div>

              {/* Status Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-w-[240px]"
              >
                <div className="relative flex h-12 w-12 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping"></span>
                  <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">Account Status</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Active & Verified</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* HIGH-FIDELITY STATS METRIC GRID */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {METRICS.map((metric, i) => {
              const Icon = metric.icon;
              const isActive = metricFilter === metric.id;
              
              return (
                <motion.button
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => setMetricFilter(isActive ? 'All' : metric.id)}
                  className={`group relative overflow-hidden text-left p-6 rounded-2xl transition-all duration-300 border ${
                    isActive 
                      ? `bg-white dark:bg-slate-800 ${metric.border} shadow-lg ring-1 ring-inset ${metric.color.replace('text-', 'ring-')}` 
                      : 'backdrop-blur-sm bg-white/40 dark:bg-slate-900/35 border-slate-200 dark:border-slate-800/80 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${metric.bg} ${metric.color} transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight font-[Space_Grotesk]">{metric.value}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{metric.label}</p>
                </motion.button>
              );
            })}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-10">
            
            {/* MAIN CONTENT AREA */}
            <div className="xl:col-span-2 space-y-10">
              
              {/* CATEGORY SCROLL & RECOMMENDED EXPERTS */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight font-[Space_Grotesk]">Browse Services</h2>
                  <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">View All Directory</button>
                </div>
                
                {/* Horizontal Category Matrix */}
                <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`whitespace-nowrap px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 border ${
                        activeCategory === category
                          ? 'bg-[#1A6FD1] text-white border-[#1A6FD1] shadow-[0_4px_14px_0_rgba(26,111,209,0.39)]'
                          : 'backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Recommended Experts Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <AnimatePresence mode="popLayout">
                    {PROVIDERS.filter(p => activeCategory === 'All' || p.category === activeCategory || activeCategory === 'Dentists').map(provider => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -6 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        key={provider.id}
                        className="relative p-5 rounded-2xl backdrop-blur-sm bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer group transition-shadow"
                      >
                        {provider.popular && (
                          <div className="absolute top-4 right-4 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-800/90 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 border border-slate-200/80 dark:border-slate-700/50 shadow-sm flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Popular Choice
                          </div>
                        )}
                        <div className="flex gap-4 items-center">
                          <Avatar src={provider.img} name={provider.name} className="w-16 h-16 shadow-sm border-2 border-white dark:border-slate-800" />
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">{provider.name}</h4>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{provider.category}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {provider.rating}
                              </div>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="text-slate-500 font-medium">{provider.reviews} reviews</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>

              {/* BOOKING LEDGER */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight font-[Space_Grotesk]">Recent Appointments</h2>
                  <button className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700">
                    <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm bg-white dark:bg-slate-900/50 shadow-sm">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80">
                          <th className="py-4 px-6 text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Service & Provider</th>
                          <th className="py-4 px-6 text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Date & Time</th>
                          <th className="py-4 px-6 text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                          <th className="py-4 px-6 text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredBookings.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">No records found matching this filter.</td>
                            </tr>
                          ) : filteredBookings.map((booking, idx) => (
                            <motion.tr 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              key={booking.id} 
                              className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <td className="py-4 px-6">
                                <div className="font-bold text-slate-900 dark:text-white">{booking.service}</div>
                                <div className="text-sm font-medium text-slate-500 mt-0.5">{booking.provider}</div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-slate-900 dark:text-slate-200 text-sm font-semibold">{booking.date}</div>
                                <div className="text-sm font-medium text-slate-500 mt-0.5">{booking.time}</div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                                  booking.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                                  booking.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                                  booking.status === 'Upcoming' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                                  'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                }`}>
                                  {booking.status === 'Completed' && <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                  {booking.status === 'Pending' && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                                  {booking.status === 'Upcoming' && <CalendarDays className="w-3.5 h-3.5 mr-1.5" />}
                                  {booking.status === 'Cancelled' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                                  {booking.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button className="p-2.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 translate-x-2 group-hover:translate-x-0 inline-flex">
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

            </div>

            {/* SIDEBAR WIDGETS */}
            <div className="space-y-6">
              <div className="backdrop-blur-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm sticky top-28">
                <h3 className="font-bold text-xl mb-6 tracking-tight font-[Space_Grotesk]">Quick Actions</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-bold transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-lg hover:-translate-y-0.5">
                    <Calendar className="w-4 h-4" /> Book New Service
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 py-3.5 rounded-2xl font-bold transition-all hover:shadow-md hover:-translate-y-0.5">
                    <User className="w-4 h-4" /> Update Profile
                  </button>
                </div>
                
                <hr className="border-slate-200 dark:border-slate-800/80 my-6" />
                
                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-5">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Need assistance?</h4>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-4">Our support team is available 24/7 to help you with your bookings.</p>
                  <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Contact Support &rarr;</button>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* BOOKING DETAILS MODAL OVERLAY */}
        <AnimatePresence>
          {selectedBooking && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-50"
                onClick={() => setSelectedBooking(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
              >
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-xl tracking-tight font-[Space_Grotesk]">Appointment Details</h3>
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    {/* Provider Info */}
                    <div className="flex items-center gap-4">
                      <Avatar name={selectedBooking.provider} className="w-16 h-16 border-2 border-slate-100 dark:border-slate-800" />
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Provider</p>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBooking.provider}</h4>
                      </div>
                    </div>
                    
                    {/* Time Slot Selection Visualization */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                          <CalendarDays className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Date</span>
                        </div>
                        <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{selectedBooking.date}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                          <Clock className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Time</span>
                        </div>
                        <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{selectedBooking.time}</p>
                      </div>
                    </div>

                    {/* Active Text Instructions & Notes */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900 dark:text-slate-300">Add Notes for Provider</label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">These notes will be shared directly with your provider before they arrive.</p>
                      <textarea 
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none h-28 custom-scrollbar shadow-inner"
                        placeholder="E.g., Please ring the doorbell upon arrival. The gate code is 1234..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      Close
                    </button>
                    <button className="px-6 py-3 rounded-xl font-bold bg-[#1A6FD1] hover:bg-blue-600 text-white shadow-[0_4px_14px_0_rgba(26,111,209,0.39)] transition-all hover:shadow-lg hover:-translate-y-0.5">
                      Save Details
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
