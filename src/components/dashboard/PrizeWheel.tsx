
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Users, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrizeWheelProps {
  spinning: boolean;
  onSpin: () => void;
  winner: any;
  eligibleCount: number;
}

export function PrizeWheel({ spinning, onSpin, winner, eligibleCount }: PrizeWheelProps) {
  const [rotation, setRotation] = useState(0);
  
  // Random rotation between 1080 and 1800 degrees (3-5 full spins)
  useEffect(() => {
    if (spinning) {
      const newRotation = rotation + 1080 + Math.random() * 720;
      setRotation(newRotation);
    }
  }, [spinning]);
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Roleta de Premiação</h3>
        <p className="text-sm text-muted-foreground">
          <Users className="inline-block mr-1 h-4 w-4" />
          {eligibleCount} usuários elegíveis (7+ check-ins em 7 dias)
        </p>
      </div>
      
      <div className="relative w-64 h-64 mb-6">
        {/* Wheel Marker (triangle pointer) */}
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10 text-amber-500 text-2xl">
          ▼
        </div>
        
        {/* The Wheel */}
        <motion.div
          className="w-full h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 flex items-center justify-center border-8 border-amber-600 shadow-lg"
          style={{ rotate: rotation }}
          animate={{ rotate: rotation }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            duration: 3,
            stiffness: 80
          }}
        >
          <div className="absolute inset-0 rounded-full border-dotted border-4 border-amber-200/50 animate-pulse" />
          
          {/* Center */}
          <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center z-10 shadow-inner">
            <Gift className="text-white w-8 h-8" />
          </div>
          
          {/* Segments */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="absolute inset-0 w-full h-full"
              style={{ transform: `rotate(${i * 45}deg)` }}
            >
              <div className="h-1/2 w-1 bg-amber-100 mx-auto" />
            </div>
          ))}
        </motion.div>
      </div>
      
      <Button
        onClick={onSpin}
        disabled={spinning}
        className="bg-amber-500 hover:bg-amber-600 gap-2"
      >
        {spinning ? (
          <>
            <RotateCw className="h-4 w-4 animate-spin" />
            Sorteando...
          </>
        ) : (
          <>
            <Gift className="h-4 w-4" />
            Girar Roleta
          </>
        )}
      </Button>
    </div>
  );
}
