
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GroupFeedProps {
  groupId: string;
  userId: string;
}

export default function GroupFeed({ groupId, userId }: GroupFeedProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading group feed:', err);
        toast.error('Erro ao carregar o feed do grupo');
        setIsLoading(false);
      }
    };

    if (groupId) {
      loadInitialData();
    }
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center mb-4">
            Feed temporariamente desativado para manutenção.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
