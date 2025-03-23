
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface PartyTimeRemainingProps {
  expiresAt: string;
}

export function PartyTimeRemaining({ expiresAt }: PartyTimeRemainingProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0
  });
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const expiry = new Date(expiresAt);
      const now = new Date();
      const timeLeft = expiry.getTime() - now.getTime();
      
      if (timeLeft <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0 });
        return;
      }
      
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining({ hours: hoursLeft, minutes: minutesLeft });
    };
    
    // Calculate immediately
    calculateTimeRemaining();
    
    // And then every minute
    const interval = setInterval(calculateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, [expiresAt]);
  
  return (
    <p className="text-xs text-muted-foreground mt-2">
      <Clock className="h-3 w-3 inline mr-1" />
      Expira em {timeRemaining.hours}h {timeRemaining.minutes}min
    </p>
  );
}
