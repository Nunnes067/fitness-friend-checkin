
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, Clock, Plus, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ProgressPhoto {
  id: string;
  url: string;
  created_at: string;
  description: string;
}

export function ProgressTracking({ userId }: { userId: string }) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const isMobile = useIsMobile();
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let intervalId: number | undefined;
    
    if (isTimerRunning) {
      intervalId = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setSeconds(0);
  };
  
  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        // Simulate photo fetching - would fetch from supabase here
        // For now we'll just have placeholder data
        setPhotos([]);
      } catch (err) {
        console.error('Erro ao buscar fotos:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPhotos();
  }, [userId]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', { 
        description: 'O tamanho máximo permitido é 5MB' 
      });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Tipo de arquivo inválido', { 
        description: 'Apenas imagens são permitidas' 
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Here we would upload to Supabase Storage
      // For now just simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful upload
      const newPhoto = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file), // This is just for demo, won't persist on refresh
        created_at: new Date().toISOString(),
        description: description || 'Foto de progresso'
      };
      
      setPhotos(prev => [newPhoto, ...prev]);
      setDescription('');
      toast.success('Foto adicionada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset the input
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <Card className="glass-card w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Controle de Progresso</CardTitle>
          <Camera className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>
          Registre fotos e acompanhe seu progresso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Timer Card */}
          <Card className="bg-secondary/30">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold mb-3">
                  {formatTime(seconds)}
                </div>
                <div className="flex justify-center space-x-2">
                  <Button 
                    onClick={toggleTimer} 
                    variant={isTimerRunning ? "destructive" : "default"}
                    size="sm"
                  >
                    {isTimerRunning ? 'Pausar' : 'Iniciar'}
                  </Button>
                  <Button 
                    onClick={resetTimer} 
                    variant="outline" 
                    size="sm"
                    disabled={seconds === 0}
                  >
                    Zerar
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Temporizador para treino
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Upload Card */}
          <Card className="bg-secondary/30">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da foto (opcional)"
                  disabled={isUploading}
                  className="mb-2"
                />
                
                <div className="flex items-center justify-center">
                  <label
                    htmlFor="photo-upload"
                    className={cn(
                      "flex items-center justify-center px-4 py-2 rounded-md w-full",
                      "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer",
                      "transition-colors text-center",
                      isUploading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isUploading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Adicionar Foto
                      </span>
                    )}
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  Tire uma foto para registrar seu progresso
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ScrollArea className={cn("pr-4", isMobile ? "h-[220px]" : "h-[250px]")}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse-light">Carregando fotos...</div>
            </div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {photos.length === 0 && (
                <motion.div 
                  className="py-8 text-center text-muted-foreground"
                  variants={itemVariants}
                >
                  Nenhuma foto de progresso registrada ainda
                </motion.div>
              )}
              
              {photos.map((photo) => (
                <motion.div 
                  key={photo.id} 
                  className="rounded-lg overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="relative">
                    <img
                      src={photo.url}
                      alt={photo.description}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <div className="text-sm font-medium">{photo.description}</div>
                      <div className="text-xs opacity-80">
                        {new Date(photo.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
