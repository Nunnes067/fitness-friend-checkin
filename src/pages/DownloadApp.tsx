
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const DownloadApp = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [generationStep, setGenerationStep] = useState(0);
  
  const steps = [
    'Compilando projeto web...',
    'Sincronizando com Capacitor...',
    'Construindo APK usando Gradle...',
    'Finalizando processo...'
  ];

  const handleGenerateApk = async () => {
    setIsGenerating(true);
    setGenerationStep(0);
    setDownloadUrl('');
    
    try {
      // Simulamos os passos de build com setTimeouts
      const response = await fetch('/api/build-apk', { 
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao gerar o APK');
      }
      
      // Acompanhar progresso simulado
      const eventSource = new EventSource('/api/build-status');
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.step !== undefined) {
          setGenerationStep(data.step);
        }
        
        if (data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setIsGenerating(false);
          eventSource.close();
          toast.success('APK gerado com sucesso!');
        }
        
        if (data.error) {
          toast.error(`Erro ao gerar APK: ${data.error}`);
          setIsGenerating(false);
          eventSource.close();
        }
      };
      
      eventSource.onerror = () => {
        toast.error('Conexão perdida com o servidor');
        setIsGenerating(false);
        eventSource.close();
      };
      
    } catch (error) {
      toast.error('Erro ao iniciar processo de geração do APK');
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Download do CheckMate Fitness
          </h1>
          <p className="text-muted-foreground">
            Instale nosso aplicativo para ter a melhor experiência
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-card border rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Smartphone className="w-6 h-6 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Aplicativo Android</h2>
            </div>
            <p className="mb-6 text-muted-foreground">
              Baixe nosso aplicativo Android para acessar o CheckMate Fitness mesmo sem conexão com a internet.
            </p>
            
            {downloadUrl ? (
              <Button onClick={() => window.open(downloadUrl, '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Baixar APK
              </Button>
            ) : (
              <Button 
                onClick={handleGenerateApk} 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando APK...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Gerar APK
                  </>
                )}
              </Button>
            )}
            
            {isGenerating && (
              <div className="mt-4">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(generationStep + 1) / steps.length * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {steps[generationStep]}
                </p>
              </div>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="link" className="px-0 mt-4">
                  Como instalar manualmente?
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Instalação Manual do APK</SheetTitle>
                  <SheetDescription>
                    Siga estes passos para instalar o APK no seu dispositivo Android
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">1. Baixe o APK</h3>
                    <p className="text-sm text-muted-foreground">
                      Clique no botão "Baixar APK" para fazer o download do arquivo.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">2. Permita instalação de fontes desconhecidas</h3>
                    <p className="text-sm text-muted-foreground">
                      Vá para Configurações &gt; Segurança &gt; Fontes desconhecidas e ative a opção.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">3. Instale o APK</h3>
                    <p className="text-sm text-muted-foreground">
                      Abra o arquivo baixado e siga as instruções na tela para instalar.
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Smartphone className="w-6 h-6 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">Instalar como PWA</h2>
            </div>
            <p className="mb-6 text-muted-foreground">
              Você também pode instalar o CheckMate como um aplicativo web progressivo (PWA) diretamente do seu navegador.
            </p>
            
            <ol className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="bg-primary/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-2 mt-0.5">1</span>
                <span>No seu navegador, clique no ícone de menu (três pontos)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-2 mt-0.5">2</span>
                <span>Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-2 mt-0.5">3</span>
                <span>Confirme a instalação quando solicitado</span>
              </li>
            </ol>
            
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Voltar para o aplicativo
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DownloadApp;
