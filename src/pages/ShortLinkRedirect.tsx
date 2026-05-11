import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

export default function ShortLinkRedirect() {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const resolveLink = async () => {
      if (!shortId) return;
      try {
        const linkDoc = await getDoc(doc(db, 'short_links', shortId));
        if (linkDoc.exists()) {
          const data = linkDoc.data();
          if (data.targetUrl) {
            // Because our app runs via React Router, we just need the path, not the origin.
            // targetUrl might be something like "/trip/xyz/user/abc"
            navigate(data.targetUrl, { replace: true });
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to resolve short link:', err);
        setError(true);
      }
    };
    resolveLink();
  }, [shortId, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <div className="glass-card p-10 max-w-sm w-full mx-auto border-red-500/30">
          <h1 className="text-xl font-bold text-red-400 mb-2">Invalid Link</h1>
          <p className="text-white/60 mb-6">This ticket link has expired or never existed.</p>
          <button onClick={() => navigate('/')} className="btn-glass w-full">Go to Homepage</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#bbff4d]/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 bg-[#bbff4d]/10 border border-[#bbff4d]/20 rounded-3xl flex items-center justify-center mb-8">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#bbff4d]">
             <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
             <path d="M13 5v2"></path>
             <path d="M13 17v2"></path>
             <path d="M13 11v2"></path>
           </svg>
        </div>
        <h1 className="text-6xl font-bold tracking-tighter text-[#bbff4d] mb-4 font-display">Hillo.</h1>
        <p className="text-white/60 mb-12 text-sm max-w-[280px] leading-relaxed italic">
          "The journey of a thousand miles begins with a single step."
        </p>
        <div className="flex flex-col items-center gap-3">
           <div className="w-6 h-6 border-2 border-[#bbff4d]/20 border-t-[#bbff4d] rounded-full animate-spin" />
           <div className="text-[10px] text-[#bbff4d]/50 uppercase tracking-widest font-mono">
             Resolving secure link...
           </div>
        </div>
        <div className="mt-12 text-[9px] uppercase tracking-widest text-white/20">Seamless Tour Logistics</div>
      </div>
    </div>
  );
}
