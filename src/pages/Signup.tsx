import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Key, ArrowRight, UserPlus, User as UserIcon } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<React.ReactNode>('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const createAdminProfile = async (uid: string, adminName: string, adminEmail: string) => {
    try {
      await setDoc(doc(db, 'admins', uid), {
        name: adminName,
        email: adminEmail.toLowerCase(),
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error creating admin profile:', err);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createAdminProfile(result.user.uid, result.user.displayName || 'Anonymous Admin', result.user.email || '');
      }
      navigate('/');
    } catch (err: any) {
      console.error('Google Sign-Up error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // Just ignore
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-up is not enabled in Firebase. Please enable it in the Firebase Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(
          <div className="flex flex-col gap-2">
            <strong>Domain Not Authorized</strong>
            <p>You must add this Vercel domain to Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized Domains.</p>
          </div>
        );
      } else {
        setError('Failed to sign up with Google. Please try again.');
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
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, {
        displayName: name.trim()
      });
      await createAdminProfile(userCredential.user.uid, name.trim(), email.trim());
      navigate('/');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password accounts are not enabled in Firebase. Please enable them in the Firebase Console (Authentication > Sign-in method).');
      } else if (err.code === 'auth/email-already-in-use') {
        setError(
          <div className="flex flex-col items-center gap-2">
            <span>This email is already registered.</span>
            <Link to="/login" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors mt-1 font-bold">
              Try Logging In instead
            </Link>
          </div>
        );
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. It should be at least 6 characters.');
      } else {
        setError('An unexpected error occurred during signup. Please try again.');
      }
    } finally {
      setLoading(false);
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
            <UserPlus className="text-[#bbff4d]" size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Admin Account</h1>
          <p className="text-white/40 text-sm mt-2">Join Hillo to manage your journeys</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
            <span>Sign up with Google</span>
          </button>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px flex-1 bg-white/5"></div>
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">OR</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#bbff4d] transition-colors">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#2A2E2B] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#bbff4d]/50 focus:bg-[#343936] transition-all"
                  required
                />
              </div>
            </div>

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
                  minLength={6}
                />
              </div>
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
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-[#bbff4d] font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
            Join the movement
          </p>
        </div>
      </motion.div>
    </div>
  );
}
