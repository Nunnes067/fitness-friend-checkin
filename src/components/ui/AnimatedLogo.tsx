
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Dumbbell } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedLogo({ size = 'md', className }: AnimatedLogoProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Initial animation
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 2000);
    
    // Setup interval for occasional animations
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 10000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  return (
    <div className={cn(
      "relative flex items-center justify-center transition-all duration-500",
      sizeClasses[size],
      className
    )}>
      <div 
        className={cn(
          "absolute inset-0 rounded-full bg-primary/10 transition-all duration-1000",
          isAnimating ? "scale-110 opacity-70" : "scale-100 opacity-0"
        )}
      />
      <Dumbbell 
        className={cn(
          "text-primary transition-all duration-500",
          isAnimating ? "scale-110 rotate-12" : "scale-100 rotate-0",
          sizeClasses[size]
        )}
      />
    </div>
  );
}
