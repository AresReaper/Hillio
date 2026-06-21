import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { Trip } from '../types';

interface TripProgressProps {
  trip: Trip;
  showLabels?: boolean;
}

export default function TripProgress({ trip, showLabels = true }: TripProgressProps) {
  const [percent, setPercent] = useState<number>(0);
  const [timeLabel, setTimeLabel] = useState<string>('');

  useEffect(() => {
    if (!trip.createdAt || !trip.tripDate) {
      setPercent(0);
      setTimeLabel('Awaiting Schedule');
      return;
    }

    const start = trip.createdAt.toDate ? trip.createdAt.toDate().getTime() : new Date().getTime();
    const end = trip.tripDate.toDate ? trip.tripDate.toDate().getTime() : new Date().getTime();
    const now = Date.now();

    if (now >= end) {
      setPercent(100);
      setTimeLabel('Trip In Progress / Completed');
    } else if (now <= start) {
      setPercent(0);
      setTimeLabel('0% Time Elapsed');
    } else {
      const duration = end - start;
      const elapsed = now - start;
      const pct = Math.min(100, Math.max(0, Math.round((elapsed / duration) * 100)));
      setPercent(pct);

      // Human-readable remaining time
      const remainingMs = end - now;
      const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (remainingDays > 0) {
        setTimeLabel(`${pct}% Time Elapsed (${remainingDays}d ${remainingHours}h remaining)`);
      } else if (remainingHours > 0) {
        setTimeLabel(`${pct}% Time Elapsed (${remainingHours}h remaining)`);
      } else {
        const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLabel(`${pct}% Time Elapsed (${remainingMinutes}m remaining)`);
      }
    }
  }, [trip]);

  if (!trip.tripDate) {
    return null;
  }

  return (
    <div id={`trip-progress-${trip.id}`} className="space-y-1.5 w-full">
      {showLabels && (
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-white/40 uppercase">
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-brand-primary/60" />
            <span>Time Progress</span>
          </span>
          <span className="font-bold text-brand-primary">{percent}%</span>
        </div>
      )}
      
      {/* Outer linear tracking track */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.03]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-gradient-to-r from-[#bbff4d]/40 to-[#bbff4d] rounded-full relative"
        >
          {/* Subtle light glisten on the progress bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[pulse_2s_infinite]" />
        </motion.div>
      </div>

      {showLabels && timeLabel && (
        <p className="text-[9px] font-mono font-medium text-white/30 truncate mt-0.5">
          {timeLabel}
        </p>
      )}
    </div>
  );
}
