import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, DoorOpen, BarChart, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - PUCPR Branding */}
      <aside className="w-64 bg-[#8a0538] text-white shadow-lg">
        <div className="p-6 border-b border-[#6d0429]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#8a0538] font-bold text-lg">P</span>
            </div>
            <div>
              <div className="text-xl font-bold">PUCPR</div>
              <div className="text-xs text-white/80">Controle de Espaços</div>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          <Link to="/">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive('/') ? 'bg-white/20' : ''
              }`}
            >
              <Home className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <Link to="/students">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive('/students') ? 'bg-white/20' : ''
              }`}
            >
              <Users className="mr-2 h-4 w-4" /> Alunos
            </Button>
          </Link>
          <Link to="/rooms">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive('/rooms') ? 'bg-white/20' : ''
              }`}
            >
              <DoorOpen className="mr-2 h-4 w-4" /> Salas
            </Button>
          </Link>
          <Link to="/analytics">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive('/analytics') ? 'bg-white/20' : ''
              }`}
            >
              <BarChart className="mr-2 h-4 w-4" /> Analytics
            </Button>
          </Link>
          <Link to="/realtime">
            <Button
              variant="ghost"
              className={`w-full justify-start text-white hover:bg-white/10 ${
                isActive('/realtime') ? 'bg-white/20' : ''
              }`}
            >
              <Activity className="mr-2 h-4 w-4" /> Tempo Real
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Card className="p-6 bg-white shadow-sm">{children}</Card>
      </main>
    </div>
  );
};

export default Layout;
