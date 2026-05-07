import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CalendarCheck, Radio, Gauge } from 'lucide-react';

const features = [
  {
    icon: CalendarCheck,
    title: 'Smart Scheduling',
    description: 'Book charging slots in advance. Pick your preferred time and charger with a few taps.',
  },
  {
    icon: Radio,
    title: 'Real-time Availability',
    description: 'See which chargers are free right now. Live status updates prevent wasted trips.',
  },
  {
    icon: Gauge,
    title: 'Load Management',
    description: 'Intelligent power distribution prevents overloads and ensures every vehicle charges efficiently.',
  },
];

const Features = () => (
  <section id="features" className="py-24 bg-muted/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold">
          Everything you need for{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            effortless charging
          </span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          VoltSlot combines scheduling, monitoring, and load balancing into one seamless platform.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow bg-card rounded-2xl">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                  <f.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
