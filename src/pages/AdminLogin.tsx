import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, ArrowRight, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<React.ReactNode>('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // Just ignore
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled in Firebase. Please enable it in the Firebase Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(
          <div className="flex flex-col gap-2">
            <strong>Domain Not Authorized</strong>
            <p>You must add this Vercel domain to Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized Domains.</p>
          </div>
        );
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Login method not enabled. Please enable "Email/Password" in your Firebase Console.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError(
          <div className="flex flex-col items-center gap-2">
            <span>Invalid email or password.</span>
            <Link to="/signup" className="text-[#bbff4d] font-bold hover:underline">
              Don't have an account? Sign Up
            </Link>
          </div>
        );
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later or reset your password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    
    setResetLoading(true);
    setResetStatus(null);
    
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus({ 
        message: 'Password reset link sent! Check your inbox.', 
        type: 'success' 
      });
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmail('');
        setResetStatus(null);
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setResetStatus({ message: 'No account found with this email.', type: 'error' });
      } else {
        setResetStatus({ message: 'Failed to send reset email.', type: 'error' });
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#161917] text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#bbff4d]/20 rounded-2xl flex items-center justify-center mb-4 border border-[#bbff4d]/30">
            <ShieldCheck className="text-[#bbff4d]" size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
          <p className="text-white/40 text-sm mt-2">Access your trip management dashboard</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px flex-1 bg-white/5"></div>
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">OR</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#bbff4d] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#2A2E2B] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#bbff4d]/50 focus:bg-[#343936] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#bbff4d] transition-colors">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#2A2E2B] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#bbff4d]/50 focus:bg-[#343936] transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowResetModal(true)}
                className="text-xs text-[#bbff4d]/60 hover:text-[#bbff4d] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center leading-relaxed"
              >
                {typeof error === 'string' ? error : error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#161917]/30 border-t-[#161917] rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#bbff4d] font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
            Secure Access Portal
          </p>
        </div>
      </motion.div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#2A2E2B] border border-white/5 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 bg-[#bbff4d]/10 rounded-xl flex items-center justify-center text-[#bbff4d] mb-4">
                  <RefreshCw size={24} />
                </div>
                <h3 className="text-xl font-bold">Reset Password</h3>
                <p className="text-white/40 text-xs mt-2">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-1.5">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-[#161917] border border-white/5 rounded-2xl py-4 px-4 focus:outline-none focus:border-[#bbff4d]/50 transition-all text-sm"
                    required
                  />
                </div>

                {resetStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "text-[10px] py-2 px-3 rounded-lg text-center font-medium",
                      resetStatus.type === 'success' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {resetStatus.message}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <div className="w-5 h-5 border-2 border-[#161917]/30 border-t-[#161917] rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
