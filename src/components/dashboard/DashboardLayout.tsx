import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsBell } from './NotificationsBell';
import { BottomNavigation } from './BottomNavigation';
import { 
  Home, LogOut, User, Users, Dumbbell, Calendar, 
  Download, Sparkles 
} from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
  user: any;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
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
      {/* Subtle Gradient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto h-14 px-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <Dumbbell className="h-6 w-6 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">
              <span className="text-primary">Check</span>
              <span className="text-accent">Mate</span>
            </span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`gap-2 ${isActive(item.path) ? "shadow-[0_0_15px_hsl(var(--primary)/0.3)]" : ""}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
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
      <main className="container mx-auto px-4 py-6 pb-24 lg:pb-6 relative z-10">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}
