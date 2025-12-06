import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  Calendar, 
  Users, 
  User 
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: Dumbbell, label: 'Fitness', path: '/fitness' },
  { icon: Calendar, label: 'Consultas', path: '/appointments' },
  { icon: Users, label: 'Grupos', path: '/groups' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Blur Background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      <div className="relative flex items-center justify-around h-16 px-2 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {/* Active Background */}
              {active && (
                <motion.div
                  layoutId="navBackground"
                  className="absolute inset-x-2 inset-y-1.5 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <motion.div
                className="relative z-10"
                animate={active ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon className={`h-5 w-5 transition-all duration-200 ${
                  active ? 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : ''
                }`} />
              </motion.div>
              
              <span className={`relative z-10 text-[10px] mt-1 font-medium transition-all ${
                active ? 'text-primary' : ''
              }`}>
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {active && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
