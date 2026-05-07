import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CalendarDays, BatteryCharging } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Sign Up', desc: 'Create your account in seconds. No credit card required.' },
  { icon: CalendarDays, title: 'Book a Slot', desc: 'Pick a date, time, and charger that works for you.' },
  { icon: BatteryCharging, title: 'Charge Up', desc: 'Show up at your reserved time and plug in. Zero waiting.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold">
          How it{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">works</span>
        </h2>
        <p className="mt-4 text-muted-foreground">Three simple steps to hassle-free EV charging.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary to-secondary" />
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="text-center relative"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 relative z-10">
              <s.icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Step {i + 1}</span>
            <h3 className="text-xl font-semibold mt-2 mb-3">{s.title}</h3>
            <p className="text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
