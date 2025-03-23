
import { motion } from 'framer-motion';

export function WelcomeHeader() {
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.section 
      className="mb-12 text-center"
      initial="hidden"
      animate="visible"
      variants={fadeInUpVariants}
    >
      <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Bem-vindo ao CheckMate</h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Acompanhe sua presença na academia, mantenha-se motivado e compare com amigos - tudo em um só lugar.
      </p>
    </motion.section>
  );
}
