
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { checkIn } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface CheckInButtonProps {
  userId: string;
  onCheckInSuccess: () => void;
  hasCheckedInToday: boolean;
}

export function CheckInButton({ userId, onCheckInSuccess, hasCheckedInToday }: CheckInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleCheckIn = async () => {
    if (hasCheckedInToday) {
      toast.info("You've already checked in today!", {
        description: "Come back tomorrow for your next check-in."
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error, alreadyCheckedIn } = await checkIn(userId);
      
      if (error) {
        toast.error('Check-in failed', {
          description: error.message,
        });
        return;
      }
      
      if (alreadyCheckedIn) {
        toast.info("You've already checked in today!", {
          description: "Come back tomorrow for your next check-in."
        });
        return;
      }
      
      // Show success animation
      setShowSuccess(true);
      
      // Reset after animation completes
      setTimeout(() => {
        setShowSuccess(false);
        
        // Show success toast
        toast.success('Check-in successful!', {
          description: "You've logged your gym attendance for today.",
          icon: <Trophy className="h-4 w-4 text-yellow-500" />,
        });
        
        // Trigger parent component refresh
        onCheckInSuccess();
      }, 2000);
      
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
      )}
      
      <Button
        size="lg"
        className={cn(
          "transition-all duration-500 h-16 px-8 rounded-full font-semibold",
          showSuccess ? "opacity-0" : "opacity-100",
          hasCheckedInToday ? "bg-secondary text-foreground hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"
        )}
        disabled={isLoading || showSuccess}
        onClick={handleCheckIn}
      >
        <Dumbbell className={cn(
          "mr-2 h-5 w-5 transition-transform duration-300",
          isLoading ? "animate-pulse" : ""
        )} />
        {hasCheckedInToday ? "Checked in Today" : "Check In Now"}
      </Button>
    </div>
  );
}
