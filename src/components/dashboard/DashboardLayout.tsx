import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsBell } from './NotificationsBell';
import { 
  Home, LogOut, User, Users, Dumbbell, Calendar, 
  Download, Menu, X, Sparkles 
} from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  user: any;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Erro ao sair:', err);
      toast.error('Falha ao sair');
    }
  };

  const navItems = [
    { icon: Home, label: 'Início', path: '/dashboard' },
    { icon: Dumbbell, label: 'Fitness', path: '/fitness' },
    { icon: Calendar, label: 'Consultas', path: '/appointments' },
    { icon: Users, label: 'Grupos', path: '/groups' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-background relative">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 gradient-mesh opacity-50 pointer-events-none" />
      
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary/40 rounded-full" />
              <Dumbbell className="h-8 w-8 text-primary relative drop-shadow-[0_0_8px_hsl(var(--primary))]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-primary">Check</span>
              <span className="text-accent">Mate</span>
            </h1>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={isActive(item.path) ? "shadow-glow" : ""}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>
          
          <div className="flex items-center space-x-2">
            <NotificationsBell userId={user?.id} />
            
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => navigate('/download-app')}
            >
              <Download className="h-5 w-5" />
            </Button>
            
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 safe-bottom relative z-10">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <nav className="bottom-nav lg:hidden">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
              whileTap={{ scale: 0.9 }}
            >
              <item.icon className={`nav-icon h-6 w-6 transition-all duration-300 ${
                isActive(item.path) ? 'text-primary' : ''
              }`} />
              <span className={`text-xs mt-1 font-medium ${
                isActive(item.path) ? 'text-primary' : ''
              }`}>
                {item.label}
              </span>
              {isActive(item.path) && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-glow"
                />
              )}
            </motion.button>
          ))}
        </div>
      </nav>
    </div>
  );
}
