import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useBooking } from '@/contexts/BookingContext';
// Admin components removed: StatsCards, ChargerStatus, RegisteredUsers
import SlotGrid from '@/components/dashboard/SlotGrid';
import ActiveBookings from '@/components/dashboard/ActiveBookings';
import StationMap from '@/components/dashboard/StationMap';
import StationSearch from '@/components/dashboard/StationSearch';
import StationBottomSheet from '@/components/dashboard/StationBottomSheet';
import UserProfile from '@/components/dashboard/UserProfile';
import { List, LogOut, Sun, Moon, Menu, ChevronLeft, MapPin, User, Zap } from 'lucide-react';
import { Station } from '@/types';

const Dashboard = () => {
  const [active, setActive] = useState('map');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [filteredStations, setFilteredStations] = useState<Station[] | undefined>(undefined);
  const [bottomSheetStation, setBottomSheetStation] = useState<Station | null>(null);
  const handleSearchResults = useCallback((stations: Station[] | undefined) => setFilteredStations(stations), []);
  const { user, logout, loading } = useAuth();
  const { isDark, toggle } = useTheme();
  const { usingMockData } = useBooking();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Zap className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground">Loading VoltSlot...</p>
      </div>
    </div>
  );
  if (!user) return null;

  const navItems = [
    { id: 'map', label: 'Map View', icon: MapPin },
    { id: 'bookings', label: 'My Bookings', icon: List },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleMapStationClick = (station: Station) => {
    setBottomSheetStation(station);
  };

  const handleSelectStationForBooking = (station: Station) => {
    setSelectedStation(station);
    setActive('book');
  };

  const renderContent = () => {
    switch (active) {
      case 'map':
        return (
          <div className="relative" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* Search bar floating over the map */}
            <div className="absolute top-4 left-[52px] right-4 z-[500]">
              <StationSearch onResults={handleSearchResults} />
            </div>
            {/* Full-screen map */}
            <StationMap onSelectStation={handleMapStationClick} filteredStations={filteredStations} height="100%" />
            {/* Bottom sheet */}
            {bottomSheetStation && (
              <StationBottomSheet
                station={bottomSheetStation}
                onClose={() => setBottomSheetStation(null)}
                onSwitchStation={(s) => setBottomSheetStation(s)}
                onViewBookings={() => setActive('bookings')}
              />
            )}
          </div>
        );
      case 'book':
        return (
          <div className="p-6">
            <SlotGrid
              station={selectedStation}
              onBack={() => { setSelectedStation(null); setActive('map'); }}
              onViewBookings={() => setActive('bookings')}
            />
          </div>
        );
      case 'bookings':
        return <div className="p-6"><ActiveBookings /></div>;
      case 'profile':
        return <div className="p-6"><UserProfile /></div>;
      /* Admin views removed */
      default:
        return null;
    }
  };

  const pageTitle = () => {
    switch (active) {
      case 'map': return 'Discover Stations';
      case 'book': return selectedStation ? `Book — ${selectedStation.name}` : 'Book a Slot';
      case 'bookings': return 'My Bookings';
      case 'profile': return 'Profile';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col shrink-0`}>
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          {sidebarOpen && (
            <span className="font-extrabold text-lg tracking-tight">
              <span className="text-primary">Volt</span><span className="text-foreground">Slot</span>
            </span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors">
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setBottomSheetStation(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                active === item.id
                  ? 'bg-primary/15 text-primary font-semibold shadow-sm shadow-primary/5'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${active === item.id ? 'text-primary' : ''}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-0.5">
          <button onClick={toggle} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
            {sidebarOpen && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={async () => { await logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {active !== 'map' && (
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
            <div>
              <h1 className="text-lg font-bold">{pageTitle()}</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user.fullName || user.email}</p>
            </div>
          </header>
        )}
        <div className={active === 'map' ? 'flex-1' : 'flex-1 overflow-y-auto'}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
