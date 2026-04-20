import { Ticket as TicketIcon, Calendar, User as UserIcon, QrCode as QrIcon, CheckCircle2, MapPin, Mountain } from 'lucide-react';
import { User, Trip } from '../types';
import { cn } from '../lib/utils';
import QRCode from 'react-qr-code';
import { motion } from 'motion/react';

interface SmartTicketProps {
  user: User;
  trip: Trip | null;
  qrUrl: string;
  id?: string;
}

export default function SmartTicket({ user, trip, qrUrl, id }: SmartTicketProps) {
  const isBoarded = user.status === 'Boarded';

  return (
    <div id={id} className="relative rounded-[40px] overflow-hidden text-white shadow-2xl z-10 w-full max-w-[400px] font-sans mx-auto block group">
      {/* Hillo Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#1e3a8a] to-[#0f172a] z-0">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,rgba(187,255,77,0.4),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-8">
           <div className="w-full flex items-center justify-center opacity-10 pointer-events-none">
              <Mountain size={140} strokeWidth={1} />
           </div>
        </div>
      </div>

      <div className="relative z-10 p-8">
        {/* Top Branding Section */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#bbff4d] rounded-lg flex items-center justify-center text-slate-900 shadow-lg shadow-[#bbff4d]/20">
               <Mountain size={20} />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-white">Hillo</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#bbff4d]">
            Passengers
          </div>
        </div>

        {/* Passenger Information */}
        <div className="mb-10">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#bbff4d] opacity-80 mb-2">Primary Traveler</div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-display font-extrabold uppercase tracking-tight text-white"
          >
            {user.name}
          </motion.h2>
        </div>

        {/* Glass Journey Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 shadow-xl">
           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <span className="text-[#bbff4d]">Origin</span>
              <span className="text-white/40">En Route</span>
              <span className="text-[#bbff4d]">Arrival</span>
           </div>

           <div className="relative h-1 w-full bg-white/5 rounded-full mb-8">
              <div className="absolute inset-0 border-t border-dashed border-white/20 h-0 top-[40%]" />
              
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#bbff4d] shadow-[0_0_15px_rgba(187,255,77,0.5)] z-20" />
              
              <motion.div 
                initial={false}
                animate={{ 
                    left: isBoarded ? '100%' : '50%',
                    x: isBoarded ? '-100%' : '-50%'
                }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                className="absolute top-1/2 -translate-y-1/2 text-2xl z-30 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              >
                🚌
              </motion.div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/20 bg-[#161917] z-20" />
           </div>

           <div className="flex justify-between items-end">
              <div className="max-w-[120px]">
                 <div className="text-[9px] text-white/40 uppercase mb-1">Departure</div>
                 <div className="text-xs font-black uppercase tracking-widest truncate">{trip?.name}</div>
              </div>
              <div className="text-right max-w-[120px]">
                 <div className="text-[9px] text-white/40 uppercase mb-1">Destination</div>
                 <div className="text-xs font-black uppercase tracking-widest truncate">{trip?.destination || "Terminal"}</div>
              </div>
           </div>
        </div>

        {/* Status Section */}
        <div className="flex gap-4 mb-8">
           <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-2">Gate Status</div>
              <div className={cn(
                 "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                 isBoarded ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
              )}>
                 {user.status}
              </div>
           </div>
           <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4">
              <div className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-2">Ref ID</div>
              <div className="text-xs font-black uppercase tracking-widest text-white">
                 TRP-{user.id?.substring(0, 6) || "HILLO"}
              </div>
           </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-[32px] p-8 flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#bbff4d]/10 rounded-full blur-2xl -mr-10 -mt-10" />
          
          <div className="relative">
             {qrUrl ? (
                <img src={qrUrl} alt="QR Code" className="w-48 h-48" referrerPolicy="no-referrer" />
             ) : trip?.id && user.id ? (
                <QRCode value={JSON.stringify({ t: trip.id, u: user.id })} size={192} fgColor="#0f172a" />
             ) : (
               <div className="w-48 h-48 bg-slate-100 rounded-2xl animate-pulse" />
             )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
             <QrIcon size={14} />
             Scan at entry
          </div>
        </div>

        {/* Branding Footer */}
        <div className="mt-10 text-center flex items-center justify-center gap-3 opacity-20">
           <span className="h-[1px] w-8 bg-white" />
           <span className="text-[9px] font-black uppercase tracking-[0.4em]">Hillo • Trip Pass</span>
           <span className="h-[1px] w-8 bg-white" />
        </div>
      </div>
    </div>
  );
}

