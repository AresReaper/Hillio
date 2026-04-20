import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Award, Download, Mountain, MapPin, Calendar } from 'lucide-react';
import { User, Trip } from '../types';
import { motion } from 'motion/react';

interface DigitalSouvenirProps {
  user: User;
  trip: Trip;
}

export default function DigitalSouvenir({ user, trip }: DigitalSouvenirProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        width: 1080,
        height: 1920, // Instagram Story size
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '1080px',
          height: '1920px',
        }
      });

      const link = document.createElement('a');
      link.download = `${user.name.replace(/\s+/g, '_')}_HillTrip_Souvenir.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating souvenir:', error);
      alert('Failed to generate the souvenir. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const tripDate = trip.tripDate ? trip.tripDate.toDate().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'A memorable journey';

  return (
      <div className="w-full max-w-sm mx-auto mt-12 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#bbff4d] mb-2">Trip Souvenir</h2>
          <p className="text-white/60 text-sm">Your digital certificate to share with friends!</p>
        </div>

        {/* Preview Container (Scaled down for UI) */}
        <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden border-2 border-white/5 shadow-2xl shadow-[#bbff4d]/10 mb-6 group">
          
          {/* The actual certificate that gets captured (hidden but rendered at full size) */}
          <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden">
            <div 
              ref={certificateRef}
              className="relative bg-[#161917] flex flex-col items-center justify-center text-center p-16"
              style={{ width: '1080px', height: '1920px' }}
            >
              {/* Background Image & Gradient */}
              <div className="absolute inset-0 z-0 bg-[#161917]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#161917]/90 via-[#161917]/80 to-[#161917]/95" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#bbff4d15,transparent_60%)]" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center w-full max-w-3xl bg-[#2A2E2B] p-16 border border-white/5 rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.02)]">
                <div className="w-32 h-32 bg-[#bbff4d]/10 rounded-full flex items-center justify-center mb-12 border-2 border-[#bbff4d]/30">
                  <Award size={64} className="text-[#bbff4d]" />
                </div>

                <div className="text-[#bbff4d] font-bold tracking-[0.3em] uppercase text-2xl mb-4">
                  Certificate of Completion
                </div>
                
                <h1 className="text-white text-5xl font-light mb-16">
                  This certifies that
                </h1>

                <div className="text-white text-8xl font-bold mb-16 tracking-tight">
                  {user.name}
                </div>

                <div className="text-white/80 text-4xl font-light mb-12">
                  has successfully completed the journey to
                </div>

                <div className="text-[#bbff4d] text-6xl font-bold mb-16 flex items-center gap-6">
                  <Mountain size={56} />
                  {trip.destination || trip.name}
                </div>

                <div className="flex items-center gap-12 text-white/60 text-3xl">
                  <div className="flex items-center gap-4">
                    <Calendar size={32} />
                    {tripDate}
                  </div>
                </div>

                {/* Footer Logo */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-4 text-white/40 text-2xl font-bold tracking-widest">
                  <Mountain size={32} />
                  HILLTRIP MANAGER
                </div>
              </div>
            </div>
          </div>

          {/* Scaled Preview for the UI */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="relative bg-[#161917] flex flex-col items-center justify-center text-center p-4 h-full"
            >
              <div className="absolute inset-0 z-0 bg-[#161917]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#161917]/90 via-[#161917]/80 to-[#161917]/95" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#bbff4d15,transparent_60%)]" />
              </div>

              <div className="relative z-10 flex flex-col items-center w-full bg-[#2A2E2B] p-6 border border-white/5 rounded-3xl">
                <div className="w-12 h-12 bg-[#bbff4d]/10 rounded-full flex items-center justify-center mb-4 border border-[#bbff4d]/30">
                  <Award size={24} className="text-[#bbff4d]" />
                </div>
                <div className="text-[#bbff4d] font-bold tracking-[0.2em] uppercase text-[8px] mb-2">
                  Certificate of Completion
                </div>
                <div className="text-white text-xl font-bold mb-4 tracking-tight">
                  {user.name}
                </div>
                <div className="text-[#bbff4d] text-lg font-bold mb-4 flex items-center gap-2">
                  <Mountain size={16} />
                <span className="truncate max-w-[200px]">{trip.destination || trip.name}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Calendar size={12} />
                {tripDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full py-4 bg-[#2A2E2B] hover:bg-[#343936] border border-[#bbff4d]/20 text-[#bbff4d] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(187,255,77,0.1)]"
      >
        {isDownloading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Download size={20} />
            Download for Instagram
          </>
        )}
      </button>
    </div>
  );
}
