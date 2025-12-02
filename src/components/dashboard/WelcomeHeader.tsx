import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

export function WelcomeHeader() {
  return (
    <motion.section 
      className="mb-8 text-center relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Decorative elements */}
      <motion.div
        className="absolute -top-10 left-1/4 text-primary/20"
        animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Sparkles className="h-8 w-8" />
      </motion.div>
      <motion.div
        className="absolute -top-5 right-1/4 text-accent/20"
        animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      >
        <Zap className="h-6 w-6" />
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite]">
            Bem-vindo ao CheckMate
          </span>
        </h1>
      </motion.div>
      
      <motion.p 
        className="text-muted-foreground text-lg max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Acompanhe sua evolução, mantenha-se motivado e conquiste seus objetivos fitness
      </motion.p>

      {/* Stats bar */}
      <motion.div
        className="flex items-center justify-center gap-6 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Sistema Online</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4 text-warning" />
          <span>Pronto para treinar</span>
        </div>
      </motion.div>
    </motion.section>
  );
}
