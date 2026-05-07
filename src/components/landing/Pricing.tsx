import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Normal Charging',
    price: '₹2',
    period: '/min',
    desc: 'Perfect for regular top-ups and long parking',
    features: ['7.4 kW AC Power', 'Widespread availability', 'Flexible durations', 'Standard support'],
    cta: 'Book Normal Slot',
    highlight: false,
  },
  {
    name: 'Fast Charging',
    price: '₹5',
    period: '/min',
    desc: 'Get back on the road in minutes, not hours',
    features: ['50 kW DC Power', 'Rapid charging capability', 'Zero waiting times', 'Priority 24/7 support'],
    cta: 'Book Fast Slot',
    highlight: true,
  }
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Simple,{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground">Pay only for the time you charge. No hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card
                className={`h-full rounded-2xl ${
                  t.highlight
                    ? 'border-2 border-primary shadow-xl shadow-primary/20 relative'
                    : 'border shadow-lg'
                }`}
              >
                {t.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pb-2 pt-8">
                  <CardTitle className="text-lg">{t.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{t.desc}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold">{t.price}</span>
                    <span className="text-muted-foreground">{t.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-4 ${t.highlight ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90' : ''}`}
                    variant={t.highlight ? 'default' : 'outline'}
                    onClick={() => navigate('/auth')}
                  >
                    {t.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
