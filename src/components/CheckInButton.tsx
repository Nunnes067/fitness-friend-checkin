
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { checkIn } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CheckInButtonProps {
  userId: string;
  onCheckInSuccess: () => void;
  hasCheckedInToday: boolean;
}

export function CheckInButton({ userId, onCheckInSuccess, hasCheckedInToday }: CheckInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const openPhotoDialog = () => {
    if (hasCheckedInToday) {
      toast.info("Você já fez check-in hoje!", {
        description: "Volte amanhã para seu próximo check-in."
      });
      return;
    }
    
    setShowPhotoDialog(true);
  };
  
  const closePhotoDialog = () => {
    setShowPhotoDialog(false);
    setPhotoPreview(null);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview of the selected photo
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePhotoSubmit = async () => {
    if (!photoPreview) {
      toast.error('Por favor, tire uma foto para continuar');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error, alreadyCheckedIn } = await checkIn(userId, photoPreview);
      
      if (error) {
        toast.error('Falha no check-in', {
          description: error.message,
        });
        closePhotoDialog();
        return;
      }
      
      if (alreadyCheckedIn) {
        toast.info("Você já fez check-in hoje!", {
          description: "Volte amanhã para seu próximo check-in."
        });
        closePhotoDialog();
        return;
      }
      
      // Close the dialog
      closePhotoDialog();
      
      // Show success animation
      setShowSuccess(true);
      
      // Reset after animation completes
      setTimeout(() => {
        setShowSuccess(false);
        
        // Show success toast
        toast.success('Check-in realizado com sucesso!', {
          description: "Sua presença na academia foi registrada hoje.",
          icon: <Trophy className="h-4 w-4 text-yellow-500" />,
        });
        
        // Trigger parent component refresh
        onCheckInSuccess();
      }, 2000);
      
    } catch (err) {
      toast.error('Ocorreu um erro inesperado');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        {showSuccess && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500" />
          </motion.div>
        )}
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            className={cn(
              "transition-all duration-500 h-16 px-8 rounded-full font-semibold",
              showSuccess ? "opacity-0" : "opacity-100",
              hasCheckedInToday ? "bg-secondary text-foreground hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"
            )}
            disabled={isLoading || showSuccess}
            onClick={openPhotoDialog}
          >
            <Camera className={cn(
              "mr-2 h-5 w-5 transition-transform duration-300",
              isLoading ? "animate-pulse" : ""
            )} />
            {hasCheckedInToday ? "Já registrou hoje" : "Fazer Check-in com Foto"}
          </Button>
        </motion.div>
      </div>
      
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verificação de Presença</DialogTitle>
            <DialogDescription>
              Tire uma foto para confirmar que você está na academia.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="mx-auto rounded-md max-h-60 object-cover" 
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  onClick={() => setPhotoPreview(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-md p-12 text-center cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique para tirar ou selecionar uma foto</p>
              </div>
            )}
            
            <Input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden"
              onChange={handleFileChange}
            />
            
            <Button
              variant="outline"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              {photoPreview ? "Tirar outra foto" : "Selecionar foto da galeria"}
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closePhotoDialog}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={handlePhotoSubmit}
              disabled={!photoPreview || isLoading}
            >
              {isLoading ? "Processando..." : "Confirmar Check-in"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
