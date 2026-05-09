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
  const displayStatus = isBoarded ? 'Checked In' : 'Ready to Board';

  return (
    <div id={id} className="relative rounded-[32px] overflow-hidden text-night-ink shadow-2xl z-10 w-full max-w-[400px] font-sans mx-auto block group bg-white border border-slate-200">
      
      {/* Ticket Cutouts */}
      <div className="absolute top-[65%] -left-4 w-8 h-8 bg-slate-100 rounded-full z-20 shadow-inner" />
      <div className="absolute top-[65%] -right-4 w-8 h-8 bg-slate-100 rounded-full z-20 shadow-inner" />
      
      {/* Top Section */}
      <div className="relative z-10 p-8 pb-10 bg-gradient-to-br from-[#064e3b] via-[#1e3a8a] to-[#0f172a] text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,rgba(187,255,77,0.4),transparent_70%)]" />
        
        {/* Top Branding Section */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-night-ink shadow-lg shadow-brand-primary/20">
               <Mountain size={20} />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-white">Hillo</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
            BOARDING PASS
          </div>
        </div>

        {/* Passenger Information */}
        <div className="mb-8 relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary opacity-80 mb-2">Primary Traveler</div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-display font-extrabold uppercase tracking-tight text-white mb-6"
          >
            {user.name}
          </motion.h2>
          
          <div className="flex gap-4">
             <div className="flex-1">
                <div className="text-[9px] text-white/50 uppercase mb-1 font-bold">Departure</div>
                <div className="text-xs font-black uppercase tracking-widest truncate">{trip?.name}</div>
             </div>
             <div className="flex-1 text-right">
                <div className="text-[9px] text-white/50 uppercase mb-1 font-bold">Destination</div>
                <div className="text-xs font-black uppercase tracking-widest truncate">{trip?.destination || "Terminal"}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Dashed Divider Line */}
      <div className="w-full flex items-center justify-center absolute top-[65%] z-20">
         <div className="w-[85%] border-t-[3px] border-dashed border-slate-200" />
      </div>

      {/* Bottom QR Section */}
      <div className="pt-10 pb-8 px-8 bg-[#f8fafc] text-night-ink relative">
        <div className="flex gap-4 mb-6">
           <div className="flex-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Gate Status</div>
              <div className={cn(
                 "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                 isBoarded ? "bg-emerald-100 text-emerald-700" : "bg-brand-primary/20 text-brand-primary"
              )}>
                 {displayStatus}
              </div>
           </div>
           <div className="flex-1 text-right">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Ref ID</div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-800">
                 TRP-{user.id?.substring(0, 6) || "HILLO"}
              </div>
           </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
             {qrUrl ? (
                <img src={qrUrl} alt="QR Code" className="w-40 h-40" referrerPolicy="no-referrer" />
             ) : trip?.id && user.id ? (
                <QRCode value={JSON.stringify({ t: trip.id, u: user.id })} size={160} fgColor="#020617" />
             ) : (
               <div className="w-40 h-40 bg-slate-100 rounded-2xl animate-pulse" />
             )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-1">
             <QrIcon size={14} />
             SCAN TO BOARD
          </div>
        </div>

        {/* Branding Footer */}
        <div className="mt-8 text-center flex items-center justify-center gap-3 opacity-30">
           <span className="h-[1px] w-8 bg-slate-900" />
           <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-900">Powered by Hillo</span>
           <span className="h-[1px] w-8 bg-slate-900" />
        </div>
      </div>
    </div>
  );
}

