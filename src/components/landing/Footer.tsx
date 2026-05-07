import React from 'react';
import { Zap } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border py-12 bg-muted/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-xl tracking-tight">VoltSlot</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 VoltSlot. Smart EV charging, zero waiting.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
