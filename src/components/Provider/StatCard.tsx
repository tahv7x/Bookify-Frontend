import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string | number;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  iconBgColor,
  iconColor,
  label,
  value,
  delay = 0
}) => {
  return (
    <div 
      className="stat-card bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all"
      style={{ 
        animationDelay: `${delay}s`,
        opacity: 0 
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center transition-transform hover:scale-110`}>
          <Icon className={iconColor} size={24} />
        </div>
      </div>
      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</p>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card {
          animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stat-card:hover {
          transform: translateY(-8px);
        }

        @media (max-width: 768px) {
          .stat-card:hover {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
};

export default StatsCard;