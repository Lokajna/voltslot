import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <Zap className="h-12 w-12 text-primary-foreground mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to eliminate charging queues?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of EV owners and operators already using VoltSlot for smarter charging.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/auth')}
            >
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
