import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, MapPin, Battery, Clock } from 'lucide-react';
import heroBg from '@/assets/hero-bg.png';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Gradient background - dark green glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Zap className="h-4 w-4" />
            Smart EV Charging Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1]">
            Book EV charging slots{' '}
            <span className="text-primary">without waiting</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
            Smart scheduling and load management for apartments, offices, and fleet operators. Zero queues, maximum efficiency.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8 rounded-xl shadow-lg shadow-primary/25 font-bold"
              onClick={() => navigate('/auth')}
            >
              Start Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 rounded-xl border-border" onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-10 flex items-center gap-8">
            {[
              { icon: MapPin, value: '14', label: 'Stations' },
              { icon: Battery, value: '35', label: 'Chargers' },
              { icon: Clock, value: '99%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />
            <img src={heroBg} alt="VoltSlot Dashboard Preview" className="relative rounded-2xl shadow-2xl border border-border" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
