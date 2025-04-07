
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Download, LogOut, User } from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  user: any;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Erro ao sair:', err);
      toast.error('Falha ao sair');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 transition-colors duration-300">
      <header className="glass border-b border-primary/10 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedLogo size="sm" />
            <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CheckMate</h1>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={() => navigate('/download-app')}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar App
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/download-app')}
              title="Baixar App"
              className="md:hidden hover:text-primary hover:bg-primary/5"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hidden md:flex hover:text-primary hover:bg-primary/5"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              {user?.email}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              title="Perfil"
              className="md:hidden hover:text-primary hover:bg-primary/5"
            >
              <User className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sair"
              className="hover:text-primary hover:bg-primary/5"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
      <footer className="border-t border-primary/10 py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-medium">CheckMate</span> - Seu companheiro diário na academia
        </div>
      </footer>
    </div>
  );
}
