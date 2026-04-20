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
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
      <Loader2 className="animate-spin text-brand-primary mb-4" size={48} />
      <div className="text-white/50 animate-pulse font-mono flex flex-col items-center">
        <span>Resolving secure ticket link...</span>
        {/* Placeholder Ad While Loading! */}
        <div className="mt-8 text-[10px] uppercase tracking-widest text-[#bbff4d]/50">Sponsored</div>
        <div className="mt-2 w-[300px] h-[50px] bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/30 text-xs italic">
          Loading Ad Space...
        </div>
      </div>
    </div>
  );
}
