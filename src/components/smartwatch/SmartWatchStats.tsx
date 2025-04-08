
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Activity, Heart, Timer, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartWatchStatsProps {
  streak?: number;
  lastCheckInDate?: string;
  hasCheckedInToday: boolean;
}

export function SmartWatchStats({ streak = 0, lastCheckInDate, hasCheckedInToday }: SmartWatchStatsProps) {
  const currentTime = new Date();
  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric'
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Card className="w-[170px] h-[220px] rounded-3xl bg-black text-white border-4 border-zinc-700 overflow-hidden shadow-xl">
      <CardContent className="flex flex-col items-center justify-between p-2 h-full">
        {/* Watch Status Bar */}
        <div className="w-full flex justify-between items-center mb-1 text-xs text-zinc-400">
          <span className="flex items-center">
            <Heart className="h-3 w-3 text-red-500 mr-1" />
            <span>72</span>
          </span>
          <span className="text-xs">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        
        <Separator className="bg-zinc-700 mb-2" />
        
        {/* Header */}
        <div className="text-center w-full mb-1">
          <h3 className="text-xs font-bold">CheckMate Stats</h3>
          <p className="text-[10px] text-zinc-400">{formattedDate}</p>
        </div>
        
        {/* Stats */}
        <motion.div 
          className="w-full flex-1 flex flex-col justify-center space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-blue-400" />
              <span className="text-[10px]">Status</span>
            </div>
            <span className={`text-[10px] font-medium ${hasCheckedInToday ? 'text-green-500' : 'text-yellow-500'}`}>
              {hasCheckedInToday ? 'OK' : 'Pendente'}
            </span>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-3 w-3 mr-1 text-blue-400" />
              <span className="text-[10px]">Sequência</span>
            </div>
            <span className="text-[10px] font-medium">
              {streak} dias
            </span>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center">
              <Timer className="h-3 w-3 mr-1 text-blue-400" />
              <span className="text-[10px]">Último</span>
            </div>
            <span className="text-[10px] font-medium">
              {lastCheckInDate ? new Date(lastCheckInDate).toLocaleDateString('pt-BR', {month: 'short', day: 'numeric'}) : '-'}
            </span>
          </motion.div>
        </motion.div>
        
        {/* Bottom Navigation Dots */}
        <div className="flex space-x-1 mt-1 mb-1">
          <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-zinc-600 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
}
