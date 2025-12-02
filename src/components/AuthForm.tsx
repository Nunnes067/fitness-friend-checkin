import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp, resetPassword } from '@/lib/supabase';

export function AuthForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast.error('Falha no login', { description: error.message });
        return;
      }
      
      if (data?.session) {
        toast.success('Login realizado!', { description: 'Bem-vindo de volta!' });
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Erro inesperado');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Nome de usuário é obrigatório');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await signUp(email, password);
      
      if (error) {
        toast.error('Falha no cadastro', { description: error.message });
        return;
      }
      
      toast.success('Conta criada!', { description: 'Verifique seu email para confirmar.' });
    } catch (err) {
      toast.error('Erro inesperado');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const redirectTo = window.location.origin + '/dashboard';
      const { error } = await resetPassword(resetEmail, redirectTo);
      
      if (error) {
        toast.error('Falha ao resetar senha', { description: error.message });
        return;
      }
      
      toast.success('Email enviado!', { description: 'Verifique sua caixa de entrada' });
      setShowResetForm(false);
    } catch (err) {
      toast.error('Erro inesperado');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (showResetForm) {
    return (
      <motion.div 
        className="w-full max-w-md mx-auto space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <Dumbbell className="h-16 w-16 text-primary" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-black text-glow">CheckMate</h1>
          <p className="text-muted-foreground">Recupere sua senha</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card p-8 rounded-3xl">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-secondary/50 border-border/50 rounded-xl input-glow"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-semibold text-base glow-primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Sparkles className="h-5 w-5" />
                </motion.div>
              ) : (
                <>Enviar Link<ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full h-12 rounded-xl"
              onClick={() => setShowResetForm(false)}
            >
              Voltar ao Login
            </Button>
          </form>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full max-w-md mx-auto space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full animate-pulse" />
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative"
          >
            <Dumbbell className="h-20 w-20 text-primary drop-shadow-[0_0_15px_hsl(var(--primary))]" />
          </motion.div>
        </div>
        <h1 className="text-5xl font-black tracking-tight">
          <span className="text-glow">Check</span>
          <span className="text-accent">Mate</span>
        </h1>
        <p className="text-muted-foreground text-lg">Seu companheiro fitness definitivo</p>
      </motion.div>
      
      {/* Auth Card */}
      <motion.div variants={itemVariants} className="glass-card p-8 rounded-3xl space-y-6">
        {/* Tab Switcher */}
        <div className="flex bg-secondary/50 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'signin' 
                ? 'bg-primary text-primary-foreground shadow-glow' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'signup' 
                ? 'bg-primary text-primary-foreground shadow-glow' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cadastrar
          </button>
        </div>
        
        <AnimatePresence mode="wait">
          {activeTab === 'signin' ? (
            <motion.form 
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSignIn} 
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-secondary/50 border-border/50 rounded-xl input-glow"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <button 
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setShowResetForm(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-secondary/50 border-border/50 rounded-xl input-glow"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl font-semibold text-base pulse-glow" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <>Entrar<ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.form 
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSignUp} 
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Nome de Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="seunome"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10 h-12 bg-secondary/50 border-border/50 rounded-xl input-glow"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-signup" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-secondary/50 border-border/50 rounded-xl input-glow"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-signup" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-secondary/50 border-border/50 rounded-xl input-glow"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl font-semibold text-base pulse-glow" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <>Criar Conta<ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Footer */}
      <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
        Ao usar o CheckMate, você concorda com nossos Termos de Serviço
      </motion.p>
    </motion.div>
  );
}
