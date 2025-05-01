
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getGroupFeed } from '@/lib/supabase/groups';

interface GroupFeedProps {
  groupId: string;
  userId: string;
}

export default function GroupFeed({ groupId, userId }: GroupFeedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { data, error } = await getGroupFeed(groupId);
        
        if (error) {
          throw error;
        }
        
        setPosts(data || []);
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
  
  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              Nenhuma publicação neste grupo ainda. Seja o primeiro a compartilhar algo!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {post.user?.photo_url && (
                <img 
                  src={post.user.photo_url} 
                  alt={post.user.name} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium">{post.user?.name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            {post.content && <p className="mb-4">{post.content}</p>}
            
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt="Imagem do post" 
                className="w-full h-auto rounded-md mb-4 max-h-96 object-contain"
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
