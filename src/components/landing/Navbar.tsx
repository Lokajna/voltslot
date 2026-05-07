import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Menu, X, Zap } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-primary">Volt</span><span className="text-foreground">Slot</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-muted transition-colors">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={async () => { await logout(); navigate('/'); }}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Login</Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 font-semibold" onClick={() => navigate('/auth')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border pt-3">
            <a href="#features" className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#pricing" className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={toggle} className="p-2 rounded-xl hover:bg-muted">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {isAuthenticated ? (
                <Button size="sm" className="rounded-xl" onClick={() => { navigate('/dashboard'); setOpen(false); }}>Dashboard</Button>
              ) : (
                <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 font-semibold" onClick={() => { navigate('/auth'); setOpen(false); }}>
                  Get Started
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
