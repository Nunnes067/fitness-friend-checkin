
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface InstallPromptProps {
  deferredPrompt: any;
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallPrompt({ deferredPrompt, onInstall, onDismiss }: InstallPromptProps) {
  const isMobile = useIsMobile();
  
  if (!deferredPrompt) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-background border-t border-primary/10 shadow-lg animate-slide-in-up">
      <div className="container mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Instale o CheckMate</h3>
            <p className="text-sm text-muted-foreground">
              {isMobile 
                ? 'Adicione à tela inicial para fácil acesso' 
                : 'Instale como aplicativo para melhor experiência'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4 mr-1" />
            Agora não
          </Button>
          <Button variant="default" size="sm" onClick={onInstall}>
            <Download className="h-4 w-4 mr-1" />
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
}
