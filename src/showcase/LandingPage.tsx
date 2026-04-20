import React from 'react';
import { motion } from 'motion/react';
import { QrCode, ShieldAlert, Smartphone, Zap, Globe, Users, ArrowRight, CheckCircle2, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const features = [
    {
      icon: <QrCode className="text-emerald-400" size={32} />,
      title: "QR Boarding System",
      description: "Eliminate paper lists. Check in passengers in seconds using a lightning-fast QR scanner on your phone."
    },
    {
      icon: <ShieldAlert className="text-red-400" size={32} />,
      title: "Emergency SOS Tracking",
      description: "Safety first. Passengers can trigger an SOS with one click, sending their live GPS location to your dashboard."
    },
    {
      icon: <Smartphone className="text-blue-400" size={32} />,
      title: "Smart WhatsApp Tickets",
      description: "Automated ticket generation. Send beautiful, branded digital passes directly to passenger WhatsApp numbers."
    },
    {
      icon: <Globe className="text-purple-400" size={32} />,
      title: "Real-Time Dashboard",
      description: "Monitor your entire trip from one place. See who's boarded, who's missing, and who needs help instantly."
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$29",
      period: "per trip",
      features: ["Up to 50 Passengers", "QR Boarding", "Basic SOS Alerts", "Email Support"],
      recommended: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      features: ["Unlimited Trips", "Unlimited Passengers", "Real-time GPS SOS", "WhatsApp Tickets", "Priority Support"],
      recommended: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "annual",
      features: ["White-label Branding", "Multi-Admin Support", "API Access", "Dedicated Manager"],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#161917] text-white selection:bg-[#bbff4d]/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#161917]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-[#bbff4d] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(187,255,77,0.3)]">
              <Zap size={18} className="text-[#161917]" />
            </div>
            HillTrip<span className="text-[#bbff4d]">Manager</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#tech" className="hover:text-white transition-colors">Technology</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <Link 
            to="/" 
            className="px-5 py-2.5 bg-[#bbff4d] hover:bg-[#a5e639] text-[#161917] rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(187,255,77,0.2)]"
          >
            Live Demo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(187,255,77,0.1),transparent_50%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bbff4d]/10 border border-[#bbff4d]/20 text-[#bbff4d] text-xs font-bold uppercase tracking-widest mb-8">
              <Zap size={14} />
              The Future of Tour Management
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Manage Trips with <span className="text-[#bbff4d] drop-shadow-[0_0_15px_rgba(187,255,77,0.5)]">Zero Friction.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              HillTrip Manager is a specialized SaaS solution for tour operators. From QR boarding to real-time SOS safety, we handle the logistics so you can focus on the adventure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/" 
                className="w-full sm:w-auto px-8 py-4 bg-[#bbff4d] hover:bg-[#a5e639] text-[#161917] rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(187,255,77,0.3)] flex items-center justify-center gap-2 group"
              >
                View Admin Demo
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto px-8 py-4 bg-[#2A2E2B] hover:bg-[#343936] border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-white"
              >
                Explore Features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-[#161917]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Modern Operators</h2>
            <p className="text-white/40">Everything you need to run a safe and organized group trip.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] bg-[#2A2E2B] border border-white/5 hover:border-[#bbff4d]/30 transition-all group shadow-[0_0_50px_rgba(255,255,255,0.02)]"
              >
                <div className="mb-6 p-4 bg-[#161917] rounded-2xl inline-block group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-[#2A2E2B] rounded-[32px] p-12 border border-[#bbff4d]/20 relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#bbff4d]/10 blur-[100px] -mr-32 -mt-32" />
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Why HillTrip Manager?</h2>
                <div className="space-y-6">
                  {[
                    "Reduce boarding time by up to 80%",
                    "Instant emergency response with GPS tracking",
                    "Professional branding for your tour agency",
                    "No app install required for passengers"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-[#bbff4d]/20 rounded-full flex items-center justify-center text-[#bbff4d]">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-white/80 font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl bg-[#161917] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                   <div className="text-center p-8">
                      <Smartphone className="mx-auto mb-4 text-[#bbff4d]" size={48} />
                      <div className="text-lg font-bold mb-2">Mobile-First Experience</div>
                      <p className="text-sm text-white/40">Optimized for tour leads on the go.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-24 bg-[#161917]/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-[#2A2E2B] rounded-[32px] p-12 border border-white/5 shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <h2 className="text-3xl font-bold mb-8 text-center">Modern Tech Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-[#bbff4d] font-bold text-xl mb-1">React 18</div>
                <div className="text-xs text-white/30 uppercase tracking-widest">Frontend</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-xl mb-1">Firebase</div>
                <div className="text-xs text-white/30 uppercase tracking-widest">Backend & Auth</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-bold text-xl mb-1">Tailwind</div>
                <div className="text-xs text-white/30 uppercase tracking-widest">Styling</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-xl mb-1">Vite</div>
                <div className="text-xs text-white/30 uppercase tracking-widest">Build Tool</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Scalable Revenue Model</h2>
            <p className="text-white/40">Multiple ways to monetize the platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((p, i) => (
              <div 
                key={i}
                className={cn(
                  "p-8 rounded-[32px] border transition-all relative",
                  p.recommended ? "bg-[#2A2E2B] border-[#bbff4d]/30 shadow-[0_0_30px_rgba(187,255,77,0.1)]" : "bg-white/5 border-white/10"
                )}
              >
                {p.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#bbff4d] text-[#161917] text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-xl font-bold mb-2">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-white/40 text-sm">/{p.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white/60">
                      <CheckCircle2 size={16} className="text-[#bbff4d] flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to modernize your tours?</h2>
          <p className="text-white/40 mb-12 max-w-xl mx-auto">
            Join the next generation of tour operators using technology to provide safer, smoother experiences.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#bbff4d] hover:bg-[#a5e639] text-[#161917] rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(187,255,77,0.3)]"
          >
            Get Started Now
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-white/20 text-sm">
        &copy; 2026 HillTrip Manager. All rights reserved.
      </footer>
    </div>
  );
}
